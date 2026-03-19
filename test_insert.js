const SUPABASE_URL = 'https://qscirujupsjypjjilppr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzY2lydWp1cHNqeXBqamlscHByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1MDQyOTAsImV4cCI6MjA4OTA4MDI5MH0.K1fphnjiqDwZwLgm0G3iH1nrnCcopdLwKuyRi_msI8I';

async function test() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        id: '2c035622-03df-4993-9d41-36ba906ec821', // random valid uuid
        name: 'Test',
        avatar: null,
        tag: 'ABCDE'
      })
    });
    console.log(res.status, await res.json());
  } catch (err) {
    console.error(err);
  }
}
test();
