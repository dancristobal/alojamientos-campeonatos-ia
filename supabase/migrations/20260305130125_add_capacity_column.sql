-- Add capacidad column to habitaciones_reserva
ALTER TABLE public.habitaciones_reserva ADD COLUMN capacidad integer;

-- Initialize capacidad based on tipo
UPDATE public.habitaciones_reserva 
SET capacidad = 2 
WHERE tipo = 'doble';

UPDATE public.habitaciones_reserva 
SET capacidad = 1 
WHERE tipo = 'individual';

-- Set default for future inserts (optional but good for consistency)
ALTER TABLE public.habitaciones_reserva ALTER COLUMN capacidad SET DEFAULT 2;
