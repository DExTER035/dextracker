const fs = require('fs');
const path = require('path');
const base = 'C:/Users/insan/OneDrive/Desktop/dextracker/frontend/src';

const files = [
  'sections/Dashboard.jsx','sections/Life.jsx','sections/Study.jsx',
  'sections/Track.jsx','sections/Settings.jsx','sections/Social.jsx',
  'sections/Daily.jsx','sections/DexAI.jsx','components/DexCommand.jsx',
  'components/Sidebar.jsx','components/Login.jsx','components/Topbar.jsx','App.jsx'
];

const replacements = [
  [/#1de9ff0[a8]/g, '#ffffff0a'],
  [/#1de9ff22/g, '#ffffff18'],
  [/#1de9ff44/g, '#ffffff20'],
  [/#1de9ff/g, '#e2e8f0'],
  [/rgba\(29,233,255,[^)]+\)/g, 'rgba(255,255,255,0.06)'],
  [/#7c3aed/g, '#64748b'],
  [/#8b5cf6/g, '#94a3b8'],
  [/#a78bfa/g, '#94a3b8'],
  [/#06b6d4/g, '#8a9ab5'],
  [/#1a2235/g, '#0d1020'],
];

files.forEach(f => {
  const fp = path.join(base, f);
  if (!fs.existsSync(fp)) { console.log('skip: ' + f); return; }
  let c = fs.readFileSync(fp, 'utf8');
  replacements.forEach(([from, to]) => { c = c.replace(from, to); });
  fs.writeFileSync(fp, c);
  console.log('done: ' + f);
});
console.log('All colors replaced!');
