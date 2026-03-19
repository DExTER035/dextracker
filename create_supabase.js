const https = require('https');

const TOKEN = 'sbp_b49f0165121a6ad530c832f9e3a020f5ef035634';
const ORG_ID = 'djwqntqqemxungjckbty';

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
  console.log('Step 1: Verify token by listing organizations...');
  const orgs = await apiCall('GET', '/organizations');
  console.log('Orgs status:', orgs.status);
  if (orgs.status !== 200) {
    console.error('Token invalid or error:', JSON.stringify(orgs.data));
    process.exit(1);
  }
  console.log('Organizations:', JSON.stringify(orgs.data));

  console.log('\nStep 2: Create dextrack project...');
  const create = await apiCall('POST', '/projects', {
    name: 'dextrack',
    organization_id: ORG_ID,
    db_pass: 'DexTrack2024!',
    region: 'ap-southeast-1',
    plan: 'free'
  });
  console.log('Create status:', create.status);
  console.log('Create response:', JSON.stringify(create.data, null, 2));

  if (create.status !== 201 && create.status !== 200) {
    console.error('Failed to create project');
    process.exit(1);
  }

  const proj = create.data;
  const ref = proj.id || proj.ref;
  console.log('\nProject ref:', ref);
  console.log('Project URL: https://' + ref + '.supabase.co');

  // Wait for project to be ready
  console.log('\nWaiting 30s for project to provision...');
  await new Promise(r => setTimeout(r, 30000));

  console.log('\nStep 3: Get API keys...');
  const keys = await apiCall('GET', `/projects/${ref}/api-keys`);
  console.log('Keys status:', keys.status);
  console.log('Keys:', JSON.stringify(keys.data, null, 2));

  if (keys.status === 200) {
    const anon = keys.data.find(k => k.name === 'anon');
    const service = keys.data.find(k => k.name === 'service_role');
    console.log('\n=== RESULTS ===');
    console.log('VITE_SUPABASE_URL=https://' + ref + '.supabase.co');
    console.log('VITE_SUPABASE_ANON_KEY=' + (anon?.api_key || anon?.key || 'NOT FOUND'));
    console.log('SERVICE_ROLE_KEY=' + (service?.api_key || service?.key || 'NOT FOUND'));
  }
}

main().catch(console.error);
