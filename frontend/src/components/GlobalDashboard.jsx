import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Activity, Heart, ShieldAlert, Award, 
  MapPin, AlertTriangle, AlertCircle, FileText, Info, ShieldCheck, RefreshCw,
  Building2, Microscope, PlaneTakeoff, Info as InfoIcon
} from 'lucide-react';
import { analyticsAPI } from '../utils/api';

// Animated Counter Component
const AnimatedCounter = ({ value, duration = 1000 }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (value === undefined || value === null) return;
    
    // Parse commas out of number if it is formatted as string
    const num = parseInt(value.toString().replace(/,/g, ''), 10);
    if (isNaN(num)) {
      setDisplayValue(value);
      return;
    }

    let start = 0;
    const end = num;
    if (start === end) {
      setDisplayValue(end);
      return;
    }

    const range = end - start;
    let current = start;
    const increment = end > start ? 1 : -1;
    
    // Smooth transition
    const stepTime = 20; // 50 FPS
    const stepsCount = duration / stepTime;
    const stepSize = Math.max(Math.floor(range / stepsCount), 1);

    const timer = setInterval(() => {
      current += stepSize * increment;
      if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(current);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{typeof displayValue === 'number' ? displayValue.toLocaleString() : displayValue}</span>;
};

const GlobalDashboard = ({ stats, alerts, analytics, airportCount, onTriggerSimulation, onTabChange, onResolveAlert }) => {
  const [hoveredOutbreak, setHoveredOutbreak] = useState(null);
  const [localOutbreaks, setLocalOutbreaks] = useState([]);
  const [loadingMap, setLoadingMap] = useState(false);

  const activeAlerts = alerts.filter(a => a.status === 'Active');

  const defaultOutbreaks = [
    { country: 'United States', disease: 'COVID-19 Delta Variant', lat: 37.0902, lng: -95.7129, intensity: 1250 },
    { country: 'India', disease: 'Influenza H5N1', lat: 20.5937, lng: 78.9629, intensity: 3400 },
    { country: 'Brazil', disease: 'Zika Virus Outbreak', lat: -14.235, lng: -51.9253, intensity: 890 },
    { country: 'United Kingdom', disease: 'Mpox Surveillance', lat: 55.3781, lng: -3.436, intensity: 150 },
    { country: 'South Africa', disease: 'Cholera Cluster', lat: -30.5595, lng: 22.9375, intensity: 2100 },
    { country: 'Australia', disease: 'Dengue Control Zone', lat: -25.2744, lng: 133.7751, intensity: 450 }
  ];

  // Fetch heatmaps locally if not passed down through props
  useEffect(() => {
    if (analytics && analytics.heatmaps && analytics.heatmaps.length > 0) {
      setLocalOutbreaks(analytics.heatmaps);
    } else {
      const fetchBackupData = async () => {
        setLoadingMap(true);
        try {
          const res = await analyticsAPI.getSummary();
          if (res.data.success && res.data.data.heatmaps && res.data.data.heatmaps.length > 0) {
            setLocalOutbreaks(res.data.data.heatmaps);
          } else {
            setLocalOutbreaks(defaultOutbreaks);
          }
        } catch (e) {
          console.warn('Unable to reach analytics endpoint for map coordinates, using default list.');
          setLocalOutbreaks(defaultOutbreaks);
        } finally {
          setLoadingMap(false);
        }
      };
      fetchBackupData();
    }
  }, [analytics]);

  // Equirectangular projection mapping helper
  const getXY = (lat, lng) => {
    const x = 400 + (lng * 330) / 180;
    const y = 200 - (lat * 150) / 90;
    return { x, y };
  };

  const cardDetails = [
    { 
      title: 'Total Disease Cases', 
      value: stats?.totalCases || 0, 
      icon: Activity, 
      color: 'text-status-blue', 
      bg: 'bg-status-blue-bg',
      border: 'accent-border-blue'
    },
    { 
      title: 'Active Case Count', 
      value: stats?.activeCases || 0, 
      icon: TrendingUp, 
      color: 'text-theme-accent', 
      bg: 'bg-emerald-500/10',
      border: 'accent-border-teal'
    },
    { 
      title: 'Recovered Patients', 
      value: stats?.totalRecoveries || 0, 
      icon: Heart, 
      color: 'text-status-green', 
      bg: 'bg-status-green-bg',
      border: 'border-l-4 border-status-green'
    },
    { 
      title: 'Fatality Count', 
      value: stats?.totalDeaths || 0, 
      icon: ShieldAlert, 
      color: 'text-status-red', 
      bg: 'bg-status-red-bg',
      border: 'accent-border-rose'
    }
  ];

  const facilityDetails = [
    {
      title: 'Connected Hospitals',
      value: stats?.hospitalCount || 0,
      icon: Building2,
      color: 'text-theme-accent',
      bg: 'bg-theme-card-hover'
    },
    {
      title: 'Connected Laboratories',
      value: stats?.labCount || 0,
      icon: Microscope,
      color: 'text-theme-accent',
      bg: 'bg-theme-card-hover'
    },
    {
      title: 'Connected Airports',
      value: airportCount || 0,
      icon: PlaneTakeoff,
      color: 'text-theme-accent',
      bg: 'bg-theme-card-hover'
    }
  ];

  return (
    <div className="space-y-8">
      {/* GLOBAL HEALTH STATISTICS BANNER */}
      <div className="bg-theme-card border border-theme-border rounded-xl px-6 py-3 shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs font-mono transition-colors">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-theme-accent alert-dot-blink" />
          <span className="font-bold text-theme-text tracking-wide uppercase">WHO SURVEILLANCE BANNER //</span>
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-theme-text-sec">
          <span>Global Alert Status: <span className="text-theme-accent font-bold">ACTIVE MONITORING</span></span>
          <span className="hidden sm:inline">|</span>
          <span>Reporting Nodes: <span className="text-theme-text font-bold">194 Countries</span></span>
          <span className="hidden sm:inline">|</span>
          <span>Active Emergencies: <span className={`font-bold ${activeAlerts.length > 0 ? 'text-status-red' : 'text-theme-text'}`}>{activeAlerts.length} Zones</span></span>
          <span className="hidden sm:inline">|</span>
          <span>Global Recovery Rate: <span className="text-status-green font-bold">{stats?.recoveryRate || '0'}%</span></span>
        </div>
      </div>

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-theme-text">EPIDEMIOLOGICAL SURVEILLANCE PORTAL</h1>
          <p className="text-theme-text-sec mt-1">International public health operation monitoring outbreak containment, resource allocation, and lab feeds.</p>
        </div>
        <button 
          onClick={() => onTabChange('simulator')}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-theme-accent hover:bg-theme-accent-hover font-semibold text-white shadow-md transition-all active:scale-95 duration-200"
        >
          <AlertCircle className="w-5 h-5 alert-dot-blink" />
          Simulate Outbreak Event
        </button>
      </div>

      {/* PRIMARY KPI METRICS (LARGER CARDS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cardDetails.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className={`medical-card p-8 ${card.border} ${card.bg}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-theme-text-sec uppercase tracking-wider">{card.title}</span>
                <div className="p-2 rounded-lg bg-theme-bg shadow-sm">
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
              </div>
              <p className="text-4xl font-extrabold text-theme-text mt-6 tracking-tight">
                <AnimatedCounter value={card.value} />
              </p>
            </div>
          );
        })}
      </div>

      {/* SECONDARY KPI METRICS (CONNECTED FACILITIES) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {facilityDetails.map((facility, idx) => {
          const Icon = facility.icon;
          return (
            <div key={idx} className={`medical-card p-6 flex items-center gap-4 ${facility.bg}`}>
              <div className="p-3.5 rounded-xl bg-theme-bg border border-theme-border shadow-sm flex items-center justify-center">
                <Icon className={`w-6 h-6 ${facility.color}`} />
              </div>
              <div>
                <p className="text-xs font-semibold text-theme-text-sec uppercase tracking-wider">{facility.title}</p>
                <p className="text-2xl font-bold text-theme-text mt-1">
                  <AnimatedCounter value={facility.value} />
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="h-px bg-theme-border" /> {/* Section Separation */}

      {/* WORLD MAP VISUALIZATION SECTION */}
      <div className="medical-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-theme-text flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-status-orange alert-dot-blink" />
            WORLDWIDE BIOSURVEILLANCE OUTBREAK MAP
          </h2>
          <div className="flex items-center gap-2 text-xs text-theme-text-sec">
            <RefreshCw className={`w-3.5 h-3.5 ${loadingMap ? 'animate-spin' : ''}`} />
            <span>Operational updates real-time</span>
          </div>
        </div>

        <div className="relative flex justify-center bg-theme-bg border border-theme-border rounded-xl overflow-hidden py-8 shadow-inner min-h-[350px]">
          {/* Continent SVG Map */}
          <svg 
            viewBox="0 0 800 400" 
            className="w-full max-w-[800px] h-auto text-theme-border z-10"
            fill="currentColor"
          >
            {/* Grid guidelines */}
            <line x1="0" y1="200" x2="800" y2="200" stroke="currentColor" strokeOpacity="0.15" strokeWidth="0.5" strokeDasharray="3 3" />
            <line x1="400" y1="0" x2="400" y2="400" stroke="currentColor" strokeOpacity="0.15" strokeWidth="0.5" strokeDasharray="3 3" />
            
            {/* Map continent geometries */}
            {/* Greenland */}
            <path d="M 220,30 L 280,35 L 250,70 L 210,65 Z" className="fill-theme-card-hover stroke-theme-border transition-colors" strokeWidth="1" />
            {/* North America */}
            <path d="M 50,50 L 150,50 L 220,120 L 180,180 L 150,150 L 110,180 L 70,120 Z" className="fill-theme-card-hover stroke-theme-border transition-colors" strokeWidth="1" />
            {/* South America */}
            <path d="M 180,180 L 220,180 L 240,250 L 200,380 L 170,300 L 160,220 Z" className="fill-theme-card-hover stroke-theme-border transition-colors" strokeWidth="1" />
            {/* Eurasia */}
            <path d="M 350,30 L 750,30 L 780,120 L 700,200 L 600,220 L 520,200 L 480,240 L 400,200 L 350,120 Z" className="fill-theme-card-hover stroke-theme-border transition-colors" strokeWidth="1" />
            {/* Africa */}
            <path d="M 380,150 L 480,150 L 520,220 L 480,320 L 440,350 L 380,250 Z" className="fill-theme-card-hover stroke-theme-border transition-colors" strokeWidth="1" />
            {/* Australia */}
            <path d="M 650,260 L 730,260 L 750,320 L 670,320 Z" className="fill-theme-card-hover stroke-theme-border transition-colors" strokeWidth="1" />

            {/* Draw Outbreak pulsing Beacons */}
            {localOutbreaks.map((h, i) => {
              const { x, y } = getXY(h.lat, h.lng);
              const isCritical = h.intensity > 1000;
              return (
                <g 
                  key={i} 
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredOutbreak(h)}
                  onMouseLeave={() => setHoveredOutbreak(null)}
                >
                  {/* Pulsing ring */}
                  <circle 
                    cx={x} 
                    cy={y} 
                    r={isCritical ? 16 : 10} 
                    className={`origin-center alert-dot-blink ${isCritical ? 'text-rose-500/20' : 'text-teal-500/20'}`} 
                    fill="currentColor"
                  />
                  {/* Outer hazard zone circle */}
                  <circle 
                    cx={x} 
                    cy={y} 
                    r={isCritical ? 8 : 5} 
                    className={isCritical ? 'fill-rose-500/30 stroke-rose-500' : 'fill-teal-500/30 stroke-teal-500'} 
                    strokeWidth="1.5"
                  />
                  {/* Center coordinates node */}
                  <circle 
                    cx={x} 
                    cy={y} 
                    r="2" 
                    className={isCritical ? 'fill-rose-500' : 'fill-teal-500'} 
                  />
                </g>
              );
            })}
          </svg>

          {/* Map legend overlay */}
          <div className="absolute bottom-4 left-4 bg-theme-card p-3 rounded-lg border border-theme-border text-[10px] font-mono space-y-1 z-20 shadow-md">
            <p className="font-bold text-theme-text border-b border-theme-border pb-1 mb-1">BIOSURVEILLANCE MAP LEGEND</p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-2.5 h-2.5 rounded-full bg-status-red-bg border border-status-red flex items-center justify-center">
                <span className="w-1 h-1 bg-status-red rounded-full" />
              </span>
              <span className="text-theme-text-sec">Critical Threat (&gt;1,000 cases)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-status-green-bg border border-status-green flex items-center justify-center">
                <span className="w-1 h-1 bg-status-green rounded-full" />
              </span>
              <span className="text-theme-text-sec">Active Monitoring Outbreak</span>
            </div>
          </div>

          {/* Hover Details Card */}
          {hoveredOutbreak && (
            <div className="absolute top-4 right-4 bg-theme-card text-theme-text p-4 rounded-xl border border-theme-border max-w-xs z-30 font-mono text-[11px] space-y-2 shadow-lg animate-fadeIn">
              <div className="flex items-center gap-2 border-b border-theme-border pb-1.5">
                <MapPin className="w-4 h-4 text-status-red animate-bounce" />
                <span className="font-bold text-theme-text uppercase tracking-wide">{hoveredOutbreak.country}</span>
              </div>
              <div className="space-y-1">
                <p><span className="text-theme-text-sec">Pathogen:</span> <span className="text-theme-accent font-semibold">{hoveredOutbreak.disease}</span></p>
                <p><span className="text-theme-text-sec">Latitude:</span> {hoveredOutbreak.lat.toFixed(4)}°</p>
                <p><span className="text-theme-text-sec">Longitude:</span> {hoveredOutbreak.lng.toFixed(4)}°</p>
                <p><span className="text-theme-text-sec">Active Cases:</span> <span className={hoveredOutbreak.intensity > 1000 ? 'text-status-red font-bold' : 'text-theme-accent font-bold'}>{hoveredOutbreak.intensity.toLocaleString()}</span></p>
              </div>
              <div className="text-[9px] text-theme-text-sec text-right border-t border-theme-border pt-1">
                GPS BIO-GRID TELEMETRY
              </div>
            </div>
          )}
        </div>
      </div>

      {/* METRIC CARD SUB SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* HIGH RISK REGIONS */}
        <div className="lg:col-span-2 medical-card p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6 border-b border-theme-border pb-4">
            <h2 className="text-lg font-bold flex items-center gap-2 text-theme-text">
              <MapPin className="text-status-red w-5 h-5" />
              High Risk Regions & Active Clusters
            </h2>
            <button onClick={() => onTabChange('surveillance')} className="text-xs font-semibold text-theme-accent hover:text-theme-accent-hover hover:underline transition-colors">
              View All Reports
            </button>
          </div>
          
          <div className="flex-1 overflow-x-auto">
            {stats?.highRiskRegions?.length > 0 ? (
              <table className="w-full text-left medical-table">
                <thead>
                  <tr className="border-b border-theme-border text-theme-text-sec text-xs uppercase font-semibold">
                    <th className="pb-3">Country</th>
                    <th className="pb-3">Primary Pathogen</th>
                    <th className="pb-3 text-right">Active Cases</th>
                    <th className="pb-3 text-right">Severity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-theme-border text-sm">
                  {stats.highRiskRegions.map((region, idx) => (
                    <tr key={idx} className="hover:bg-theme-card-hover">
                      <td className="py-3 font-semibold text-theme-text">{region.country}</td>
                      <td className="py-3 font-mono text-theme-text-sec">{region.disease}</td>
                      <td className="py-3 text-right font-semibold text-theme-text">{region.activeCases.toLocaleString()}</td>
                      <td className="py-3 text-right">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          region.severity === 'Critical' 
                            ? 'bg-status-red-bg text-status-red border border-status-red-border' 
                            : 'bg-status-orange-bg text-status-orange border border-status-orange-border'
                        }`}>
                          {region.severity}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="h-full flex flex-col items-center justify-center py-12 text-theme-text-sec">
                <Award className="w-12 h-12 mb-3 text-status-green opacity-40" />
                <p>No high-risk disease clusters detected.</p>
              </div>
            )}
          </div>
        </div>

        {/* ACTIVE ALERTS - ALARM BROADCAST PANEL WITH FLASHING ALERTS */}
        <div id="emergency-bulletins" className="medical-card p-6 flex flex-col justify-between transition-all duration-500">
          <div>
            <div className="flex items-center justify-between mb-6 border-b border-theme-border pb-4">
              <h2 className="text-lg font-bold flex items-center gap-2 text-theme-text">
                <AlertTriangle className="text-status-red w-5 h-5 alert-dot-blink" />
                Emergency Bulletins
              </h2>
            </div>
            
            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
              {activeAlerts.length > 0 ? (
                activeAlerts.map((alert) => (
                  <div 
                    key={alert._id} 
                    className={`p-4 rounded-xl border flex gap-3 relative group ${
                      alert.level === 'Danger' 
                        ? 'bg-status-red-bg border-status-red-border text-theme-text' 
                        : alert.level === 'Warning' 
                          ? 'bg-status-orange-bg border-status-orange-border text-theme-text'
                          : 'bg-status-blue-bg border-status-blue-border text-theme-text'
                    }`}
                  >
                    <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                      alert.level === 'Danger' ? 'text-status-red alert-dot-blink' : alert.level === 'Warning' ? 'text-status-orange' : 'text-status-blue'
                    }`} />
                    <div className="flex-1">
                      <h3 className="font-bold text-sm text-theme-text">{alert.title}</h3>
                      <p className="text-xs mt-1 text-theme-text-sec leading-relaxed">{alert.description}</p>
                    </div>
                    {onResolveAlert && (
                      <button
                        onClick={() => onResolveAlert(alert._id)}
                        className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-theme-text-sec hover:bg-theme-bg hover:text-status-red transition-all opacity-60 group-hover:opacity-100"
                        title="Dismiss Alert"
                      >
                        <span className="text-xs font-bold">✕</span>
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-16 text-theme-text-sec flex flex-col items-center justify-center">
                  <ShieldCheck className="w-12 h-12 text-theme-accent mb-3 opacity-60" />
                  <p className="font-bold text-xs uppercase tracking-wider text-theme-accent">All Sectors Stable</p>
                  <p className="text-[11px] text-theme-text-sec mt-1">No emergency broadcasts active.</p>
                </div>
              )}
            </div>
          </div>
          <div className="border-t border-theme-border pt-4 mt-4 flex justify-between items-center text-[10px] font-mono text-theme-text-sec">
            <span>Threat Assessment Status: DEFCON 4</span>
            <span className="w-2 h-2 rounded-full bg-status-green" />
          </div>
        </div>
      </div>

      {/* METRIC TILES */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="medical-card p-6 flex items-center justify-between">
          <div>
            <p className="text-xs text-theme-text-sec font-semibold uppercase">Recovery Rate</p>
            <p className="text-2xl font-bold mt-2 text-status-green">{stats?.recoveryRate || '0'}%</p>
          </div>
          <Heart className="w-8 h-8 text-status-green opacity-20" />
        </div>
        <div className="medical-card p-6 flex items-center justify-between">
          <div>
            <p className="text-xs text-theme-text-sec font-semibold uppercase">Mortality Rate</p>
            <p className="text-2xl font-bold mt-2 text-status-red">{stats?.mortalityRate || '0'}%</p>
          </div>
          <ShieldAlert className="w-8 h-8 text-status-red opacity-20" />
        </div>
        <div className="medical-card p-6 flex items-center justify-between">
          <div>
            <p className="text-xs text-theme-text-sec font-semibold uppercase">Monitoring Labs</p>
            <p className="text-2xl font-bold mt-2 text-status-blue">{stats?.hospitalCount || '0'}</p>
          </div>
          <FileText className="w-8 h-8 text-status-blue opacity-20" />
        </div>
        <div className="medical-card p-6 flex items-center justify-between">
          <div>
            <p className="text-xs text-theme-text-sec font-semibold uppercase">Total Data Feeds</p>
            <p className="text-2xl font-bold mt-2 text-theme-accent">{stats?.totalReports || '0'}</p>
          </div>
          <Activity className="w-8 h-8 text-theme-accent opacity-20" />
        </div>
      </div>
    </div>
  );
};

export default GlobalDashboard;
