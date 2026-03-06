import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qjorborwblqpdtdfpmpm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqb3Jib3J3YmxxcGR0ZGZwbXBtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NjM2MzksImV4cCI6MjA4ODAzOTYzOX0.A1d3dlOVssXYk3_UIS8DMSN2wu0Ut9I5QmbFeI7lcOs';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: reservas, error } = await supabase
    .from('reservas')
    .select('*, habitaciones:habitaciones_reserva(*)');
    
  if (error) {
    console.error(error);
    return;
  }
  
  console.log("=========================================");
  reservas.forEach(r => {
    // calculate dates diff
    // The exact function uses date-fns differenceInDays
    // Which truncates, but since dates are YYYY-MM-DD it's the exact day diff
    const start = new Date(r.fecha_entrada);
    const end = new Date(r.fecha_salida);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.max(0, Math.round(diffTime / (1000 * 60 * 60 * 24)));
    
    let totalRooms = 0;
    r.habitaciones.forEach(h => {
        totalRooms += (h.precio_por_habitacion || 0) * (h.numero_habitaciones || 0) * diffDays;
    });
    
    // Check if it matches
    const expectedFinal = (r.precio_total_manual !== undefined && r.precio_total_manual !== null) 
                          ? r.precio_total_manual 
                          : totalRooms;
                          
    const isOkCalc = totalRooms === r.precio_total_calculado;
    const isOkFinal = expectedFinal === r.precio_total_final;
    
    console.log(`Alojamiento: ${r.alojamiento_nombre || 'Sin nombre'}`);
    console.log(`-> Noches: ${diffDays}`);
    console.log(`-> Precio Calculado (Teórico): ${totalRooms}€`);
    console.log(`-> Precio Calculado (En DB): ${r.precio_total_calculado}€ [${isOkCalc ? 'CORRECTO' : 'X ERROR'}]`);
    console.log(`-> Precio Manual (En DB): ${r.precio_total_manual !== null ? r.precio_total_manual + '€' : 'No establecido'}`);
    console.log(`-> Precio Final (En DB): ${r.precio_total_final}€ [${isOkFinal ? 'CORRECTO' : 'X ERROR'}]`);
    console.log("-----------------------------------------");
  });
}

check();
