const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const zipPath = path.join(process.env.LOCALAPPDATA, 'Temp', 'supabase.zip');
const extractDir = path.join(process.env.LOCALAPPDATA, 'supabase-cli');

// Check zip size
const stats = fs.statSync(zipPath);
console.log('ZIP size:', stats.size, 'bytes');

if (stats.size < 1000) {
  console.error('ZIP too small — download failed');
  process.exit(1);
}

// Extract using PowerShell
console.log('Extracting to:', extractDir);
fs.mkdirSync(extractDir, { recursive: true });

execSync(`powershell -Command "Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::ExtractToDirectory('${zipPath.replace(/\\/g, '\\\\')}', '${extractDir.replace(/\\/g, '\\\\')}')"`, {
  stdio: 'inherit'
});

const files = fs.readdirSync(extractDir);
console.log('Extracted files:', files);

const exePath = path.join(extractDir, 'supabase.exe');
if (fs.existsSync(exePath)) {
  console.log('SUCCESS: supabase.exe found at', exePath);
  // Test it
  try {
    const version = execSync(`"${exePath}" --version`, { encoding: 'utf8' });
    console.log('Version:', version.trim());
  } catch(e) { console.log('Version check error:', e.message); }
} else {
  console.log('Files in dir:', fs.readdirSync(extractDir));
}
