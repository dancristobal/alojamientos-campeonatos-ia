import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qjorborwblqpdtdfpmpm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqb3Jib3J3YmxxcGR0ZGZwbXBtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NjM2MzksImV4cCI6MjA4ODAzOTYzOX0.A1d3dlOVssXYk3_UIS8DMSN2wu0Ut9I5QmbFeI7lcOs';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTime() {
  const { data, error } = await supabase.rpc('get_server_time');
  if (error) {
    // If RPC doesn't exist, try getting it via a simple select if possible,
    // although PostgREST doesn't usually allow random SQL.
    // Let's try to query a table and check the headers or a timestamp field.
    const { data: config, error: configError } = await supabase
      .from('configuracion')
      .select('updated_at')
      .limit(1)
      .single();
    
    if (configError) {
      console.error(configError);
    } else {
      console.log("Database timestamp example (UTC):", config.updated_at);
      console.log("Current Local Time:", new Date().toLocaleString());
    }
  } else {
    console.log("Server Time (RPC):", data);
  }
}

checkTime();
