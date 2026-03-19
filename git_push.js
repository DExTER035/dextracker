const { execSync } = require('child_process');
const git = '"C:\\Program Files\\Git\\bin\\git.exe"';
const cwd = 'C:\\Users\\insan\\OneDrive\\Desktop\\dextracker';
const opts = { cwd, stdio: 'inherit' };
try {
  execSync(`${git} add frontend/ supabase/`, opts);
  execSync(`${git} commit -m "fix: service worker v4 - never cache index.html, clears stale caches"`, opts);
  execSync(`${git} push origin master`, opts);
  console.log('Pushed!');
} catch(e) {
  console.log('Push failed or nothing to commit:', e.message);
}
