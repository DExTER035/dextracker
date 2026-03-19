import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qscirujupsjypjjilppr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzY2lydWp1cHNqeXBqamlscHByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1MDQyOTAsImV4cCI6MjA4OTA4MDI5MH0.K1fphnjiqDwZwLgm0G3iH1nrnCcopdLwKuyRi_msI8I';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function test() {
  const demoEmail = 'demo@dextracker-tau.vercel.app';
  const demoPass = 'DemoUser2024!';
  console.log('Trying login...');
  let { data, error } = await supabase.auth.signInWithPassword({ email: demoEmail, password: demoPass });
  console.log('Login result:', data, error);
  
  if (error?.message?.includes('Invalid login')) {
    console.log('Trying signup...');
    ({ data, error } = await supabase.auth.signUp({ email: demoEmail, password: demoPass,
      options: { data: { full_name: 'Demo User' } }
    }));
    console.log('Signup result:', data, error);
  }
}
test();
