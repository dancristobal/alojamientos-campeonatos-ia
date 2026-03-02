-- Archery Tournament Reservation Management Schema

-- Enums
CREATE TYPE estado_campeonato AS ENUM ('abierto', 'cerrado');
CREATE TYPE estado_reserva AS ENUM ('activa', 'cancelada', 'vencida', 'finalizada');
CREATE TYPE tipo_habitacion AS ENUM ('doble', 'individual');

-- Tables
CREATE TABLE IF NOT EXISTS campeonatos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    fecha DATE NOT NULL,
    fecha_fin DATE, -- Nuevo campo
    localidad TEXT NOT NULL,
    numero_personas INTEGER NOT NULL DEFAULT 1,
    estado estado_campeonato NOT NULL DEFAULT 'abierto',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reservas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campeonato_id UUID NOT NULL REFERENCES campeonatos(id) ON DELETE CASCADE,
    alojamiento_nombre TEXT,
    fecha_entrada DATE NOT NULL,
    fecha_salida DATE NOT NULL,
    fecha_cancelacion DATE,
    es_reembolsable BOOLEAN NOT NULL DEFAULT true,
    estado estado_reserva NOT NULL DEFAULT 'activa',
    precio_total_manual NUMERIC(10, 2),
    precio_total_calculado NUMERIC(10, 2) NOT NULL DEFAULT 0,
    precio_total_final NUMERIC(10, 2) NOT NULL DEFAULT 0,
    enlace_web TEXT,
    observaciones TEXT, -- Nuevo campo
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS habitaciones_reserva (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reserva_id UUID NOT NULL REFERENCES reservas(id) ON DELETE CASCADE,
    tipo tipo_habitacion NOT NULL,
    numero_habitaciones INTEGER NOT NULL DEFAULT 1,
    precio_por_habitacion NUMERIC(10, 2) NOT NULL DEFAULT 0
);

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_reservas_campeonato ON reservas(campeonato_id);
CREATE INDEX IF NOT EXISTS idx_habitaciones_reserva ON habitaciones_reserva(reserva_id);

CREATE TABLE IF NOT EXISTS configuracion (
    id TEXT PRIMARY KEY,
    valor JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Initial configuration
INSERT INTO configuracion (id, valor) 
VALUES ('general', '{"umbrales": {"proxima": 7, "critica": 3}, "usuario": {"nombre": "Daniel Cristobal", "rol": "Admin"}, "email_notificaciones": "daniel@example.com"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies (Enable public access for MVP)
ALTER TABLE configuracion ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir lectura pública de configuración" ON configuracion FOR SELECT USING (true);
CREATE POLICY "Permitir actualización pública de configuración" ON configuracion FOR ALL USING (true) WITH CHECK (true);

-- Logical Trigger for Automatic Calculations (Optional, can be done in Frontend, but better in DB for consistency)
-- For the MVP, we will rely on frontend calculations but keep the fields ready.

-- Function to check if a tournament is closed before modifications
CREATE OR REPLACE FUNCTION check_campeonato_status()
RETURNS TRIGGER AS $$
BEGIN
    IF (SELECT estado FROM campeonatos WHERE id = COALESCE(NEW.campeonato_id, OLD.campeonato_id)) = 'cerrado' THEN
        RAISE EXCEPTION 'No se puede modificar una reserva de un campeonato cerrado.';
    END IF;
    IF (TG_OP = 'DELETE') THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Applying the lock trigger to reservas
CREATE TRIGGER trg_check_reserva_status
BEFORE INSERT OR UPDATE OR DELETE ON reservas
FOR EACH ROW EXECUTE FUNCTION check_campeonato_status();

-- Applying the lock trigger to habitaciones
CREATE OR REPLACE FUNCTION check_habitacion_campeonato_status()
RETURNS TRIGGER AS $$
DECLARE
    target_campeonato_id UUID;
BEGIN
    SELECT campeonato_id INTO target_campeonato_id FROM reservas WHERE id = COALESCE(NEW.reserva_id, OLD.reserva_id);
    IF (SELECT estado FROM campeonatos WHERE id = target_campeonato_id) = 'cerrado' THEN
        RAISE EXCEPTION 'No se puede modificar habitaciones de un campeonato cerrado.';
    END IF;
    IF (TG_OP = 'DELETE') THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_habitacion_status
BEFORE INSERT OR UPDATE OR DELETE ON habitaciones_reserva
FOR EACH ROW EXECUTE FUNCTION check_habitacion_campeonato_status();

-- --------------------------------------------------------
-- AUTOMATION: pg_cron and Edge Function Trigger
-- --------------------------------------------------------

-- Install pg_cron extension if possible (usually enabled by default in Supabase)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the check-cancellations function to run every day at 08:00 AM
-- Note: Replace 'YOUR_PROJECT_REF' with your actual Supabase project reference
-- and 'YOUR_SERVICE_ROLE_KEY' with your service role key in the Supabase Dashboard.


SELECT cron.schedule(
  'check-daily-cancellations',
  '0 8 * * *',
  $$
  SELECT
    net.http_post(
      url:='https://qjorborwblqpdtdfpmpm.supabase.co/functions/v1/check-cancellations',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer sb_publishable_RcuYcQq-vTjci2snonLUaw_4N1xbLHM"}'::jsonb,
      body:='{}'::jsonb
    ) as request_id;
  $$
);

