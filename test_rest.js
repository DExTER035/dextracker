const demoEmail = 'demo@dextracker-tau.vercel.app';
const demoPass = 'DemoUser2024!';
const SUPABASE_URL = 'https://qscirujupsjypjjilppr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzY2lydWp1cHNqeXBqamlscHByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1MDQyOTAsImV4cCI6MjA4OTA4MDI5MH0.K1fphnjiqDwZwLgm0G3iH1nrnCcopdLwKuyRi_msI8I';

async function test() {
  console.log('Testing Demo Login to Supabase directly...');
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: demoEmail, password: demoPass })
    });
    console.log('Login Response:', res.status, await res.json());

    if (res.status !== 200) {
      console.log('Testing SignUp...');
      const res2 = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: demoEmail, password: demoPass, data: { full_name: 'Demo User' } })
      });
      console.log('Signup Response:', res2.status, await res2.json());
    }
  } catch (err) {
    console.error(err);
  }
}
test();
