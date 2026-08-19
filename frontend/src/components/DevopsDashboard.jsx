import React, { useState, useEffect, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, 
  LineElement, Title, Tooltip, Legend, Filler 
} from 'chart.js';
import { 
  Activity, Server, Cpu, Database, Terminal, GitBranch, Shield, 
  Layers, Clock, RefreshCw, CheckCircle2, AlertTriangle, Play, HelpCircle, Flame
} from 'lucide-react';
import { devopsAPI, analyticsAPI } from '../utils/api';

// Register ChartJS plugins for DevOps charts
ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, 
  Title, Tooltip, Legend, Filler
);

const DevopsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);
  const [outbreaks, setOutbreaks] = useState([]);
  const [activeTab, setActiveTab] = useState('system'); // system, architecture, simulated
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  // Chart state history
  const [cpuHistory, setCpuHistory] = useState(Array(10).fill(0));
  const [memHistory, setMemHistory] = useState(Array(10).fill(0));
  const [timeLabels, setTimeLabels] = useState(Array(10).fill('').map((_, i) => `-${(9 - i) * 5}s`));

  const pollIntervalRef = useRef(null);

  // Fetch metrics data
  const fetchMetrics = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const response = await devopsAPI.getMetrics();
      if (response.data.success) {
        const payload = response.data;
        setMetrics(payload);
        
        // Append telemetry history for charts
        const currentCpu = payload.liveMetrics.cpu.totalPercent;
        const currentMem = Math.round(payload.liveMetrics.memory.heapUsedBytes / 1024 / 1024);

        setCpuHistory(prev => [...prev.slice(1), currentCpu]);
        setMemHistory(prev => [...prev.slice(1), currentMem]);
        
        // Update time labels
        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
        setTimeLabels(prev => [...prev.slice(1), timeStr]);
        setLastRefreshed(now);
      }
    } catch (error) {
      console.error('Error fetching DevOps metrics:', error);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  // Fetch outbreaks geo coordinates (from analytics endpoint)
  const fetchOutbreaks = async () => {
    try {
      const response = await analyticsAPI.getSummary();
      if (response.data.success && response.data.data.heatmaps) {
        setOutbreaks(response.data.data.heatmaps);
      }
    } catch (e) {
      console.error('Error fetching analytics geography:', e);
    }
  };

  useEffect(() => {
    fetchMetrics(true);
    fetchOutbreaks();

    // Poll every 5 seconds for active command center feel
    pollIntervalRef.current = setInterval(() => {
      fetchMetrics(false);
    }, 5000);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  // Standard equirectangular projection mapping
  const getXY = (lat, lng) => {
    // Width = 800, Height = 400
    // Latitude [-90, 90], Longitude [-180, 180]
    // Standard offsets to align with continental SVG geometry
    const x = 400 + (lng * 330) / 180;
    const y = 200 - (lat * 150) / 90;
    return { x, y };
  };

  // Chart Configurations
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: '#0f172a',
        titleFont: { family: 'Courier New', size: 12 },
        bodyFont: { family: 'Courier New', size: 12 },
        borderColor: '#334155',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(51, 65, 85, 0.15)' },
        ticks: { color: '#64748b', font: { family: 'Courier New', size: 10 } }
      },
      y: {
        grid: { color: 'rgba(51, 65, 85, 0.15)' },
        ticks: { color: '#64748b', font: { family: 'Courier New', size: 10 } },
        min: 0
      }
    }
  };

  const cpuChartData = {
    labels: timeLabels,
    datasets: [{
      label: 'CPU Load (%)',
      data: cpuHistory,
      borderColor: '#f43f5e',
      backgroundColor: 'rgba(244, 63, 94, 0.05)',
      fill: true,
      tension: 0.4,
      borderWidth: 1.5,
      pointRadius: 2,
      pointBackgroundColor: '#f43f5e'
    }]
  };

  const memChartData = {
    labels: timeLabels,
    datasets: [{
      label: 'Heap Memory (MB)',
      data: memHistory,
      borderColor: '#06b6d4',
      backgroundColor: 'rgba(6, 182, 212, 0.05)',
      fill: true,
      tension: 0.4,
      borderWidth: 1.5,
      pointRadius: 2,
      pointBackgroundColor: '#06b6d4'
    }]
  };

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center text-theme-text-sec">
        <RefreshCw className="w-10 h-10 animate-spin text-status-red mb-3" />
        <p className="font-mono text-sm">Interrogating Platform Telemetry Nodes...</p>
      </div>
    );
  }

  const live = metrics?.liveMetrics;
  const sim = metrics?.simulatedInfrastructure;

  return (
    <div className="space-y-8">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-2 border-b border-theme-border">
        <div>
          <h1 className="text-3xl font-black tracking-widest font-mono flex items-center gap-3 text-theme-text">
            <span className="w-3.5 h-3.5 bg-status-red rounded-full alarm-pulsing-danger" />
            SEC-OPS & SYSTEM TELEMETRY CONTROL
          </h1>
          <p className="text-theme-text-sec font-mono text-xs mt-1">
            GlobalMedX Infrastructure Surveillance Core // Refresh Loop Active (5s)
          </p>
        </div>
        
        <div className="flex items-center gap-4 font-mono text-xs text-theme-text-sec bg-theme-bg border border-theme-border px-4 py-2.5 rounded-xl">
          <Clock className="w-4 h-4 text-status-red" />
          <span>Last Sync: {lastRefreshed.toLocaleTimeString()}</span>
          <button 
            onClick={() => fetchMetrics(true)} 
            className="hover:text-theme-text transition-colors p-1"
            title="Force Sync Now"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* COMMAND TABS BAR */}
      <div className="flex border-b border-theme-border font-mono text-xs">
        <button 
          onClick={() => setActiveTab('system')}
          className={`px-6 py-3 border-b-2 font-bold tracking-wider transition-all ${
            activeTab === 'system' 
              ? 'border-status-red text-status-red bg-status-red-bg' 
              : 'border-transparent text-theme-text-sec hover:text-theme-text'
          }`}
        >
          [ TELEMETRY & WORLD MAP ]
        </button>
        <button 
          onClick={() => setActiveTab('architecture')}
          className={`px-6 py-3 border-b-2 font-bold tracking-wider transition-all ${
            activeTab === 'architecture' 
              ? 'border-status-red text-status-red bg-status-red-bg' 
              : 'border-transparent text-theme-text-sec hover:text-theme-text'
          }`}
        >
          [ SYSTEM ARCHITECTURE ]
        </button>
        <button 
          onClick={() => setActiveTab('simulated')}
          className={`px-6 py-3 border-b-2 font-bold tracking-wider transition-all ${
            activeTab === 'simulated' 
              ? 'border-status-red text-status-red bg-status-red-bg' 
              : 'border-transparent text-theme-text-sec hover:text-theme-text'
          }`}
        >
          [ CLUSTER & PIPELINES ]
        </button>
      </div>

      {activeTab === 'system' && (
        <>
          {/* SYSTEM SUMMARY CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 font-mono">
            <div className="medical-card bg-theme-card p-5 rounded-2xl border border-theme-border hover:border-theme-border-hover transition-colors">
              <div className="flex justify-between items-start text-theme-text-sec text-[10px] font-bold uppercase tracking-wider">
                <span>System Uptime</span>
                <Clock className="w-4 h-4 text-theme-accent" />
              </div>
              <p className="text-2xl font-bold text-theme-text mt-3">{live?.uptime || 'N/A'}</p>
              <div className="h-1 bg-theme-border rounded-full overflow-hidden mt-3.5">
                <div className="h-full bg-theme-accent" style={{ width: '100%' }} />
              </div>
            </div>

            <div className="medical-card bg-theme-card p-5 rounded-2xl border border-theme-border hover:border-theme-border-hover transition-colors">
              <div className="flex justify-between items-start text-theme-text-sec text-[10px] font-bold uppercase tracking-wider">
                <span>CPU Load</span>
                <Cpu className="w-4 h-4 text-status-red" />
              </div>
              <p className="text-2xl font-bold text-theme-text mt-3">{live?.cpu?.totalPercent}%</p>
              <div className="h-1 bg-theme-border rounded-full overflow-hidden mt-3.5">
                <div 
                  className={`h-full transition-all duration-500 bg-status-red`} 
                  style={{ width: `${Math.min(100, live?.cpu?.totalPercent + 5)}%` }} 
                />
              </div>
            </div>

            <div className="medical-card bg-theme-card p-5 rounded-2xl border border-theme-border hover:border-theme-border-hover transition-colors">
              <div className="flex justify-between items-start text-theme-text-sec text-[10px] font-bold uppercase tracking-wider">
                <span>Node.js Memory (Heap)</span>
                <Server className="w-4 h-4 text-status-green" />
              </div>
              <p className="text-2xl font-bold text-theme-text mt-3">{live?.memory?.heapUsed}</p>
              <div className="h-1 bg-theme-border rounded-full overflow-hidden mt-3.5">
                <div className="h-full bg-status-green" style={{ width: `${Math.round((live?.memory?.heapUsedBytes / live?.memory?.heapTotalBytes) * 100)}%` }} />
              </div>
            </div>

            <div className="medical-card bg-theme-card p-5 rounded-2xl border border-theme-border hover:border-theme-border-hover transition-colors">
              <div className="flex justify-between items-start text-theme-text-sec text-[10px] font-bold uppercase tracking-wider">
                <span>Database Health</span>
                <Database className="w-4 h-4 text-status-amber" />
              </div>
              <p className="text-2xl font-bold text-theme-text mt-3">{live?.database?.status}</p>
              <div className="text-[10px] text-theme-text-sec mt-2 font-mono flex justify-between">
                <span>Records: {live?.database?.documents}</span>
                <span>Sets: {live?.database?.collections}</span>
              </div>
            </div>
          </div>

          {/* WORLD OUTBREAK BEACON MAP */}
          <div className="medical-card bg-theme-card rounded-2xl border border-theme-border p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 font-mono text-[9px] text-theme-text-sec uppercase tracking-widest pointer-events-none">
              Biosurveillance Grid Overlay v4.11
            </div>
            
            <h2 className="text-lg font-bold font-mono text-theme-text flex items-center gap-2 mb-6 border-l-2 border-theme-accent pl-3">
              OUTBREAK REGIONS BIOSURVEILLANCE MAP
            </h2>

            <div className="relative flex justify-center bg-theme-bg border border-theme-border rounded-xl overflow-hidden py-4 shadow-inner">
              {/* stylized Grid Overlay */}
              <div className="absolute inset-0 opacity-10 pointer-events-none" />
              
              {/* Continent SVG Map */}
              <svg 
                viewBox="0 0 800 400" 
                className="w-full max-w-[800px] h-auto text-theme-border"
                fill="currentColor"
              >
                {/* Grid guidelines */}
                <line x1="0" y1="200" x2="800" y2="200" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" />
                <line x1="400" y1="0" x2="400" y2="400" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" />
                
                {/* Greenland */}
                <path d="M 220,30 L 280,35 L 250,70 L 210,65 Z" className="fill-theme-card-hover stroke-theme-border-hover transition-colors" strokeWidth="1" />
                {/* North America */}
                <path d="M 50,50 L 150,50 L 220,120 L 180,180 L 150,150 L 110,180 L 70,120 Z" className="fill-theme-card-hover stroke-theme-border-hover transition-colors" strokeWidth="1" />
                {/* South America */}
                <path d="M 180,180 L 220,180 L 240,250 L 200,380 L 170,300 L 160,220 Z" className="fill-theme-card-hover stroke-theme-border-hover transition-colors" strokeWidth="1" />
                {/* Eurasia */}
                <path d="M 350,30 L 750,30 L 780,120 L 700,200 L 600,220 L 520,200 L 480,240 L 400,200 L 350,120 Z" className="fill-theme-card-hover stroke-theme-border-hover transition-colors" strokeWidth="1" />
                {/* Africa */}
                <path d="M 380,150 L 480,150 L 520,220 L 480,320 L 440,350 L 380,250 Z" className="fill-theme-card-hover stroke-theme-border-hover transition-colors" strokeWidth="1" />
                {/* Australia */}
                <path d="M 650,260 L 730,260 L 750,320 L 670,320 Z" className="fill-theme-card-hover stroke-theme-border-hover transition-colors" strokeWidth="1" />

                {/* Draw Outbreak pulsing Beacons */}
                {outbreaks.map((h, i) => {
                  const { x, y } = getXY(h.lat, h.lng);
                  const isCritical = h.intensity > 1000;
                  return (
                    <g key={i}>
                      {/* Pulsing ring */}
                      <circle 
                        cx={x} 
                        cy={y} 
                        r={isCritical ? 18 : 10} 
                        className={`animate-ping origin-center ${isCritical ? 'text-rose-500/20' : 'text-orange-500/20'}`} 
                        fill="currentColor"
                      />
                      {/* Outer hazard zone circle */}
                      <circle 
                        cx={x} 
                        cy={y} 
                        r={isCritical ? 8 : 5} 
                        className={isCritical ? 'fill-rose-500/30 stroke-rose-500' : 'fill-orange-500/30 stroke-orange-500'} 
                        strokeWidth="1.5"
                      />
                      {/* Center coordinates node */}
                      <circle 
                        cx={x} 
                        cy={y} 
                        r="2.5" 
                        className={isCritical ? 'fill-rose-400' : 'fill-orange-400'} 
                      />
                    </g>
                  );
                })}
              </svg>

              {/* Hoverable / Legend box overlay */}
              <div className="absolute bottom-4 left-4 glass-panel bg-slate-950/80 p-3 rounded-lg border border-slate-800 text-[10px] font-mono space-y-1">
                <p className="font-bold text-theme-text">BIO-HAZARD MAP LEGEND</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-status-red-bg border border-status-red flex items-center justify-center">
                    <span className="w-1 h-1 bg-status-red rounded-full" />
                  </span>
                  <span className="text-theme-text-sec">Critical Cluster (&gt;1k cases)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-status-orange-bg border border-status-orange flex items-center justify-center">
                    <span className="w-1 h-1 bg-status-orange rounded-full" />
                  </span>
                  <span className="text-theme-text-sec">Monitoring Cluster (&lt;1k cases)</span>
                </div>
              </div>
            </div>
          </div>

          {/* INFRASTRUCTURE STATUS BOARD */}
          <div className="medical-card bg-theme-card p-6 rounded-2xl border border-theme-border">
            <h2 className="text-lg font-bold font-mono text-theme-text flex items-center gap-2 mb-6 border-l-2 border-theme-accent pl-3">
              INFRASTRUCTURE STATUS BOARD
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
              {/* React Frontend */}
              <div className="bg-theme-bg border border-theme-border rounded-xl p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-theme-text">React Frontend Portal</h3>
                  <p className="text-[10px] text-theme-text-sec mt-1">Nginx Web Server // Port 3000</p>
                </div>
                <div className="flex items-center gap-1.5 bg-status-green-bg border border-status-green-border px-2.5 py-1 rounded-full text-status-green">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>ONLINE</span>
                </div>
              </div>

              {/* Node Backend */}
              <div className="bg-theme-bg border border-theme-border rounded-xl p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-theme-text">Express REST APIs</h3>
                  <p className="text-[10px] text-theme-text-sec mt-1">PM2 Service Manager // Port 5005</p>
                </div>
                <div className="flex items-center gap-1.5 bg-status-green-bg border border-status-green-border px-2.5 py-1 rounded-full text-status-green">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>ONLINE</span>
                </div>
              </div>

              {/* MongoDB */}
              <div className="bg-theme-bg border border-theme-border rounded-xl p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-theme-text">MongoDB Instance</h3>
                  <p className="text-[10px] text-theme-text-sec mt-1">Stateful Data Engine // Port 27017</p>
                </div>
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${
                  live?.database?.status === 'Healthy' 
                    ? 'bg-status-green-bg border border-status-green-border text-status-green' 
                    : 'bg-status-red-bg border border-status-red-border text-status-red'
                }`}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{live?.database?.status === 'Healthy' ? 'ONLINE' : 'OFFLINE'}</span>
                </div>
              </div>

              {/* Prometheus */}
              <div className="bg-theme-bg border border-theme-border rounded-xl p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-theme-text">Prometheus Metrics Engine</h3>
                  <p className="text-[10px] text-theme-text-sec mt-1">Scraper Daemon // Port 9090</p>
                </div>
                <div className="flex items-center gap-1.5 bg-status-green-bg border border-status-green-border px-2.5 py-1 rounded-full text-status-green">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>ONLINE</span>
                </div>
              </div>

              {/* Grafana */}
              <div className="bg-theme-bg border border-theme-border rounded-xl p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-theme-text">Grafana Telemetry Boards</h3>
                  <p className="text-[10px] text-theme-text-sec mt-1">Analytics Dashboard // Port 3001</p>
                </div>
                <div className="flex items-center gap-1.5 bg-status-green-bg border border-status-green-border px-2.5 py-1 rounded-full text-status-green">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>ONLINE</span>
                </div>
              </div>

              {/* Vault */}
              <div className="bg-theme-bg border border-theme-border rounded-xl p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-theme-text">HashiCorp Vault Service</h3>
                  <p className="text-[10px] text-theme-text-sec mt-1">Secrets Vault // Port 8200</p>
                </div>
                <div className="flex items-center gap-1.5 bg-status-green-bg border border-status-green-border px-2.5 py-1 rounded-full text-status-green">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>ONLINE</span>
                </div>
              </div>

              {/* Elasticsearch */}
              <div className="bg-theme-bg border border-theme-border rounded-xl p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-theme-text">Elasticsearch DB</h3>
                  <p className="text-[10px] text-theme-text-sec mt-1">Log Analyzer Indexer // Port 9200</p>
                </div>
                <div className="flex items-center gap-1.5 bg-theme-border border border-theme-border px-2.5 py-1 rounded-full text-theme-text-sec">
                  <Clock className="w-3.5 h-3.5" />
                  <span>STANDBY</span>
                </div>
              </div>

              {/* Kibana */}
              <div className="bg-theme-bg border border-theme-border rounded-xl p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-theme-text">Kibana Logs Viewer</h3>
                  <p className="text-[10px] text-theme-text-sec mt-1">Central Logger GUI // Port 5601</p>
                </div>
                <div className="flex items-center gap-1.5 bg-theme-border border border-theme-border px-2.5 py-1 rounded-full text-theme-text-sec">
                  <Clock className="w-3.5 h-3.5" />
                  <span>STANDBY</span>
                </div>
              </div>

              {/* Jenkins */}
              <div className="bg-theme-bg border border-theme-border rounded-xl p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-theme-text">Jenkins CI Server</h3>
                  <p className="text-[10px] text-theme-text-sec mt-1">Build Pipeline Scheduler // Port 8080</p>
                </div>
                <div className="flex items-center gap-1.5 bg-status-green-bg border border-status-green-border px-2.5 py-1 rounded-full text-status-green">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>ONLINE</span>
                </div>
              </div>
            </div>
          </div>

          {/* REAL TELEMETRY RUNNING CHARTS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="medical-card bg-theme-card p-6 rounded-2xl border border-theme-border">
              <h3 className="text-md font-bold font-mono text-theme-text mb-4 flex items-center justify-between">
                <span>[LIVE] SYSTEM CPU LOAD TIMELINE</span>
                <span className="text-xs text-status-red bg-status-red-bg px-2.5 py-0.5 rounded border border-status-red-border">ACTIVE AGENT</span>
              </h3>
              <div className="h-64">
                <Line data={cpuChartData} options={chartOptions} />
              </div>
            </div>

            <div className="medical-card bg-theme-card p-6 rounded-2xl border border-theme-border">
              <h3 className="text-md font-bold font-mono text-theme-text mb-4 flex items-center justify-between">
                <span>[LIVE] NODE PROCESS HEAP HEURISTICS</span>
                <span className="text-xs text-status-blue bg-status-blue-bg px-2.5 py-0.5 rounded border border-status-blue-border">ACTIVE AGENT</span>
              </h3>
              <div className="h-64">
                <Line data={memChartData} options={chartOptions} />
              </div>
            </div>
          </div>

          {/* REAL TELEMETRY API RESPONSE TIMINGS */}
          <div className="medical-card bg-theme-card p-6 rounded-2xl border border-theme-border">
            <h2 className="text-lg font-bold font-mono text-theme-text flex items-center gap-2 mb-6 border-l-2 border-theme-accent pl-3">
              [LIVE] PROMETHEUS SCRAPED API RESPONSE TIMINGS
            </h2>

            <div className="overflow-x-auto">
              {live?.api?.latencies?.length > 0 ? (
                <table className="w-full text-left font-mono text-xs">
                  <thead>
                    <tr className="border-b border-theme-border text-theme-text-sec uppercase tracking-widest pb-3">
                      <th className="pb-3 text-left">METHOD</th>
                      <th className="pb-3 text-left">ROUTE ENDPOINT</th>
                      <th className="pb-3 text-center">STATUS CODE</th>
                      <th className="pb-3 text-right">TOTAL CALLS</th>
                      <th className="pb-3 text-right">AVG RESPONSE TIME</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-theme-border">
                    {live.api.latencies.map((api, idx) => (
                      <tr key={idx} className="hover:bg-theme-card-hover">
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            api.method === 'POST' ? 'bg-status-orange-bg text-status-orange' : 'bg-status-blue-bg text-status-blue'
                          }`}>
                            {api.method}
                          </span>
                        </td>
                        <td className="py-3 font-semibold text-theme-text">{api.route}</td>
                        <td className="py-3 text-center">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                            api.statusCode >= 400 ? 'bg-status-red-bg text-status-red' : 'bg-status-green-bg text-status-green'
                          }`}>
                            {api.statusCode}
                          </span>
                        </td>
                        <td className="py-3 text-right text-theme-text-sec">{api.totalCalls}</td>
                        <td className="py-3 text-right text-theme-text font-bold">{api.avgResponseTimeMs} ms</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="py-8 text-center text-theme-text-sec font-mono text-xs flex flex-col items-center justify-center gap-2">
                  <AlertTriangle className="w-8 h-8 text-status-amber opacity-50" />
                  <p>No transactions registered under Prometheus counter metrics yet.</p>
                  <p className="text-[10px]">Interact with disease surveillance portals or hospital logs to register live requests.</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {activeTab === 'architecture' && (
        <div className="medical-card bg-theme-card p-8 rounded-2xl border border-theme-border font-mono">
          <h2 className="text-xl font-bold text-theme-text mb-8 border-l-2 border-theme-accent pl-3">
            SYSTEM ARCHITECTURE RELATIONSHIPS
          </h2>

          <div className="space-y-12 max-w-4xl mx-auto py-6">
            {/* tier 1: CLIENT & ROUTER TELEMETRY */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="bg-theme-bg border border-theme-border p-5 rounded-2xl relative flex flex-col items-center text-center">
                <div className="absolute -top-3.5 px-3 py-0.5 bg-status-red-bg border border-status-red-border rounded-full text-[9px] text-status-red font-bold uppercase tracking-wider">
                  Client Tier
                </div>
                <div className="p-3 bg-status-green-bg rounded-xl mb-3">
                  <span className="text-2xl">💻</span>
                </div>
                <h3 className="font-bold text-theme-text">React Frontend</h3>
                <p className="text-[10px] text-theme-text-sec mt-2 leading-relaxed">Vite Bundler / Tailwind Styling Core Portal</p>
              </div>

              <div className="flex flex-col items-center justify-center text-theme-text-sec font-bold text-lg">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xs text-status-red border border-status-red-border bg-status-red-bg px-2 py-0.5 rounded font-mono">REST JSON</span>
                  <span className="animate-pulse">➔</span>
                </div>
              </div>

              <div className="bg-theme-bg border border-theme-border p-5 rounded-2xl relative flex flex-col items-center text-center">
                <div className="absolute -top-3.5 px-3 py-0.5 bg-status-red-bg border border-status-red-border rounded-full text-[9px] text-status-red font-bold uppercase tracking-wider">
                  Express API Server
                </div>
                <div className="p-3 bg-status-red-bg rounded-xl mb-3">
                  <span className="text-2xl">⚙️</span>
                </div>
                <h3 className="font-bold text-theme-text">Node.js Backend</h3>
                <p className="text-[10px] text-theme-text-sec mt-2 leading-relaxed">Middleware Auth, Controller Routers, prom-client registry</p>
              </div>
            </div>

            {/* divider line */}
            <div className="flex justify-center text-theme-border">
              <div className="h-8 border-l border-dashed border-theme-border" />
            </div>

            {/* tier 2: DB & VAULT */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="bg-theme-bg border border-theme-border p-5 rounded-2xl relative flex flex-col items-center text-center">
                <div className="absolute -top-3.5 px-3 py-0.5 bg-status-blue-bg border border-status-blue-border rounded-full text-[9px] text-status-blue font-bold uppercase tracking-wider">
                  Secrets Protection
                </div>
                <div className="p-3 bg-status-blue-bg rounded-xl mb-3">
                  <span className="text-2xl">🔑</span>
                </div>
                <h3 className="font-bold text-theme-text">HashiCorp Vault</h3>
                <p className="text-[10px] text-theme-text-sec mt-2 leading-relaxed">KV Engine store safeguarding JWT tokens and MongoDB URIs</p>
              </div>

              <div className="flex flex-col items-center justify-center text-theme-text-sec text-xs text-center px-4 font-mono leading-relaxed">
                <div>Backend reads credential configs directly from DB and Vault</div>
                <span className="text-lg mt-1 font-bold">⬇ ⬆</span>
              </div>

              <div className="bg-theme-bg border border-theme-border p-5 rounded-2xl relative flex flex-col items-center text-center">
                <div className="absolute -top-3.5 px-3 py-0.5 bg-status-orange-bg border border-status-orange-border rounded-full text-[9px] text-status-orange font-bold uppercase tracking-wider">
                  Storage Database
                </div>
                <div className="p-3 bg-status-orange-bg rounded-xl mb-3">
                  <span className="text-2xl">💾</span>
                </div>
                <h3 className="font-bold text-theme-text">MongoDB Database</h3>
                <p className="text-[10px] text-theme-text-sec mt-2 leading-relaxed">Epidemiological records, hospitals, and responder resources</p>
              </div>
            </div>

            {/* divider line */}
            <div className="flex justify-center text-theme-border">
              <div className="h-8 border-l border-dashed border-theme-border" />
            </div>

            {/* tier 3: DEV-OPS PIPELINES & TELEMETRY */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono text-[11px]">
              <div className="bg-theme-bg border border-theme-border rounded-xl p-4 flex flex-col items-center text-center">
                <h4 className="font-bold text-theme-text">Docker Compose</h4>
                <p className="text-[9px] text-theme-text-sec mt-1">Build/Launch local sandbox isolation services</p>
              </div>
              <div className="bg-theme-bg border border-theme-border rounded-xl p-4 flex flex-col items-center text-center">
                <h4 className="font-bold text-theme-text">Kubernetes Pods</h4>
                <p className="text-[9px] text-theme-text-sec mt-1">Orchestration namespace, node limits, HPA autoscaler</p>
              </div>
              <div className="bg-theme-bg border border-theme-border rounded-xl p-4 flex flex-col items-center text-center">
                <h4 className="font-bold text-theme-text">Jenkins Pipelines</h4>
                <p className="text-[9px] text-theme-text-sec mt-1">Lint check ➔ Automated test runner ➔ Push registry CI/CD</p>
              </div>
              <div className="bg-theme-bg border border-theme-border rounded-xl p-4 flex flex-col items-center text-center">
                <h4 className="font-bold text-theme-text">ELK Logging</h4>
                <p className="text-[9px] text-theme-text-sec mt-1">Logstash parser ingestion ➔ Elasticsearch indexing ➔ Kibana UI</p>
              </div>
            </div>

            {/* tier 4: METRICS SCRAPER */}
            <div className="bg-theme-bg border border-theme-border p-5 rounded-2xl text-center">
              <h3 className="font-bold text-status-red mb-2">Metrics Monitoring Loop</h3>
              <p className="text-[10px] text-theme-text-sec max-w-xl mx-auto leading-relaxed">
                Prometheus scrapers query the backend <code className="text-theme-accent bg-theme-card-hover px-1 py-0.5 rounded">/metrics</code> route every 10s. Grafana reads directly from the Prometheus timeseries repository to display telemetry charts.
              </p>
              <div className="flex justify-center items-center gap-6 mt-4 font-bold text-xs text-theme-text-sec">
                <span>Node Backend Exporter</span>
                <span className="text-status-red">➔</span>
                <span>Prometheus Scraper</span>
                <span className="text-status-red">➔</span>
                <span>Grafana Dashboard Visualizer</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'simulated' && (
        <div className="space-y-8 font-mono">
          <div className="p-4 bg-status-orange-bg border border-status-orange-border rounded-2xl text-xs text-status-orange flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">SIMULATED DEPLOYMENT ISOLATION NOTICE:</span>
              <p className="mt-1 leading-relaxed">
                Docker socket connectivity, EKS cluster configs, and Jenkins pipelines are running inside a virtual mockup harness. System processes and Prometheus scrapers are drawing live real-time values from the application.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* DOCKER MONITOR */}
            <div className="medical-card bg-theme-card p-6 rounded-2xl border border-theme-border">
              <h2 className="text-md font-bold text-theme-text flex items-center gap-2 mb-4 border-l-2 border-theme-accent pl-3 uppercase">
                [Simulated] Docker Containers Daemon
              </h2>
              <div className="space-y-3">
                {sim?.dockerContainers.map((container, idx) => (
                  <div key={idx} className="bg-theme-bg border border-theme-border rounded-xl p-3.5 flex items-center justify-between text-xs">
                    <div>
                      <h4 className="font-bold text-theme-text">{container.name}</h4>
                      <p className="text-[10px] text-theme-text-sec mt-1 font-mono">
                        Port: {container.port} // Uptime: {container.uptime}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-right">
                      <div className="text-[10px] text-theme-text-sec">
                        <div>CPU: {container.cpu}</div>
                        <div>Mem: {container.memory}</div>
                      </div>
                      <span className={`inline-block w-2.5 h-2.5 rounded-full ${
                        container.status === 'RUNNING' ? 'bg-status-green animate-pulse' : 'bg-status-orange'
                      }`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* KUBERNETES POD MONITOR */}
            <div className="medical-card bg-theme-card p-6 rounded-2xl border border-theme-border">
              <h2 className="text-md font-bold text-theme-text flex items-center gap-2 mb-4 border-l-2 border-theme-accent pl-3 uppercase">
                [Simulated] Kubernetes Pod Status
              </h2>
              <div className="space-y-3">
                {sim?.kubernetesPods.map((pod, idx) => (
                  <div key={idx} className="bg-theme-bg border border-theme-border rounded-xl p-3.5 flex items-center justify-between text-xs">
                    <div>
                      <h4 className="font-bold text-theme-text truncate max-w-[200px]">{pod.name}</h4>
                      <p className="text-[10px] text-theme-text-sec mt-1 font-mono">
                        Namespace: {pod.namespace} // Age: {pod.age}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-right">
                      <div className="text-[10px] text-theme-text-sec">
                        <div>CPU: {pod.cpu}</div>
                        <div>Memory: {pod.memory}</div>
                        <div>Restarts: {pod.restarts}</div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        pod.status === 'Running' ? 'bg-status-green-bg text-status-green' : 'bg-status-orange-bg text-status-orange'
                      }`}>
                        {pod.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* JENKINS PIPELINE MONITOR */}
            <div className="medical-card bg-theme-card p-6 rounded-2xl border border-theme-border">
              <h2 className="text-md font-bold text-theme-text flex items-center gap-2 mb-4 border-l-2 border-theme-accent pl-3 uppercase">
                [Simulated] Jenkins Build History
              </h2>
              <div className="space-y-3">
                {sim?.jenkinsBuilds.map((build, idx) => (
                  <div key={idx} className="bg-theme-bg border border-theme-border rounded-xl p-3.5 flex items-center justify-between text-xs">
                    <div>
                      <h4 className="font-bold text-theme-text">#{build.buildNo} - {build.jobName}</h4>
                      <p className="text-[10px] text-theme-text-sec mt-1 font-mono flex items-center gap-1">
                        <GitBranch className="w-3 h-3 text-theme-text-sec" />
                        Branch: {build.branch} // Duration: {build.duration}
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      build.status === 'SUCCESS' ? 'bg-status-green-bg text-status-green' : 'bg-status-red-bg text-status-red'
                    }`}>
                      {build.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* DEPLOYMENT HISTORY LOGS */}
            <div className="medical-card bg-theme-card p-6 rounded-2xl border border-theme-border">
              <h2 className="text-md font-bold text-theme-text flex items-center gap-2 mb-4 border-l-2 border-theme-accent pl-3 uppercase">
                [Simulated] Platform Deployment Logs
              </h2>
              <div className="space-y-3">
                {sim?.deployments.map((dep, idx) => (
                  <div key={idx} className="bg-theme-bg border border-theme-border rounded-xl p-3.5 flex items-center justify-between text-xs">
                    <div>
                      <h4 className="font-bold text-theme-text">{dep.version} Deployment ({dep.commit})</h4>
                      <p className="text-[10px] text-theme-text-sec mt-1 font-mono">
                        Author: {dep.author} // Environment: {dep.environment}
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      dep.status === 'SUCCESS' ? 'bg-status-green-bg text-status-green' : 'bg-status-red-bg text-status-red'
                    }`}>
                      {dep.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DevopsDashboard;
