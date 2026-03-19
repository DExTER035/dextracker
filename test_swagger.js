const SUPABASE_URL = 'https://qscirujupsjypjjilppr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzY2lydWp1cHNqeXBqamlscHByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1MDQyOTAsImV4cCI6MjA4OTA4MDI5MH0.K1fphnjiqDwZwLgm0G3iH1nrnCcopdLwKuyRi_msI8I';

async function test() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/?apikey=${SUPABASE_ANON_KEY}`);
  const spec = await res.json();
  console.log(spec.definitions.profiles ? Object.keys(spec.definitions.profiles.properties) : spec.components?.schemas?.profiles?.properties);
}
test();
