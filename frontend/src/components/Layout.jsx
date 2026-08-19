import React, { useState, useEffect } from 'react';
import { 
  Activity, ShieldAlert, FileText, PlusCircle, Users, BarChart3, 
  Settings, LogOut, Radio, User, BedDouble, Microscope, PlaneTakeoff, 
  ShieldAlert as AlertIcon, Terminal, Sun, Moon, Layers
} from 'lucide-react';
import { clearSession } from '../utils/auth';

const Layout = ({ currentUser, onLogout, activeTab, setActiveTab, children, activeAlertsCount, alerts = [] }) => {
  const [showProfile, setShowProfile] = useState(false);
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved;
    return 'dark'; // Command Center defaults to dark
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const menuItems = [
    { id: 'dashboard', name: 'Global Dashboard', icon: Activity },
    { id: 'surveillance', name: 'Disease Surveillance', icon: FileText },
    { id: 'hospitals', name: 'Hospital Manager', icon: BedDouble },
    { id: 'labs', name: 'Laboratory Portal', icon: Microscope },
    { id: 'airports', name: 'Airport & Borders', icon: PlaneTakeoff },
    { id: 'analytics', name: 'Analytics Board', icon: BarChart3 },
    { id: 'emergency', name: 'Emergency Response', icon: Radio },
    { id: 'simulator', name: 'Outbreak Simulator', icon: ShieldAlert },
    { id: 'devops', name: 'DevOps Command', icon: Terminal },
    { id: 'admin', name: 'Admin Portal', icon: Settings, adminOnly: true }
  ];

  const filteredMenuItems = menuItems.filter(item => !item.adminOnly || (currentUser && currentUser.role === 'admin'));

  const activeAlertList = Array.isArray(alerts) ? alerts.filter(a => a.status === 'Active') : [];
  const hasRegionOutage = activeAlertList.some(a => a.title.includes('CLOUD-REGION OUTAGE') || a.title.includes('OUTAGE'));
  const hasCyberattack = activeAlertList.some(a => a.title.includes('CYBER-ATTACK') || a.title.includes('DDoS'));
  const hasDataCorruption = activeAlertList.some(a => a.title.includes('DATA INTEGRITY') || a.title.includes('CORRUPTION'));
  const hasOverload = activeAlertList.some(a => a.title.includes('ANALYTICS ENGINE OVERLOAD') || a.title.includes('OVERLOAD'));

  // Define status fields matching request: Docker, Kubernetes, Jenkins, MongoDB, API
  const dockerStatus = hasRegionOutage 
    ? { status: 'DEGRADED', color: 'text-status-red font-bold', dot: 'bg-status-red animate-pulse' } 
    : { status: 'HEALTHY', color: 'text-status-green font-bold', dot: 'bg-status-green animate-pulse' };

  const k8sStatus = hasRegionOutage 
    ? { status: 'FAILOVER ACTIVE', color: 'text-status-orange font-bold', dot: 'bg-status-orange animate-pulse' } 
    : { status: 'HEALTHY', color: 'text-status-green font-bold', dot: 'bg-status-green animate-pulse' };

  const jenkinsStatus = hasCyberattack 
    ? { status: 'LOCKED', color: 'text-status-amber font-bold', dot: 'bg-status-amber animate-pulse' } 
    : { status: 'STABLE', color: 'text-status-green font-bold', dot: 'bg-status-green animate-pulse' };

  const mongoStatus = hasDataCorruption 
    ? { status: 'CORRUPTED', color: 'text-status-red font-bold', dot: 'bg-status-red animate-pulse' } 
    : { status: 'ONLINE', color: 'text-status-green font-bold', dot: 'bg-status-green animate-pulse' };

  const apiStatus = hasOverload 
    ? { status: 'OVERLOADED', color: 'text-status-orange font-bold', dot: 'bg-status-orange animate-pulse' } 
    : (hasCyberattack 
        ? { status: 'FILTERING', color: 'text-status-amber font-bold', dot: 'bg-status-amber animate-pulse' } 
        : { status: 'ONLINE', color: 'text-status-green font-bold', dot: 'bg-status-green animate-pulse' });

  return (
    <div className="min-h-screen flex bg-theme-bg text-theme-text font-sans transition-colors duration-300">
      {/* SIDEBAR */}
      <aside className="w-64 bg-theme-card border-r border-theme-border flex flex-col flex-shrink-0 transition-colors duration-300">
        {/* LOGO */}
        <div className="h-16 flex items-center px-6 border-b border-theme-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-theme-accent flex items-center justify-center shadow-md shadow-emerald-500/20">
              <span className="text-lg text-white">🩺</span>
            </div>
            <div>
              <span className="font-bold text-lg tracking-wider font-mono text-theme-accent">GLOBALMEDX</span>
              <p className="text-[10px] text-theme-text-sec font-semibold tracking-widest uppercase">Pandemic Surveillance</p>
            </div>
          </div>
        </div>

        {/* NAVIGATION LINKS */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-250 ${
                  isActive 
                    ? 'bg-emerald-500/10 text-theme-accent border-l-4 border-theme-accent pl-3' 
                    : 'text-theme-text-sec hover:bg-theme-card-hover hover:text-theme-text'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-theme-accent' : 'text-theme-text-sec'}`} />
                {item.name}
                {item.id === 'simulator' && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-status-orange alert-dot-blink" />
                )}
              </button>
            );
          })}
        </nav>

        {/* LOGGED USER CARD */}
        <div className="p-4 border-t border-theme-border">
          <div className="flex items-center gap-3 bg-theme-card-hover p-3 rounded-xl border border-theme-border transition-colors duration-300">
            <div className="w-9 h-9 rounded-full bg-theme-bg flex items-center justify-center font-bold text-theme-text uppercase">
              {currentUser ? currentUser.name[0] : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-theme-text truncate">{currentUser?.name}</p>
              <p className="text-[10px] text-theme-text-sec font-mono capitalize truncate">{currentUser?.role}</p>
            </div>
            <button 
              onClick={() => {
                clearSession();
                onLogout();
              }}
              className="text-theme-text-sec hover:text-status-red p-1.5 rounded-lg hover:bg-status-red-bg transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* HEADER */}
        <header className="h-16 bg-theme-card border-b border-theme-border flex items-center justify-between px-8 z-10 flex-shrink-0 transition-colors duration-300">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-status-green animate-pulse" />
              <span className="text-xs text-theme-text-sec font-semibold uppercase tracking-wider">Surveillance Online</span>
            </div>
            {activeAlertsCount > 0 && (
              <button 
                onClick={() => {
                  setActiveTab('dashboard');
                  setTimeout(() => {
                    const el = document.getElementById('emergency-bulletins');
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      el.classList.add('ring-4', 'ring-status-red', 'ring-offset-4', 'ring-offset-theme-bg', 'scale-[1.02]');
                      setTimeout(() => {
                        el.classList.remove('ring-4', 'ring-status-red', 'ring-offset-4', 'ring-offset-theme-bg', 'scale-[1.02]');
                      }, 2000);
                    }
                  }, 100);
                }}
                className="flex items-center gap-1.5 bg-status-red-bg hover:bg-red-500/20 border border-status-red-border px-3 py-1 rounded-full text-xs font-bold text-status-red alert-dot-blink cursor-pointer transition-all active:scale-95"
              >
                <AlertIcon className="w-3.5 h-3.5" />
                <span>{activeAlertsCount} ACTIVE SURVEILLANCE ALERTS</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* THEME TOGGLE BUTTON */}
            <button 
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-theme-bg border border-theme-border text-theme-text-sec hover:bg-theme-card-hover transition-all flex items-center justify-center focus:outline-none"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="w-4.5 h-4.5 text-status-amber" /> : <Moon className="w-4.5 h-4.5 text-theme-text-sec" />}
            </button>

            <div className="h-6 border-l border-theme-border" />

            <div className="relative">
              <button 
                onClick={() => setShowProfile(!showProfile)}
                className="flex items-center gap-2 text-sm text-theme-text-sec hover:text-theme-text transition-colors focus:outline-none"
              >
                <span className="w-2 h-2 rounded-full bg-theme-accent" />
                <span className="font-semibold">{currentUser?.email}</span>
                <User className="w-4 h-4 text-theme-text-sec" />
              </button>
              {showProfile && (
                <div className="absolute right-0 mt-2 w-48 bg-theme-card rounded-xl border border-theme-border shadow-lg py-1 text-sm text-theme-text-sec z-50 transition-colors duration-300">
                  <div className="px-4 py-2 border-b border-theme-border">
                    <p className="text-xs text-theme-text-sec">Authenticated Session</p>
                    <p className="font-semibold truncate text-theme-text">{currentUser?.name}</p>
                  </div>
                  <button 
                    onClick={() => {
                      clearSession();
                      onLogout();
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-theme-card-hover hover:text-status-red flex items-center gap-2 transition-colors"
                  >
                    <LogOut className="w-4.5 h-4.5" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* INFRASTRUCTURE STATUS RIBBON */}
        <div className="bg-theme-card border-b border-theme-border px-8 py-2.5 flex items-center gap-6 overflow-x-auto text-[10px] font-mono whitespace-nowrap z-10 transition-colors duration-300 shadow-sm">
          <span className="text-theme-text-sec font-bold uppercase tracking-wider text-[9px] border-r border-theme-border pr-4 flex items-center gap-1.5 flex-shrink-0">
            <Layers className="w-3.5 h-3.5 text-theme-text-sec" />
            Infra Telemetry:
          </span>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${dockerStatus.dot}`} />
              <span className="text-theme-text-sec font-bold uppercase">Docker:</span>
              <span className={dockerStatus.color}>{dockerStatus.status}</span>
            </div>
            <span className="text-theme-border font-light">|</span>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${k8sStatus.dot}`} />
              <span className="text-theme-text-sec font-bold uppercase">Kubernetes:</span>
              <span className={k8sStatus.color}>{k8sStatus.status}</span>
            </div>
            <span className="text-theme-border font-light">|</span>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${jenkinsStatus.dot}`} />
              <span className="text-theme-text-sec font-bold uppercase">Jenkins:</span>
              <span className={jenkinsStatus.color}>{jenkinsStatus.status}</span>
            </div>
            <span className="text-theme-border font-light">|</span>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${mongoStatus.dot}`} />
              <span className="text-theme-text-sec font-bold uppercase">MongoDB:</span>
              <span className={mongoStatus.color}>{mongoStatus.status}</span>
            </div>
            <span className="text-theme-border font-light">|</span>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${apiStatus.dot}`} />
              <span className="text-theme-text-sec font-bold uppercase">API Status:</span>
              <span className={apiStatus.color}>{apiStatus.status}</span>
            </div>
          </div>
        </div>

        {/* PAGE BODY */}
        <main className="flex-1 overflow-y-auto p-8 bg-theme-bg transition-colors duration-300">
          <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
