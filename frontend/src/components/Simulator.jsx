import React, { useState } from 'react';
import { 
  ShieldAlert, Users, Truck, PlaneTakeoff, Zap, Play, CheckCircle2, 
  Loader2, Sparkles, CloudOff, Database, Cpu, Crosshair, Target, 
  Radio, MapPin, AlertTriangle, ShieldCheck, History, RefreshCw, X
} from 'lucide-react';

const SECTOR_COORDINATES = {
  'United States': { lat: '37.0902° N', lng: '95.7129° W', sector: 'SECTOR-AMER-NORTH // CDC ATLANTA HUB', bsl: 'BSL-3', radius: '1,200 km', popAtRisk: '42.5M', velocity: '380 cases/day' },
  'India': { lat: '20.5937° N', lng: '78.9629° E', sector: 'SECTOR-APAC-SOUTH // NEW DELHI EPIDEMIC CORE', bsl: 'BSL-4', radius: '980 km', popAtRisk: '85.2M', velocity: '540 cases/day' },
  'Brazil': { lat: '14.2350° S', lng: '51.9253° W', sector: 'SECTOR-AMER-SOUTH // AMAZON BASIN ZONE', bsl: 'BSL-3', radius: '750 km', popAtRisk: '28.1M', velocity: '290 cases/day' },
  'Democratic Republic of Congo': { lat: '4.0383° S', lng: '21.7587° E', sector: 'SECTOR-AFRICA-CENTRAL // CONGO BIOHAZARD ZONE', bsl: 'BSL-4', radius: '620 km', popAtRisk: '12.4M', velocity: '410 cases/day' },
  'United Kingdom': { lat: '55.3781° N', lng: '3.4360° W', sector: 'SECTOR-EUROPE-WEST // PORTON DOWN MONITOR', bsl: 'BSL-3', radius: '450 km', popAtRisk: '18.9M', velocity: '180 cases/day' },
  'South Africa': { lat: '30.5595° S', lng: '22.9375° E', sector: 'SECTOR-AFRICA-SOUTH // TRANSIT HUB CORRIDOR', bsl: 'BSL-3', radius: '580 km', popAtRisk: '16.7M', velocity: '220 cases/day' },
  'Australia': { lat: '25.2744° S', lng: '133.7751° E', sector: 'SECTOR-OCEANIA // ISOLATED PERIMETER', bsl: 'BSL-2', radius: '1,400 km', popAtRisk: '8.3M', velocity: '95 cases/day' },
  'Nigeria': { lat: '9.0820° N', lng: '8.6753° E', sector: 'SECTOR-AFRICA-WEST // LAGOS BIOCONTAINMENT', bsl: 'BSL-4', radius: '510 km', popAtRisk: '22.0M', velocity: '310 cases/day' }
};

const DEFAULT_SECTOR_INFO = {
  pandemic_event: {
    sector: 'GLOBAL DISTRIBUTED GRID // 194 WHO REPORTING SECTORS',
    country: 'Worldwide Multi-Zone',
    disease: 'Multi-Strain Viral Surge',
    lat: '0.0000° N',
    lng: '0.0000° E',
    bsl: 'BSL-4 EMERGENCY',
    radius: 'Worldwide Vector',
    popAtRisk: '8.1 Billion',
    velocity: 'Exponential Spread'
  },
  resource_shortage: {
    sector: 'HOSPITAL LOGISTICS CORRIDOR // ALL TIER-1 RESERVES',
    country: 'Global Critical Care Network',
    disease: 'ICU Bed Deficit & Ventilator Depletion',
    lat: '40.7128° N',
    lng: '74.0060° W',
    bsl: 'SUPPLY CODE RED',
    radius: 'Continental Stockpiles',
    popAtRisk: 'Emergency Patients',
    velocity: 'Depletion Rate: 120 units/hr'
  },
  traffic_surge: {
    sector: 'INTERNATIONAL AIRSPACE // JFK - LHR - DEL CORRIDORS',
    country: 'Cross-Border Entry Hubs',
    disease: 'Pathogen Importation Risk Spike',
    lat: '51.4700° N',
    lng: '0.4543° W',
    bsl: 'BORDER LEVEL-4',
    radius: 'Global Air Hubs',
    popAtRisk: '1.4M Daily Travelers',
    velocity: 'Inflow +40% Screenings'
  },
  region_failure: {
    sector: 'CLOUD DATA REGION // AWS US-EAST-1 (N. VIRGINIA)',
    country: 'Cloud Datacenter Infrastructure',
    disease: 'Primary Node Failure & Route53 Failover',
    lat: '39.0438° N',
    lng: '77.4874° W',
    bsl: 'DR LEVEL-1',
    radius: 'Cloud Ingress Zone',
    popAtRisk: 'Microservice Telemetry',
    velocity: 'Failover RTO: <12s'
  },
  cyberattack: {
    sector: 'INGRESS GATEWAY // WAF PERIMETER DEFENSE LAYER',
    country: 'Global API REST Gateway',
    disease: 'DDoS Packet Flood & Rate Limiting',
    lat: '37.7749° N',
    lng: '122.4194° W',
    bsl: 'SEC-OPS ORANGE',
    radius: 'API Edge Network',
    popAtRisk: 'Public JSON Endpoints',
    velocity: 'Attack Volume: 45k req/sec'
  },
  data_corruption: {
    sector: 'DATABASE POD // MONGO-STATEFULSET-REPLICA-0',
    country: 'Primary Data Persistence Layer',
    disease: 'Database Index Checksum Discrepancy',
    lat: '47.6062° N',
    lng: '122.3321° W',
    bsl: 'DATA INTEGRITY',
    radius: 'Storage Engine',
    popAtRisk: 'All Outbreak Records',
    velocity: 'Snapshot Recovery Auto-Init'
  },
  analytics_workload: {
    sector: 'COMPUTE CLUSTER // NODE.JS ENGINE THREAD POOL',
    country: 'Core Server Processing Grid',
    disease: 'CPU Core Computation Saturation (100%)',
    lat: '52.5200° N',
    lng: '13.4050° E',
    bsl: 'HPA SCALE REQ',
    radius: 'Container Runtime',
    popAtRisk: 'Node Event Loop',
    velocity: 'Replica Target: 4 Pods'
  }
};

const Simulator = ({ onTriggerSimulation }) => {
  const [loadingType, setLoadingType] = useState(null);
  const [feedback, setFeedback] = useState(null);

  // Regional outbreak config
  const [selectedCountry, setSelectedCountry] = useState('Brazil');
  const [selectedDisease, setSelectedDisease] = useState('Dengue Fever');

  // --- NEW: ACTIVE LAUNCH RADAR & SECTOR LOCATOR STATE ---
  const [activeLaunch, setActiveLaunch] = useState(null);
  const [countermeasureActive, setCountermeasureActive] = useState(null);
  const [simulationHistory, setSimulationHistory] = useState([
    {
      id: 'init-1',
      title: 'Baseline Surveillance Benchmark',
      sector: 'SECTOR-AMER-NORTH // CDC ATLANTA HUB',
      country: 'United States',
      lat: '37.0902° N',
      lng: '95.7129° W',
      timestamp: 'Initial System Boot',
      status: 'MONITORING NOMINAL'
    }
  ]);

  const handleSimulate = async (type) => {
    setLoadingType(type);
    setFeedback(null);
    setCountermeasureActive(null);

    // Resolve where this simulation is being launched
    let launchMetadata;
    if (type === 'regional_outbreak') {
      const coords = SECTOR_COORDINATES[selectedCountry] || {
        lat: '15.0000° N',
        lng: '45.0000° E',
        sector: `SECTOR-${selectedCountry.toUpperCase()} // REGIONAL HUB`,
        bsl: 'BSL-3',
        radius: '650 km',
        popAtRisk: '20.0M',
        velocity: '280 cases/day'
      };
      launchMetadata = {
        id: `sim-${Date.now()}`,
        type,
        title: `Custom Regional Outbreak: ${selectedDisease} in ${selectedCountry}`,
        country: selectedCountry,
        disease: selectedDisease,
        sector: coords.sector,
        lat: coords.lat,
        lng: coords.lng,
        bsl: coords.bsl,
        radius: coords.radius,
        popAtRisk: coords.popAtRisk,
        velocity: coords.velocity,
        timestamp: new Date().toLocaleTimeString(),
        status: 'ACTIVE OUTBREAK // SPREADING'
      };
    } else {
      const def = DEFAULT_SECTOR_INFO[type] || {
        sector: 'GLOBAL MULTI-CLUSTER NETWORK',
        country: 'Worldwide Sector',
        disease: type.replace(/_/g, ' ').toUpperCase(),
        lat: '0.0000° N',
        lng: '0.0000° E',
        bsl: 'BSL-3',
        radius: 'Global Grid',
        popAtRisk: 'Multi-Region',
        velocity: 'Active Anomaly'
      };
      launchMetadata = {
        id: `sim-${Date.now()}`,
        type,
        title: def.disease,
        country: def.country,
        disease: def.disease,
        sector: def.sector,
        lat: def.lat,
        lng: def.lng,
        bsl: def.bsl,
        radius: def.radius,
        popAtRisk: def.popAtRisk,
        velocity: def.velocity,
        timestamp: new Date().toLocaleTimeString(),
        status: 'INCIDENT TRIGGERED // INVESTIGATING'
      };
    }

    try {
      const response = await onTriggerSimulation(type, selectedCountry, selectedDisease);
      setActiveLaunch(launchMetadata);
      setSimulationHistory(prev => [launchMetadata, ...prev.slice(0, 7)]);
      setFeedback({
        success: true,
        message: response || `Simulation deployed to ${launchMetadata.country} (${launchMetadata.sector}).`
      });
    } catch (err) {
      setFeedback({
        success: false,
        message: err.response?.data?.message || 'Error occurred while triggering simulation.'
      });
    } finally {
      setLoadingType(null);
    }
  };

  const applyCountermeasure = (measureName, statusText) => {
    setCountermeasureActive(measureName);
    if (activeLaunch) {
      const updatedLaunch = {
        ...activeLaunch,
        status: `CONTAINED // ${statusText}`
      };
      setActiveLaunch(updatedLaunch);
      setSimulationHistory(prev => [
        {
          ...updatedLaunch,
          id: `meas-${Date.now()}`,
          title: `Countermeasure: ${measureName} at ${activeLaunch.country}`,
          timestamp: new Date().toLocaleTimeString()
        },
        ...prev.slice(0, 7)
      ]);
    }
  };

  const simulationCards = [
    {
      id: 'pandemic_event',
      title: 'Global Pandemic Surge',
      description: 'Increases case counts across all reports by 15-30%, launches critical alarms, and records a new monitoring node.',
      icon: ShieldAlert,
      color: 'text-status-red border-status-red-border hover:border-rose-500/40 bg-rose-500/5 hover:bg-status-red-bg',
      category: 'Surveillance'
    },
    {
      id: 'resource_shortage',
      title: 'Stockpile Depletion & Bed Strain',
      description: 'Slashes hospital available bed capacity to 2% and maximizes regional vaccine/ventilator resource allocation to 100%.',
      icon: Truck,
      color: 'text-status-orange border-orange-500/20 hover:border-orange-500/40 bg-orange-500/5 hover:bg-status-orange-bg',
      category: 'Hospital Logistics'
    },
    {
      id: 'traffic_surge',
      title: 'Border Crossing Traffic Surge',
      description: 'Simulates flight passenger arrivals at airports, increasing health screen volumes and quarantine isolations.',
      icon: PlaneTakeoff,
      color: 'text-status-blue border-blue-500/20 hover:border-blue-500/40 bg-blue-500/5 hover:bg-status-blue-bg',
      category: 'Border Control'
    },
    {
      id: 'region_failure',
      title: 'Cloud Region Outage',
      description: 'Simulates primary AWS us-east-1 datacenter node connection drops, validating Route53 DNS automated failovers.',
      icon: CloudOff,
      color: 'text-red-400 border-red-500/20 hover:border-red-500/40 bg-red-500/5 hover:bg-red-500/10',
      category: 'IaC Infrastructure'
    },
    {
      id: 'cyberattack',
      title: 'Cyberattack Blockade',
      description: 'Simulates high-volume DDoS packets targeting API REST endpoints, auditing Web Application Firewall defense rules.',
      icon: ShieldAlert,
      color: 'text-theme-accent border-purple-500/20 hover:border-purple-500/40 bg-purple-500/5 hover:bg-emerald-500/10',
      category: 'Security WAF'
    },
    {
      id: 'data_corruption',
      title: 'Data Corruption Check',
      description: 'Simulates database index checksum discrepancies, testing automated restore backup recovery playbooks.',
      icon: Database,
      color: 'text-yellow-400 border-yellow-500/20 hover:border-yellow-500/40 bg-yellow-500/5 hover:bg-yellow-500/10',
      category: 'Disaster Recovery'
    },
    {
      id: 'analytics_workload',
      title: 'Analytics Engine Overload',
      description: 'Spikes actual Node.js process CPU cores computation threads, inducing a real-time telemetry load peak.',
      icon: Cpu,
      color: 'text-cyan-400 border-cyan-500/20 hover:border-cyan-500/40 bg-cyan-500/5 hover:bg-cyan-500/10',
      category: 'Performance Stress'
    }
  ];

  return (
    <div className="space-y-8 font-mono">
      {/* HEADER */}
      <div className="pb-2 border-b border-theme-border">
        <h1 className="text-3xl font-black tracking-tight text-theme-text flex items-center gap-3">
          <Crosshair className="w-8 h-8 text-status-red" />
          OUTBREAK SIMULATION & GROUND ZERO RADAR
        </h1>
        <p className="text-theme-text-sec text-xs mt-1">
          Tactical Disease Spread Engine // Real-Time Target Sector Coordinates & Bio-hazard Containment
        </p>
      </div>

      {/* FEEDBACK PROMPTS */}
      {feedback && (
        <div className={`p-4 rounded-xl border flex gap-3 items-center animate-fadeIn text-xs ${
          feedback.success 
            ? 'bg-status-green-bg border-status-green-border text-status-green' 
            : 'bg-status-red-bg border-status-red-border text-status-red'
        }`}>
          {feedback.success ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-status-green" />
          ) : (
            <ShieldAlert className="w-5 h-5 flex-shrink-0 text-status-red" />
          )}
          <span className="font-bold">{feedback.message}</span>
        </div>
      )}

      {/* --- NEW: GROUND ZERO RADAR & SECTOR LOCATOR BOARD --- */}
      {activeLaunch && (
        <div className="medical-card bg-theme-card rounded-2xl border-2 border-status-red/50 p-6 shadow-2xl relative overflow-hidden animate-fadeIn">
          {/* Top Status Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-theme-border">
            <div className="flex items-center gap-2.5">
              <span className="w-3.5 h-3.5 rounded-full bg-status-red alert-dot-blink" />
              <h2 className="text-sm font-black text-theme-text uppercase tracking-wider flex items-center gap-2">
                <Target className="w-4 h-4 text-status-red" />
                GROUND ZERO LOCATOR // TARGET SECTOR LOCKED
              </h2>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-theme-text-sec">Time of Launch:</span>
              <span className="text-status-red font-bold">{activeLaunch.timestamp}</span>
              <button 
                onClick={() => setActiveLaunch(null)} 
                className="p-1 hover:bg-theme-bg rounded-lg text-theme-text-sec ml-2"
                title="Dismiss Radar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-5">
            {/* RADAR TARGET VISUALIZER */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 relative flex flex-col items-center justify-center text-center overflow-hidden min-h-[200px]">
              {/* Tactical circular radar grid */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-25">
                <div className="w-40 h-40 rounded-full border border-emerald-500 animate-ping" />
                <div className="w-32 h-32 rounded-full border border-emerald-500/40" />
                <div className="w-20 h-20 rounded-full border border-emerald-500/60" />
                <div className="w-0.5 h-44 bg-emerald-500/30 absolute" />
                <div className="h-0.5 w-44 bg-emerald-500/30 absolute" />
              </div>

              {/* Center Target Node */}
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-full bg-rose-500/20 border-2 border-rose-500 flex items-center justify-center mx-auto mb-2 text-rose-400 alert-dot-blink">
                  <MapPin className="w-6 h-6" />
                </div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">{activeLaunch.country}</h4>
                <p className="text-[10px] text-emerald-400 font-mono mt-1">{activeLaunch.lat} , {activeLaunch.lng}</p>
                <span className="inline-block mt-2 px-2.5 py-0.5 rounded text-[9px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40">
                  {activeLaunch.status}
                </span>
              </div>
            </div>

            {/* SECTOR TELEMETRY DATA */}
            <div className="lg:col-span-2 space-y-4">
              <div>
                <span className="text-[10px] text-theme-text-sec uppercase tracking-widest font-bold">Designated Operational Sector:</span>
                <p className="text-base font-black text-theme-text mt-0.5">{activeLaunch.sector}</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-theme-bg p-3 rounded-xl border border-theme-border">
                  <span className="text-theme-text-sec text-[10px] uppercase block">Containment Level</span>
                  <span className="text-sm font-bold text-status-red mt-1 block">{activeLaunch.bsl}</span>
                </div>
                <div className="bg-theme-bg p-3 rounded-xl border border-theme-border">
                  <span className="text-theme-text-sec text-[10px] uppercase block">Impact Radius</span>
                  <span className="text-sm font-bold text-status-orange mt-1 block">{activeLaunch.radius}</span>
                </div>
                <div className="bg-theme-bg p-3 rounded-xl border border-theme-border">
                  <span className="text-theme-text-sec text-[10px] uppercase block">Population Exposed</span>
                  <span className="text-sm font-bold text-theme-accent mt-1 block">{activeLaunch.popAtRisk}</span>
                </div>
                <div className="bg-theme-bg p-3 rounded-xl border border-theme-border">
                  <span className="text-theme-text-sec text-[10px] uppercase block">Transmission Velocity</span>
                  <span className="text-sm font-bold text-status-blue mt-1 block">{activeLaunch.velocity}</span>
                </div>
              </div>

              {/* RAPID COUNTERMEASURES DISPATCH */}
              <div className="pt-3 border-t border-theme-border">
                <span className="text-[10px] text-theme-text-sec font-bold uppercase tracking-wider block mb-2">
                  Execute Immediate Countermeasure Protocol:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <button
                    onClick={() => applyCountermeasure('Vaccine Buffer', 'Vaccine Shield Injected (-40% spread)')}
                    className={`py-2 px-2.5 rounded-xl border font-bold text-[11px] transition-all active:scale-95 ${
                      countermeasureActive === 'Vaccine Buffer'
                        ? 'bg-status-green text-white border-status-green'
                        : 'bg-theme-bg border-theme-border text-theme-text hover:bg-theme-card-hover'
                    }`}
                  >
                    💉 Deploy Vaccine Buffer
                  </button>
                  <button
                    onClick={() => applyCountermeasure('Perimeter Quarantine', 'Level-4 Perimeter Established')}
                    className={`py-2 px-2.5 rounded-xl border font-bold text-[11px] transition-all active:scale-95 ${
                      countermeasureActive === 'Perimeter Quarantine'
                        ? 'bg-status-orange text-white border-status-orange'
                        : 'bg-theme-bg border-theme-border text-theme-text hover:bg-theme-card-hover'
                    }`}
                  >
                    🛡️ Enforce Quarantine
                  </button>
                  <button
                    onClick={() => applyCountermeasure('Ground Airspace', 'Air Corridor Travel Suspended')}
                    className={`py-2 px-2.5 rounded-xl border font-bold text-[11px] transition-all active:scale-95 ${
                      countermeasureActive === 'Ground Airspace'
                        ? 'bg-status-red text-white border-status-red'
                        : 'bg-theme-bg border-theme-border text-theme-text hover:bg-theme-card-hover'
                    }`}
                  >
                    ✈️ Ground Airspace
                  </button>
                  <button
                    onClick={() => applyCountermeasure('Disinfect Sector', 'Sector Restored to Nominal Baseline')}
                    className={`py-2 px-2.5 rounded-xl border font-bold text-[11px] transition-all active:scale-95 ${
                      countermeasureActive === 'Disinfect Sector'
                        ? 'bg-status-blue text-white border-status-blue'
                        : 'bg-theme-bg border-theme-border text-theme-text hover:bg-theme-card-hover'
                    }`}
                  >
                    🔄 Neutralize Sector
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REGIONAL OUTBREAK CUSTOM SIMULATOR */}
      <div className="medical-card bg-theme-card p-6 sm:p-8 rounded-2xl border border-theme-border">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-status-orange" />
            <div>
              <h2 className="text-lg font-bold text-theme-text">TARGETED REGIONAL OUTBREAK LAUNCHER</h2>
              <p className="text-xs text-theme-text-sec mt-0.5">
                Select target geographical sector & pathogen strain to simulate localized biosurveillance spikes.
              </p>
            </div>
          </div>
          <button 
            onClick={() => handleSimulate('regional_outbreak')}
            disabled={loadingType !== null}
            className="flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-500 font-bold rounded-xl text-xs transition-all text-white active:scale-95 disabled:opacity-50 shadow-md"
          >
            {loadingType === 'regional_outbreak' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Simulating Vector...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                Deploy to {selectedCountry}
              </>
            )}
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div>
            <label className="block text-theme-text-sec font-bold uppercase text-[10px] mb-2">Target Sector Country</label>
            <select 
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full bg-theme-bg border border-theme-border px-4 py-3 rounded-xl text-xs focus:outline-none focus:border-theme-accent text-theme-text"
            >
              <option value="Democratic Republic of Congo">Democratic Republic of Congo (Central Africa - BSL-4)</option>
              <option value="Brazil">Brazil (South America - Dengue Zone)</option>
              <option value="India">India (Asia-Pacific - COVID / Viral Hotspot)</option>
              <option value="Nigeria">Nigeria (West Africa - Lassa Containment)</option>
              <option value="United States">United States (North America - CDC Hub)</option>
              <option value="United Kingdom">United Kingdom (Western Europe - Porton Down)</option>
              <option value="South Africa">South Africa (Southern Africa - TB Ward)</option>
              <option value="Australia">Australia (Oceania - Perimeter)</option>
            </select>
          </div>

          <div>
            <label className="block text-theme-text-sec font-bold uppercase text-[10px] mb-2">Pathogen Bio-Agent Strain</label>
            <select 
              value={selectedDisease}
              onChange={(e) => setSelectedDisease(e.target.value)}
              className="w-full bg-theme-bg border border-theme-border px-4 py-3 rounded-xl text-xs focus:outline-none focus:border-theme-accent text-theme-text"
            >
              <option value="Ebola">Ebola (Filovirus - 50% Mortality)</option>
              <option value="Dengue Fever">Dengue Fever (Flavivirus - Vector)</option>
              <option value="COVID-19">COVID-19 (Coronaviridae - High R0)</option>
              <option value="Lassa Fever">Lassa Fever (Arenaviridae - Hemorrhagic)</option>
              <option value="Influenza">Influenza Strain H5N1 (Orthomyxoviridae)</option>
              <option value="Tuberculosis">Tuberculosis (Mycobacterium - Respiratory)</option>
            </select>
          </div>
        </div>
      </div>

      {/* MAIN CARDS GRID */}
      <div>
        <h3 className="text-sm font-bold text-theme-text uppercase tracking-wider mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-theme-accent" />
          SYSTEM LOAD & INFRASTRUCTURE INCIDENT CATALOG
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {simulationCards.map((card) => {
            const Icon = card.icon;
            const isCurrentLoading = loadingType === card.id;
            return (
              <div key={card.id} className={`medical-card border p-6 rounded-2xl flex flex-col justify-between transition-all duration-300 ${card.color}`}>
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Icon className="w-8 h-8" />
                    <span className="text-[10px] uppercase font-mono tracking-widest font-bold opacity-75">{card.category}</span>
                  </div>
                  <h3 className="text-base font-bold text-theme-text leading-tight">{card.title}</h3>
                  <p className="text-xs text-theme-text-sec mt-2 leading-relaxed">{card.description}</p>
                </div>

                <button 
                  onClick={() => handleSimulate(card.id)}
                  disabled={loadingType !== null}
                  className="mt-6 flex items-center justify-center gap-2 w-full py-2.5 bg-theme-card border border-theme-border hover:bg-theme-bg text-xs font-bold rounded-xl transition-all disabled:opacity-50 text-theme-text active:scale-95"
                >
                  {isCurrentLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-status-green" />
                      Deploying Vector...
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Launch Simulation
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* --- NEW: SIMULATION INCIDENT AUDIT TRAIL TABLE --- */}
      <div className="medical-card bg-theme-card rounded-2xl border border-theme-border overflow-hidden">
        <div className="p-5 border-b border-theme-border bg-theme-card-hover flex justify-between items-center">
          <h2 className="text-sm font-bold flex items-center gap-2 text-theme-text">
            <History className="w-4 h-4 text-theme-accent" />
            SIMULATION INCIDENT AUDIT TRAIL // ACTIVE LOG
          </h2>
          <span className="text-[10px] text-theme-text-sec">Live Dispatch Tracker</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-theme-border text-theme-text-sec text-[10px] uppercase font-bold bg-theme-bg">
                <th className="p-3 pl-6">Timestamp</th>
                <th className="p-3">Simulation Event</th>
                <th className="p-3">Target Sector / Coordinates</th>
                <th className="p-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-border bg-theme-bg/30">
              {simulationHistory.map((item) => (
                <tr key={item.id} className="hover:bg-theme-card-hover transition-colors">
                  <td className="p-3 pl-6 text-theme-text-sec font-mono text-[11px]">{item.timestamp}</td>
                  <td className="p-3 font-bold text-theme-text">{item.title}</td>
                  <td className="p-3 text-theme-text-sec">
                    <span className="text-theme-text font-semibold">{item.sector}</span>
                    <span className="text-[10px] text-theme-accent ml-2 font-mono">({item.lat}, {item.lng})</span>
                  </td>
                  <td className="p-3 text-right">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      item.status.includes('ACTIVE') || item.status.includes('TRIGGERED') 
                        ? 'bg-status-red-bg text-status-red border border-status-red-border' 
                        : item.status.includes('CONTAINED') 
                        ? 'bg-status-orange-bg text-status-orange border border-status-orange-border'
                        : 'bg-status-green-bg text-status-green border border-status-green-border'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Simulator;
