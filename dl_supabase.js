const https = require('https');
const fs = require('fs');
const path = require('path');

const dest = path.join(process.env.TEMP || 'C:/Windows/Temp', 'supabase.zip');
const url = 'https://github.com/supabase/cli/releases/latest/download/supabase_windows_amd64.zip';

console.log('Downloading Supabase CLI from:', url);
const file = fs.createWriteStream(dest);

function download(url) {
  https.get(url, (res) => {
    if (res.statusCode === 301 || res.statusCode === 302) {
      file.close();
      return download(res.headers.location);
    }
    res.pipe(file);
    file.on('finish', () => {
      file.close();
      console.log('Downloaded to:', dest);
      // Extract
      const { execSync } = require('child_process');
      const extractDir = 'C:/Users/insan/OneDrive/Desktop/dextracker/supabase-cli';
      fs.mkdirSync(extractDir, { recursive: true });
      execSync(`powershell -c "Expand-Archive '${dest}' '${extractDir}' -Force"`, { stdio: 'inherit' });
      console.log('Extracted to:', extractDir);
      console.log('Running: supabase login');
    });
  }).on('error', e => console.error('Error:', e.message));
}

download(url);
