// Set Supabase env vars on Vercel project
// Vercel project: dextracker-tau
const https = require('https');

// We'll use the Vercel API if we have a token, otherwise just echo instructions
const SUPABASE_URL = 'https://qscirujupsjypjjilppr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzY2lydWp1cHNqeXBqamlscHByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1MDQyOTAsImV4cCI6MjA4OTA4MDI5MH0.K1fphnjiqDwZwLgm0G3iH1nrnCcopdLwKuyRi_msI8I';

console.log('\n=== Vercel Environment Variables to Add ===');
console.log('Go to: https://vercel.com/insane2632-9661s-projects/dextracker-tau/settings/environment-variables');
console.log('\nAdd these 2 variables (for Production + Preview + Development):');
console.log('\nName: VITE_SUPABASE_URL');
console.log('Value:', SUPABASE_URL);
console.log('\nName: VITE_SUPABASE_ANON_KEY');
console.log('Value:', SUPABASE_ANON_KEY);
console.log('\nAfter adding, click "Save" and Vercel will redeploy automatically.');
