const https = require('https');

const TOKEN = 'sbp_b49f0165121a6ad530c832f9e3a020f5ef035634';
const REF = 'qscirujupsjypjjilppr';
const DB_PASS = 'DexTrack2024!';

const fs = require('fs');
const schemaSql = fs.readFileSync('supabase_schema.sql', 'utf8');
const fixSql = fs.readFileSync('fix_signup_rls.sql', 'utf8');
const SQL = schemaSql + '\n' + fixSql;

function apiCall(method, path, body) {
  return new Promise((resolve, reject) => {
    const bodyStr = body ? JSON.stringify(body) : null;
    const opts = {
      hostname: 'api.supabase.com',
      path: `/v1${path}`,
      method,
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
        ...(bodyStr ? { 'Content-Length': Buffer.byteLength(bodyStr) } : {})
      }
    };
    const req = https.request(opts, res => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, data }); }
      });
    });
    req.on('error', reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

async function main() {
  console.log('Running SQL schema via Management API...');
  const result = await apiCall('POST', `/projects/${REF}/database/query`, {
    query: SQL
  });
  console.log('SQL Status:', result.status);
  console.log('SQL Response:', JSON.stringify(result.data, null, 2));

  if (result.status === 200 || result.status === 201) {
    console.log('\n✅ Schema created successfully!');
  } else {
    console.log('\n⚠️  Try running schema via SQL Editor in Supabase dashboard');
  }
}

main().catch(console.error);
