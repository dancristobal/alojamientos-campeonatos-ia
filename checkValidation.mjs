import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qjorborwblqpdtdfpmpm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqb3Jib3J3YmxxcGR0ZGZwbXBtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NjM2MzksImV4cCI6MjA4ODAzOTYzOX0.A1d3dlOVssXYk3_UIS8DMSN2wu0Ut9I5QmbFeI7lcOs';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: reservas, error } = await supabase
    .from('reservas')
    .select('*, habitaciones:habitaciones_reserva(*), campeonatos(numero_personas, nombre)');
    
  if (error) {
    console.error(error);
    return;
  }
  
  let validItems = 0;
  let invalidItems = 0;

  console.log("=========================================");
  console.log("Comprobando límites de plazas (1 reserva <= Plazas totales)...");
  console.log("=========================================");

  reservas.forEach(r => {
    let plazasNuevaReserva = 0;
    r.habitaciones.forEach(h => {
        plazasNuevaReserva += (h.numero_habitaciones || 0) * (h.capacidad || 2);
    });
    
    const maxPlazas = r.campeonatos?.numero_personas || 0;
    const isOk = plazasNuevaReserva <= maxPlazas;

    if (isOk) validItems++;
    else invalidItems++;

    console.log(`Campeonato: ${r.campeonatos?.nombre} (Max permitidas: ${maxPlazas})`);
    console.log(`-> Alojamiento: ${r.alojamiento_nombre || 'Sin nombre'}`);
    console.log(`-> Plazas usadas en esta reserva: ${plazasNuevaReserva} [${isOk ? 'OK' : 'EXCEDE'}]`);
    console.log("-----------------------------------------");
  });

  console.log(`\nResumen: ${validItems} correctas, ${invalidItems} exceden el límite.`);
}

check();
