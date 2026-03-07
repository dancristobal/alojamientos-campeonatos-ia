import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qjorborwblqpdtdfpmpm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqb3Jib3J3YmxxcGR0ZGZwbXBtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NjM2MzksImV4cCI6MjA4ODAzOTYzOX0.A1d3dlOVssXYk3_UIS8DMSN2wu0Ut9I5QmbFeI7lcOs';
const supabase = createClient(supabaseUrl, supabaseKey);

async function debug() {
  console.log("--- CONFIGURACION ---");
  const { data: configData, error: configError } = await supabase
    .from('configuracion')
    .select('valor')
    .eq('id', 'general')
    .single();

  if (configError) {
    console.error('Error fetching config:', configError);
  } else {
    console.log('Config:', JSON.stringify(configData.valor, null, 2));
  }

  const thresholdCritica = configData?.valor?.umbrales?.critica || 3;
  const thresholdProxima = configData?.valor?.umbrales?.proxima || 7;
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  console.log("\n--- RESERVAS QUE DEBERÍAN ALERTAR ---");
  console.log("Hoy:", now.toISOString().split('T')[0]);

  const { data: reservas, error } = await supabase
    .from('reservas')
    .select('id, alojamiento_nombre, fecha_cancelacion, estado')
    .eq('estado', 'activa')
    .not('fecha_cancelacion', 'is', null);

  if (error) {
    console.error(error);
    return;
  }

  const criticas = [];
  const proximas = [];

  reservas.forEach(r => {
    const cancelDate = new Date(r.fecha_cancelacion);
    const diffTime = cancelDate.getTime() - now.getTime();
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (days >= 0 && days <= thresholdCritica) {
      criticas.push({ ...r, days });
    } else if (days > thresholdCritica && days <= thresholdProxima) {
      proximas.push({ ...r, days });
    }
  });

  console.log(`\nCRÍTICAS (<= ${thresholdCritica} días):`, criticas.length);
  criticas.forEach(r => console.log(`- ${r.alojamiento_nombre}: ${r.fecha_cancelacion} (${r.days} días)`));

  console.log(`\nPRÓXIMAS (<= ${thresholdProxima} días):`, proximas.length);
  proximas.forEach(r => console.log(`- ${r.alojamiento_nombre}: ${r.fecha_cancelacion} (${r.days} días)`));

  console.log("\n--- CRON HISTORY (if accessible) ---");
  try {
    // pg_cron tables are usually in 'cron' schema, which might not be exposed via PostgREST
    // But let's try just in case there's a view or something.
    const { data: jobs, error: jobsError } = await supabase
      .from('cron_jobs') // sometimes there are views
      .select('*');
    if (jobsError) console.log("Could not read cron_jobs view (expected for anon key)");
    else console.log("Jobs:", jobs);
  } catch (e) {}
  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/check-cancellations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({})
    });
    const result = await response.json();
    console.log("Status:", response.status);
    console.log("Result:", JSON.stringify(result, null, 2));
  } catch (err) {
    console.error("Error triggering function:", err);
  }
}

debug();
