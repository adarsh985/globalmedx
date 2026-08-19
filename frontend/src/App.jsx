import React, { useState, useEffect } from 'react';
import { 
  authAPI, dashboardAPI, reportAPI, hospitalAPI, 
  labAPI, airportAPI, analyticsAPI, alertAPI, simulationAPI, adminAPI 
} from './utils/api';
import { setSession, clearSession, getCurrentUser, isAuthenticated } from './utils/auth';
import Layout from './components/Layout';
import GlobalDashboard from './components/GlobalDashboard';
import Surveillance from './components/Surveillance';
import HospitalManager from './components/HospitalManager';
import Laboratory from './components/Laboratory';
import AirportBorder from './components/AirportBorder';
import Analytics from './components/Analytics';
import EmergencyResponse from './components/EmergencyResponse';
import Simulator from './components/Simulator';
import AdminPortal from './components/AdminPortal';
import DevopsDashboard from './components/DevopsDashboard';
import { Activity, ShieldCheck, Loader2 } from 'lucide-react';

const App = () => {
  const [auth, setAuth] = useState(isAuthenticated());
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);

  // Application Data States
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [labs, setLabs] = useState([]);
  const [airports, setAirports] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [resources, setResources] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [users, setUsers] = useState([]);
  const [health, setHealth] = useState(null);

  // Login Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Load all data from API
  const loadData = async () => {
    if (!isAuthenticated()) return;
    setLoading(true);
    try {
      const statsRes = await dashboardAPI.getStats();
      if (statsRes.data.success) setStats(statsRes.data.data);

      const reportsRes = await reportAPI.getReports();
      if (reportsRes.data.success) setReports(reportsRes.data.data);

      const hospitalsRes = await hospitalAPI.getHospitals();
      if (hospitalsRes.data.success) setHospitals(hospitalsRes.data.data);

      const labsRes = await labAPI.getLabs();
      if (labsRes.data.success) setLabs(labsRes.data.data);

      const airportsRes = await airportAPI.getAirports();
      if (airportsRes.data.success) setAirports(airportsRes.data.data);

      const analyticsRes = await analyticsAPI.getSummary();
      if (analyticsRes.data.success) setAnalytics(analyticsRes.data.data);

      const alertsRes = await alertAPI.getAlerts();
      if (alertsRes.data.success) setAlerts(alertsRes.data.data);

      const healthRes = await adminAPI.getHealth();
      if (healthRes.data.success) setHealth(healthRes.data.data);

      // Logged user specific loads
      const user = getCurrentUser();
      if (user && (user.role === 'admin' || user.role === 'officer')) {
        const resRes = await adminAPI.getResources();
        if (resRes.data.success) setResources(resRes.data.data);

        const incRes = await adminAPI.getIncidents();
        if (incRes.data.success) setIncidents(incRes.data.data);
      }

      if (user && user.role === 'admin') {
        const usersRes = await adminAPI.getUsers();
        if (usersRes.data.success) setUsers(usersRes.data.data);
      }
    } catch (error) {
      console.error('Error loading application dataset:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auth) {
      loadData();
    }
  }, [auth]);

  // Handle user login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      const response = await authAPI.login({ email, password });
      if (response.data.success) {
        setSession(response.data.token, response.data.user);
        setCurrentUser(response.data.user);
        setAuth(true);
        setActiveTab('dashboard');
      }
    } catch (err) {
      setLoginError(err.response?.data?.message || 'Login connection failed. Try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    clearSession();
    setCurrentUser(null);
    setAuth(false);
  };

  // --- CRUD DISPATCHERS ---

  // Reports CRUD
  const handleAddReport = async (data) => {
    try {
      await reportAPI.createReport(data);
      loadData();
    } catch (e) { console.error(e); }
  };

  const handleUpdateReport = async (id, data) => {
    try {
      await reportAPI.updateReport(id, data);
      loadData();
    } catch (e) { console.error(e); }
  };

  const handleDeleteReport = async (id) => {
    try {
      await reportAPI.deleteReport(id);
      loadData();
    } catch (e) { console.error(e); }
  };

  // Hospital CRUD
  const handleRegisterHospital = async (data) => {
    try {
      await hospitalAPI.registerHospital(data);
      loadData();
    } catch (e) { console.error(e); }
  };

  const handleUpdateHospital = async (id, data) => {
    try {
      await hospitalAPI.updateHospital(id, data);
      loadData();
    } catch (e) { console.error(e); }
  };

  const handleDeleteHospital = async (id) => {
    try {
      await hospitalAPI.deleteHospital(id);
      loadData();
    } catch (e) { console.error(e); }
  };

  // Laboratory CRUD
  const handleRegisterLab = async (data) => {
    try {
      await labAPI.registerLab(data);
      loadData();
    } catch (e) { console.error(e); }
  };

  const handleUpdateLab = async (id, data) => {
    try {
      await labAPI.updateLab(id, data);
      loadData();
    } catch (e) { console.error(e); }
  };

  const handleDeleteLab = async (id) => {
    try {
      await labAPI.deleteLab(id);
      loadData();
    } catch (e) { console.error(e); }
  };

  // Airport CRUD
  const handleAddAirportLog = async (data) => {
    try {
      await airportAPI.createLog(data);
      loadData();
    } catch (e) { console.error(e); }
  };

  const handleUpdateAirportLog = async (id, data) => {
    try {
      await airportAPI.updateLog(id, data);
      loadData();
    } catch (e) { console.error(e); }
  };

  const handleDeleteAirportLog = async (id) => {
    try {
      await airportAPI.deleteLog(id);
      loadData();
    } catch (e) { console.error(e); }
  };

  // Resource Allocator
  const handleUpdateResource = async (id, data) => {
    try {
      await adminAPI.updateResource(id, data);
      loadData();
    } catch (e) { console.error(e); }
  };

  // Incident Updater
  const handleUpdateIncident = async (id, data) => {
    try {
      await adminAPI.updateIncident(id, data);
      loadData();
    } catch (e) { console.error(e); }
  };

  // Alert Resolve/Dismiss
  const handleResolveAlert = async (id) => {
    try {
      await alertAPI.updateAlert(id, { status: 'Resolved' });
      loadData();
    } catch (e) { console.error(e); }
  };

  // Simulation Event Dispatcher
  const handleTriggerSimulation = async (type, country, disease) => {
    try {
      const response = await simulationAPI.trigger(type, country, disease);
      await loadData();
      return response.data.message;
    } catch (err) {
      throw err;
    }
  };

  // --- RENDER ROUTER TABS ---
  const renderTabContent = () => {
    if (loading && !stats) {
      return (
        <div className="h-96 flex flex-col items-center justify-center text-theme-text-sec">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-400 mb-3" />
          <p className="font-mono text-sm">Synchronizing Command Center Feed...</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <GlobalDashboard 
            stats={stats} 
            alerts={alerts} 
            analytics={analytics}
            airportCount={airports.length}
            onTriggerSimulation={handleTriggerSimulation} 
            onTabChange={setActiveTab}
            onResolveAlert={handleResolveAlert}
          />
        );
      case 'surveillance':
        return (
          <Surveillance 
            reports={reports} 
            onAddReport={handleAddReport} 
            onUpdateReport={handleUpdateReport} 
            onDeleteReport={handleDeleteReport}
          />
        );
      case 'hospitals':
        return (
          <HospitalManager 
            hospitals={hospitals} 
            onRegisterHospital={handleRegisterHospital} 
            onUpdateHospital={handleUpdateHospital} 
            onDeleteHospital={handleDeleteHospital}
          />
        );
      case 'labs':
        return (
          <Laboratory 
            labs={labs} 
            onRegisterLab={handleRegisterLab} 
            onUpdateLab={handleUpdateLab} 
            onDeleteLab={handleDeleteLab}
          />
        );
      case 'airports':
        return (
          <AirportBorder 
            airports={airports} 
            onAddAirportLog={handleAddAirportLog} 
            onUpdateAirportLog={handleUpdateAirportLog} 
            onDeleteAirportLog={handleDeleteAirportLog}
          />
        );
      case 'analytics':
        return <Analytics data={analytics} />;
      case 'emergency':
        return (
          <EmergencyResponse 
            resources={resources} 
            incidents={incidents} 
            onUpdateResource={handleUpdateResource} 
            onUpdateIncident={handleUpdateIncident}
          />
        );
      case 'simulator':
        return <Simulator onTriggerSimulation={handleTriggerSimulation} />;
      case 'admin':
        return <AdminPortal health={health} users={users} />;
      case 'devops':
        return <DevopsDashboard />;
      default:
        return <div className="text-white">Under Construction</div>;
    }
  };

  // --- RENDER UNAUTHENTICATED LOGIN VIEW ---
  if (!auth) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        {/* LOGO BOX */}
        <div className="flex items-center gap-3 mb-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-2xl shadow-emerald-500/25">
            <span className="text-2xl">🩺</span>
          </div>
          <div className="text-left">
            <h1 className="text-2xl font-black tracking-wider text-white font-mono leading-none">GLOBALMED<span className="text-emerald-500">X</span></h1>
            <p className="text-[10px] text-theme-text-sec font-bold uppercase tracking-widest mt-1">Pandemic Surveillance Network</p>
          </div>
        </div>

        {/* LOGIN FORM BOX */}
        <div className="glass-panel w-full max-w-md p-8 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500" />
          
          <h2 className="text-2xl font-bold text-white tracking-tight text-center">Sign In to Dashboard</h2>
          <p className="text-theme-text-sec text-sm text-center mt-1.5">Enter certified credentials to access data feeds.</p>

          {loginError && (
            <div className="mt-6 p-4 bg-rose-500/10 border border-rose-500/25 rounded-2xl text-xs font-semibold text-rose-400 text-center animate-shake">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5 mt-6">
            <div>
              <label className="block text-xs font-semibold text-theme-text-sec uppercase mb-2">Email Address</label>
              <input 
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@globalmedx.gov"
                className="w-full bg-theme-bg border border-theme-border p-3.5 rounded-xl text-sm focus:outline-none focus:border-emerald-500 text-theme-text placeholder-theme-text-sec transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-theme-text-sec uppercase mb-2">Security Password</label>
              <input 
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-theme-bg border border-theme-border p-3.5 rounded-xl text-sm focus:outline-none focus:border-emerald-500 text-theme-text placeholder-theme-text-sec transition-colors"
              />
            </div>

            <button 
              type="submit"
              disabled={loginLoading}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 font-bold rounded-xl text-sm transition-all active:scale-98 disabled:opacity-50 text-white flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/10"
            >
              {loginLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Authorizing...
                </>
              ) : (
                'Secure Login'
              )}
            </button>
          </form>

          {/* MOCK ACCOUNTS HINT FOOTER */}
          <div className="mt-8 pt-6 border-t border-slate-800 text-xs text-slate-500 space-y-2">
            <p className="font-semibold text-theme-text-sec uppercase tracking-wider text-[10px]">Mock Credentials:</p>
            <div className="flex justify-between font-mono bg-slate-800/50 p-2.5 rounded-xl border border-slate-800/80">
              <div>
                <p className="text-[10px] text-theme-text-sec uppercase font-semibold">Admin Account</p>
                <button 
                  onClick={() => { setEmail('admin@globalmedx.gov'); setPassword('admin123'); }}
                  className="text-emerald-400 hover:underline mt-0.5 text-left text-xs"
                >
                  admin@globalmedx.gov
                </button>
              </div>
              <div className="text-right border-l border-slate-800 pl-4">
                <p className="text-[10px] text-theme-text-sec uppercase font-semibold">Password</p>
                <p className="text-theme-text mt-0.5 text-xs">admin123</p>
              </div>
            </div>
            <div className="flex justify-between font-mono bg-slate-800/50 p-2.5 rounded-xl border border-slate-800/80">
              <div>
                <p className="text-[10px] text-theme-text-sec uppercase font-semibold">Officer Account</p>
                <button 
                  onClick={() => { setEmail('officer@globalmedx.gov'); setPassword('officer123'); }}
                  className="text-blue-400 hover:underline mt-0.5 text-left text-xs"
                >
                  officer@globalmedx.gov
                </button>
              </div>
              <div className="text-right border-l border-slate-800 pl-4">
                <p className="text-[10px] text-theme-text-sec uppercase font-semibold">Password</p>
                <p className="text-theme-text mt-0.5 text-xs">officer123</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER SECURE ROUTE PLATFORM ---
  const activeAlertsCount = alerts.filter(a => a.status === 'Active').length;

  return (
    <Layout 
      currentUser={currentUser} 
      onLogout={handleLogout} 
      activeTab={activeTab} 
      setActiveTab={setActiveTab}
      activeAlertsCount={activeAlertsCount}
      alerts={alerts}
    >
      {renderTabContent()}
    </Layout>
  );
};

export default App;
