const https = require('https');

const TOKEN = 'sbp_b49f0165121a6ad530c832f9e3a020f5ef035634';

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
  console.log('Getting all projects...');
  const projects = await apiCall('GET', '/projects');
  console.log('Projects status:', projects.status);
  console.log('Projects:', JSON.stringify(projects.data, null, 2));

  if (projects.status !== 200 || !projects.data.length) {
    console.error('No projects found'); return;
  }

  const proj = projects.data.find(p => p.name === 'dextrack') || projects.data[0];
  const ref = proj.id;
  console.log('\nProject ref:', ref);
  console.log('Project name:', proj.name);
  console.log('Project URL: https://' + ref + '.supabase.co');
  console.log('Status:', proj.status);

  console.log('\nGetting API keys...');
  const keys = await apiCall('GET', `/projects/${ref}/api-keys`);
  console.log('Keys status:', keys.status);
  console.log('Keys:', JSON.stringify(keys.data, null, 2));

  if (keys.status === 200 && Array.isArray(keys.data)) {
    const anon = keys.data.find(k => k.name === 'anon');
    const service = keys.data.find(k => k.name === 'service_role');
    console.log('\n=== COPY THESE VALUES ===');
    console.log('VITE_SUPABASE_URL=https://' + ref + '.supabase.co');
    console.log('VITE_SUPABASE_ANON_KEY=' + (anon?.api_key || 'NOT FOUND'));
    console.log('SUPABASE_SERVICE_ROLE_KEY=' + (service?.api_key || 'NOT FOUND'));
  }
}

main().catch(console.error);
