const fs = require('fs');
const path = require('path');

const files = [
  'AdminPortal.jsx', 'AirportBorder.jsx', 'EmergencyResponse.jsx',
  'HospitalManager.jsx', 'Laboratory.jsx', 'Simulator.jsx', 'Surveillance.jsx'
];

const dir = '/Users/adarshsingh/Sem 4 /Devops/globalmedx/frontend/src/components';

const replacements = [
  // Backgrounds
  { regex: /bg-white dark:bg-\[#[a-fA-F0-9]+\]/g, replacement: 'bg-theme-card' },
  { regex: /bg-slate-50 dark:bg-slate-800\/50/g, replacement: 'bg-theme-card-hover' },
  { regex: /bg-slate-50 dark:bg-slate-800\/30/g, replacement: 'bg-theme-card-hover' },
  { regex: /bg-slate-100 dark:bg-slate-800/g, replacement: 'bg-theme-bg' },
  { regex: /bg-slate-50 dark:bg-slate-900/g, replacement: 'bg-theme-bg' },
  { regex: /bg-slate-800 dark:bg-slate-800/g, replacement: 'bg-theme-bg' },
  
  // Borders
  { regex: /border-slate-200 dark:border-slate-800/g, replacement: 'border-theme-border' },
  { regex: /border-slate-100 dark:border-slate-800/g, replacement: 'border-theme-border' },
  { regex: /border-slate-300 dark:border-slate-600/g, replacement: 'border-theme-border' },
  
  // Text
  { regex: /text-slate-900 dark:text-white/g, replacement: 'text-theme-text' },
  { regex: /text-slate-800 dark:text-white/g, replacement: 'text-theme-text' },
  { regex: /text-slate-800 dark:text-slate-200/g, replacement: 'text-theme-text' },
  { regex: /text-slate-700 dark:text-slate-300/g, replacement: 'text-theme-text' },
  { regex: /text-slate-600 dark:text-slate-400/g, replacement: 'text-theme-text-sec' },
  { regex: /text-slate-500 dark:text-slate-400/g, replacement: 'text-theme-text-sec' },
  { regex: /text-slate-400 dark:text-slate-500/g, replacement: 'text-theme-text-muted' },
  
  // Accents & Statuses
  { regex: /text-teal-600 dark:text-teal-400/g, replacement: 'text-theme-accent' },
  { regex: /bg-teal-50 dark:bg-teal-900\/20/g, replacement: 'bg-theme-accent/10' },
  { regex: /bg-teal-600 hover:bg-teal-700/g, replacement: 'bg-theme-accent hover:bg-theme-accent-hover' },
  { regex: /bg-teal-500 hover:bg-teal-600/g, replacement: 'bg-theme-accent hover:bg-theme-accent-hover' },
  { regex: /focus:ring-teal-500/g, replacement: 'focus:ring-theme-accent' },
  { regex: /text-blue-600 dark:text-blue-400/g, replacement: 'text-status-blue' },
  { regex: /text-rose-600 dark:text-rose-400/g, replacement: 'text-status-red' },
  { regex: /text-emerald-600 dark:text-emerald-400/g, replacement: 'text-status-green' },
  { regex: /text-orange-600 dark:text-orange-400/g, replacement: 'text-status-orange' },
  
  { regex: /bg-emerald-100 dark:bg-emerald-900\/30 text-emerald-700 dark:text-emerald-400/g, replacement: 'bg-status-green-bg text-status-green' },
  { regex: /bg-rose-100 dark:bg-rose-900\/30 text-rose-700 dark:text-rose-400/g, replacement: 'bg-status-red-bg text-status-red' },
  { regex: /bg-amber-100 dark:bg-amber-900\/30 text-amber-700 dark:text-amber-400/g, replacement: 'bg-status-amber-bg text-status-amber' },
  { regex: /bg-orange-100 dark:bg-orange-900\/30 text-orange-700 dark:text-orange-400/g, replacement: 'bg-status-orange-bg text-status-orange' },
  { regex: /bg-blue-100 dark:bg-blue-900\/30 text-blue-700 dark:text-blue-400/g, replacement: 'bg-status-blue-bg text-status-blue' },
  { regex: /bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300/g, replacement: 'bg-theme-card-hover text-theme-text' }
];

files.forEach(file => {
  const filePath = path.join(dir, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    replacements.forEach(({regex, replacement}) => {
      content = content.replace(regex, replacement);
    });
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${file}`);
    } else {
      console.log(`No changes for ${file}`);
    }
  }
});
