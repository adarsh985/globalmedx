import fs from 'fs';
import path from 'path';

const files = [
  'AdminPortal.jsx', 'AirportBorder.jsx', 'EmergencyResponse.jsx',
  'HospitalManager.jsx', 'Laboratory.jsx', 'Simulator.jsx', 'Surveillance.jsx'
];

const dir = '/Users/adarshsingh/Sem 4 /Devops/globalmedx/frontend/src/components';

const replacements = [
  // Backgrounds
  { regex: /bg-slate-950/g, replacement: 'bg-theme-bg' },
  { regex: /bg-slate-900/g, replacement: 'bg-theme-card' },
  { regex: /bg-slate-800\/50/g, replacement: 'bg-theme-card-hover' },
  { regex: /bg-slate-800\/30/g, replacement: 'bg-theme-card-hover' },
  { regex: /bg-slate-800/g, replacement: 'bg-theme-bg' },
  { regex: /bg-slate-50/g, replacement: 'bg-theme-bg' },
  { regex: /bg-white/g, replacement: 'bg-theme-card' },
  { regex: /bg-slate-750/g, replacement: 'bg-theme-card-hover' },
  
  // Borders
  { regex: /border-slate-800/g, replacement: 'border-theme-border' },
  { regex: /border-slate-700/g, replacement: 'border-theme-border' },
  { regex: /border-slate-200/g, replacement: 'border-theme-border' },
  { regex: /border-slate-300/g, replacement: 'border-theme-border' },
  
  // Text
  { regex: /text-slate-900/g, replacement: 'text-theme-text' },
  { regex: /text-slate-800/g, replacement: 'text-theme-text' },
  { regex: /text-slate-400/g, replacement: 'text-theme-text-sec' },
  { regex: /text-slate-500/g, replacement: 'text-theme-text-muted' },
  { regex: /text-slate-300/g, replacement: 'text-theme-text' },
  { regex: /text-slate-200/g, replacement: 'text-theme-text' },
  { regex: /text-white/g, replacement: 'text-theme-text' },
  
  // Accents & Statuses (only generic dark mode overrides to remove)
  { regex: /text-teal-400/g, replacement: 'text-theme-accent' },
  { regex: /text-teal-600/g, replacement: 'text-theme-accent' },
  { regex: /text-emerald-400/g, replacement: 'text-status-green' },
  { regex: /text-emerald-500/g, replacement: 'text-status-green' },
  { regex: /text-emerald-600/g, replacement: 'text-status-green' },
  { regex: /text-blue-400/g, replacement: 'text-status-blue' },
  { regex: /text-blue-500/g, replacement: 'text-status-blue' },
  { regex: /text-rose-400/g, replacement: 'text-status-red' },
  { regex: /text-rose-500/g, replacement: 'text-status-red' },
  { regex: /text-amber-400/g, replacement: 'text-status-amber' },
  { regex: /text-amber-500/g, replacement: 'text-status-amber' },
  { regex: /text-orange-400/g, replacement: 'text-status-orange' },
  { regex: /text-orange-500/g, replacement: 'text-status-orange' },
  { regex: /text-purple-400/g, replacement: 'text-theme-accent' },
  { regex: /text-purple-500/g, replacement: 'text-theme-accent' },
  
  // Backrgounds of accents
  { regex: /bg-emerald-500\/10/g, replacement: 'bg-status-green-bg' },
  { regex: /bg-emerald-500\/20/g, replacement: 'bg-status-green-bg' },
  { regex: /bg-emerald-600/g, replacement: 'bg-status-green' },
  { regex: /bg-rose-500\/10/g, replacement: 'bg-status-red-bg' },
  { regex: /bg-rose-500\/20/g, replacement: 'bg-status-red-bg' },
  { regex: /bg-blue-500\/10/g, replacement: 'bg-status-blue-bg' },
  { regex: /bg-amber-500\/10/g, replacement: 'bg-status-amber-bg' },
  { regex: /bg-orange-500\/10/g, replacement: 'bg-status-orange-bg' },
  { regex: /bg-purple-500\/10/g, replacement: 'bg-theme-accent/10' },

  // Interactive
  { regex: /hover:bg-slate-800/g, replacement: 'hover:bg-theme-card-hover' },
  { regex: /hover:bg-slate-700/g, replacement: 'hover:bg-theme-card-hover' },
  { regex: /hover:text-white/g, replacement: 'hover:text-theme-text' }
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
