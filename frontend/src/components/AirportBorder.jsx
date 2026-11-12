import React, { useState } from 'react';
import { 
  PlaneTakeoff, Plus, X, ShieldAlert, Heart, ClipboardCheck, 
  Trash2, AlertTriangle, CheckCircle2, Scan, Activity, Sparkles, 
  Radio, FileCheck, ArrowUpRight, Search, Printer
} from 'lucide-react';
import { hasRole } from '../utils/auth';

const INITIAL_FLIGHTS = [
  { id: 'FL-01', flightNo: 'KQ-310', airline: 'Kenya Airways', origin: 'Democratic Republic of Congo', destination: 'London Heathrow (LHR)', passengers: 245, threatScore: 94, pathogen: 'Ebola Outbreak', status: 'Mandatory Isolation', riskLevel: 'Critical' },
  { id: 'FL-02', flightNo: 'LA-801', airline: 'LATAM Airlines', origin: 'Brazil', destination: 'JFK International (JFK)', passengers: 310, threatScore: 78, pathogen: 'Dengue Fever', status: 'Secondary Screening', riskLevel: 'High' },
  { id: 'FL-03', flightNo: 'AI-102', airline: 'Air India', origin: 'India', destination: 'JFK International (JFK)', passengers: 340, threatScore: 65, pathogen: 'COVID-19 Surge', status: 'Antigen Rapid Swab', riskLevel: 'Medium' },
  { id: 'FL-04', flightNo: 'BA-117', airline: 'British Airways', origin: 'United Kingdom', destination: 'Indira Gandhi (DEL)', passengers: 280, threatScore: 32, pathogen: 'Influenza Strain', status: 'Standard Thermal', riskLevel: 'Low' },
  { id: 'FL-05', flightNo: 'QF-001', airline: 'Qantas', origin: 'Australia', destination: 'London Heathrow (LHR)', passengers: 295, threatScore: 14, pathogen: 'Low Risk', status: 'Cleared for Entry', riskLevel: 'Clear' }
];

const PATHOGEN_THREAT_MAP = {
  'Democratic Republic of Congo': { pathogen: 'Ebola Outbreak', score: 94, risk: 'Critical', recommendation: 'Mandatory 14-Day Isolation' },
  'Brazil': { pathogen: 'Dengue Fever Cluster', score: 78, risk: 'High', recommendation: 'Secondary Antigen Swab' },
  'India': { pathogen: 'COVID-19 Surge', score: 65, risk: 'Medium', recommendation: 'Thermal + PCR Verification' },
  'Nigeria': { pathogen: 'Lassa Fever Warning', score: 86, risk: 'Critical', recommendation: 'Biohazard Isolation Protocol' },
  'South Africa': { pathogen: 'Tuberculosis Surveillance', score: 58, risk: 'Medium', recommendation: 'Respiratory Screening' },
  'United Kingdom': { pathogen: 'Influenza Strain A', score: 32, risk: 'Low', recommendation: 'Standard Thermal Check' },
  'United States': { pathogen: 'Seasonal Viral Monitoring', score: 25, risk: 'Low', recommendation: 'Routine Clear' },
  'Australia': { pathogen: 'Minimal Pathogen Activity', score: 14, risk: 'Clear', recommendation: 'Unrestricted Entry' }
};

const AirportBorder = ({ airports, onAddAirportLog, onUpdateAirportLog, onDeleteAirportLog }) => {
  // Existing Hub Modal States
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  // Form states for Hub
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [passengersScreened, setPassengersScreened] = useState(0);
  const [highRiskFlagged, setHighRiskFlagged] = useState(0);
  const [quarantined, setQuarantined] = useState(0);

  // --- BTI: BORDER THREAT INTELLIGENCE STATES ---
  const [flights, setFlights] = useState(() => {
    try {
      const saved = localStorage.getItem('gmx_flights_cache');
      return saved ? JSON.parse(saved) : INITIAL_FLIGHTS;
    } catch (e) {
      return INITIAL_FLIGHTS;
    }
  });

  const [showFlightModal, setShowFlightModal] = useState(false);
  const [simFlightNo, setSimFlightNo] = useState('AF-442');
  const [simAirline, setSimAirline] = useState('Air France');
  const [simOrigin, setSimOrigin] = useState('Democratic Republic of Congo');
  const [simDestination, setSimDestination] = useState('JFK International (JFK)');
  const [simPassengers, setSimPassengers] = useState(260);

  // Digital Clearance Pass Modal State
  const [selectedFlightPass, setSelectedFlightPass] = useState(null);

  const saveFlights = (updated) => {
    setFlights(updated);
    try {
      localStorage.setItem('gmx_flights_cache', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  // Calculate Airport Totals
  const totalScreened = airports.reduce((acc, a) => acc + (a.passengersScreened || 0), 0);
  const totalFlagged = airports.reduce((acc, a) => acc + (a.highRiskFlagged || 0), 0);
  const totalQuarantined = airports.reduce((acc, a) => acc + (a.quarantined || 0), 0);

  const openLogModal = () => {
    setEditMode(false);
    setName('');
    setCity('');
    setCountry('');
    setPassengersScreened(0);
    setHighRiskFlagged(0);
    setQuarantined(0);
    setShowModal(true);
  };

  const openEditModal = (log) => {
    setEditMode(true);
    setSelectedId(log._id);
    setName(log.name);
    setCity(log.city);
    setCountry(log.country);
    setPassengersScreened(log.passengersScreened);
    setHighRiskFlagged(log.highRiskFlagged);
    setQuarantined(log.quarantined);
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      name, city, country,
      passengersScreened: Number(passengersScreened),
      highRiskFlagged: Number(highRiskFlagged),
      quarantined: Number(quarantined)
    };

    if (editMode) {
      onUpdateAirportLog(selectedId, data);
    } else {
      onAddAirportLog(data);
    }
    setShowModal(false);
  };

  // --- BTI FLIGHT SIMULATOR HANDLER ---
  const handleSimulateFlight = (e) => {
    e.preventDefault();
    const threatConfig = PATHOGEN_THREAT_MAP[simOrigin] || {
      pathogen: 'Undetermined Pathogen Strain',
      score: 50,
      risk: 'Medium',
      recommendation: 'Secondary Screening'
    };

    const newFlight = {
      id: `FL-${Date.now()}`,
      flightNo: simFlightNo.toUpperCase().trim(),
      airline: simAirline,
      origin: simOrigin,
      destination: simDestination,
      passengers: Number(simPassengers),
      threatScore: threatConfig.score,
      pathogen: threatConfig.pathogen,
      status: threatConfig.recommendation,
      riskLevel: threatConfig.risk
    };

    const updated = [newFlight, ...flights];
    saveFlights(updated);
    setShowFlightModal(false);
  };

  const handleUpdateFlightStatus = (id, newStatus) => {
    const updated = flights.map(f => f.id === id ? { ...f, status: newStatus } : f);
    saveFlights(updated);
  };

  return (
    <div className="space-y-8 font-mono">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-theme-border">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-theme-text flex items-center gap-3">
            <PlaneTakeoff className="w-8 h-8 text-status-blue" />
            BORDER BIOSECURITY & FLIGHT THREAT ENGINE
          </h1>
          <p className="text-theme-text-sec text-xs mt-1">
            Automated Border Threat Intelligence (BTI) // Correlating Real-time Flight Streams with WHO Outbreak Hotspots
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowFlightModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-status-blue hover:bg-sky-500 font-bold text-white text-xs shadow-md transition-all active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            Assess Inbound Flight
          </button>
          <button 
            onClick={openLogModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-theme-accent hover:bg-theme-accent-hover font-bold text-white text-xs shadow-md transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Log Port Registry
          </button>
        </div>
      </div>

      {/* BIOSECURITY KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="medical-card bg-theme-card p-5 rounded-2xl border border-theme-border">
          <div className="flex justify-between items-start text-theme-text-sec text-[10px] font-bold uppercase tracking-wider">
            <span>Total Travelers Audited</span>
            <ClipboardCheck className="w-4 h-4 text-theme-accent" />
          </div>
          <p className="text-2xl font-bold text-theme-text mt-3">{totalScreened.toLocaleString()}</p>
          <div className="h-1 bg-theme-border rounded-full overflow-hidden mt-3">
            <div className="h-full bg-theme-accent" style={{ width: '100%' }} />
          </div>
        </div>

        <div className="medical-card bg-theme-card p-5 rounded-2xl border border-theme-border">
          <div className="flex justify-between items-start text-theme-text-sec text-[10px] font-bold uppercase tracking-wider">
            <span>High-Risk Travelers Flagged</span>
            <AlertTriangle className="w-4 h-4 text-status-orange" />
          </div>
          <p className="text-2xl font-bold text-status-orange mt-3">{totalFlagged.toLocaleString()}</p>
          <div className="h-1 bg-theme-border rounded-full overflow-hidden mt-3">
            <div className="h-full bg-status-orange" style={{ width: `${Math.min(100, (totalFlagged / (totalScreened || 1)) * 5000)}%` }} />
          </div>
        </div>

        <div className="medical-card bg-theme-card p-5 rounded-2xl border border-theme-border">
          <div className="flex justify-between items-start text-theme-text-sec text-[10px] font-bold uppercase tracking-wider">
            <span>Active Quarantined Beds</span>
            <ShieldAlert className="w-4 h-4 text-status-red" />
          </div>
          <p className="text-2xl font-bold text-status-red mt-3">{totalQuarantined.toLocaleString()}</p>
          <div className="h-1 bg-theme-border rounded-full overflow-hidden mt-3">
            <div className="h-full bg-status-red" style={{ width: `${Math.min(100, (totalQuarantined / 100) * 100)}%` }} />
          </div>
        </div>

        <div className="medical-card bg-theme-card p-5 rounded-2xl border border-theme-border">
          <div className="flex justify-between items-start text-theme-text-sec text-[10px] font-bold uppercase tracking-wider">
            <span>Border Threat Index (BTI)</span>
            <Radio className="w-4 h-4 text-status-blue alert-dot-blink" />
          </div>
          <p className="text-2xl font-bold text-status-blue mt-3">ELEVATED</p>
          <p className="text-[10px] text-theme-text-sec mt-3">Active Cross-Border Vector Monitoring</p>
        </div>
      </div>

      {/* SECTION 1: LIVE INBOUND FLIGHT MANIFEST & THREAT MATRIX */}
      <div className="medical-card bg-theme-card rounded-2xl border border-theme-border overflow-hidden">
        <div className="p-5 border-b border-theme-border bg-theme-card-hover flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h2 className="text-sm font-bold flex items-center gap-2 text-theme-text">
              <Scan className="w-4 h-4 text-status-blue" />
              LIVE INBOUND FLIGHT RISK CORRELATOR (WHO CROSS-REFERENCED)
            </h2>
            <p className="text-[10px] text-theme-text-sec mt-0.5">
              Algorithmically calculating pathogen exposure threat score based on origin country epidemiology.
            </p>
          </div>
          <span className="text-[10px] px-2.5 py-1 rounded-full font-bold bg-status-blue-bg text-status-blue border border-status-blue-border">
            AUTO-ASSESSMENT ACTIVE
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-theme-border text-theme-text-sec text-[10px] uppercase font-bold bg-theme-bg">
                <th className="p-3.5 pl-6">Flight / Airline</th>
                <th className="p-3.5">Origin Sector</th>
                <th className="p-3.5">Dest. Hub</th>
                <th className="p-3.5 text-center">Threat Vector</th>
                <th className="p-3.5 text-center">BTI Score</th>
                <th className="p-3.5">Mandated Protocol</th>
                <th className="p-3.5 text-center">Biosecurity Pass</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-border bg-theme-bg/30">
              {flights.map((flight) => {
                const isCrit = flight.threatScore >= 80;
                const isHigh = flight.threatScore >= 60 && flight.threatScore < 80;
                return (
                  <tr key={flight.id} className="hover:bg-theme-card-hover transition-colors">
                    <td className="p-3.5 pl-6 font-bold text-theme-text">
                      <div className="flex items-center gap-2">
                        <span className="text-status-blue font-mono">{flight.flightNo}</span>
                        <span className="text-[10px] text-theme-text-sec font-normal">({flight.airline})</span>
                      </div>
                    </td>
                    <td className="p-3.5 text-theme-text">{flight.origin}</td>
                    <td className="p-3.5 text-theme-text-sec">{flight.destination}</td>
                    <td className="p-3.5 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isCrit ? 'bg-status-red-bg text-status-red border border-status-red-border' :
                        isHigh ? 'bg-status-orange-bg text-status-orange border border-status-orange-border' :
                        'bg-status-green-bg text-status-green border border-status-green-border'
                      }`}>
                        {flight.pathogen}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <span className={`font-mono font-bold ${
                        isCrit ? 'text-status-red' : isHigh ? 'text-status-orange' : 'text-status-green'
                      }`}>
                        {flight.threatScore}%
                      </span>
                    </td>
                    <td className="p-3.5">
                      <select
                        value={flight.status}
                        onChange={(e) => handleUpdateFlightStatus(flight.id, e.target.value)}
                        className="bg-theme-bg border border-theme-border text-theme-text text-[11px] rounded-lg px-2 py-1 focus:outline-none focus:border-theme-accent"
                      >
                        <option value="Mandatory Isolation">Mandatory 14-Day Isolation</option>
                        <option value="Secondary Screening">Secondary Antigen Swab</option>
                        <option value="Antigen Rapid Swab">Antigen Rapid Swab</option>
                        <option value="Standard Thermal">Standard Thermal Screening</option>
                        <option value="Cleared for Entry">Cleared for Entry</option>
                      </select>
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => setSelectedFlightPass(flight)}
                        className="text-[11px] px-2.5 py-1 bg-theme-bg border border-theme-border hover:bg-theme-card-hover text-theme-accent rounded-lg font-bold transition-all active:scale-95 flex items-center gap-1 mx-auto"
                      >
                        <FileCheck className="w-3.5 h-3.5" />
                        Pass
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 2: ENTRY POINT SCREENING REGISTRY */}
      <div className="medical-card bg-theme-card rounded-2xl border border-theme-border overflow-hidden">
        <div className="p-5 border-b border-theme-border bg-theme-card-hover flex justify-between items-center">
          <h2 className="text-sm font-bold flex items-center gap-2 text-theme-text">
            <ClipboardCheck className="w-4 h-4 text-status-green" />
            REGISTERED BORDER HUBS & PASSENGER CHECKPOINTS
          </h2>
          <span className="text-[10px] text-theme-text-sec">{airports.length} Connected Ports</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-theme-border text-theme-text-sec text-[10px] uppercase font-bold bg-theme-bg">
                <th className="p-3.5 pl-6">Transit Hub / Port</th>
                <th className="p-3.5">Location</th>
                <th className="p-3.5 text-right">Passengers Screened</th>
                <th className="p-3.5 text-right">High Risk Flagged</th>
                <th className="p-3.5 text-right">Quarantined</th>
                <th className="p-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-border bg-theme-bg/30">
              {airports.length > 0 ? (
                airports.map((log) => (
                  <tr key={log._id} className="hover:bg-theme-card-hover transition-colors">
                    <td className="p-3.5 pl-6 font-bold text-theme-text flex items-center gap-2">
                      <PlaneTakeoff className="w-4 h-4 text-status-blue" />
                      {log.name}
                    </td>
                    <td className="p-3.5 text-theme-text">{log.city}, {log.country}</td>
                    <td className="p-3.5 text-right font-bold text-theme-text">{(log.passengersScreened || 0).toLocaleString()}</td>
                    <td className="p-3.5 text-right font-bold text-status-orange">{(log.highRiskFlagged || 0).toLocaleString()}</td>
                    <td className="p-3.5 text-right font-bold text-status-red">{(log.quarantined || 0).toLocaleString()}</td>
                    <td className="p-3.5 text-center">
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={() => openEditModal(log)}
                          className="text-[11px] px-2.5 py-1 bg-theme-bg border border-theme-border rounded-lg hover:bg-theme-card-hover font-semibold text-status-blue transition-colors"
                        >
                          Update
                        </button>
                        {hasRole(['admin']) && (
                          <button 
                            onClick={() => onDeleteAirportLog(log._id)}
                            className="p-1 bg-status-red-bg hover:bg-rose-500/20 text-status-red rounded-lg transition-colors"
                            title="Delete Log"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-theme-text-sec">
                    No border crossing inspection records available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* SIMULATE INBOUND FLIGHT MODAL */}
      {showFlightModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-theme-card border border-theme-border w-full max-w-lg rounded-2xl shadow-2xl p-6 relative">
            <button 
              onClick={() => setShowFlightModal(false)}
              className="absolute right-4 top-4 p-1 rounded-lg text-theme-text-sec hover:bg-theme-bg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold text-theme-text mb-1 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-status-blue" />
              ASSESS INBOUND FLIGHT MANIFEST
            </h2>
            <p className="text-xs text-theme-text-sec mb-5">
              Simulate border biosecurity screening with automated pathogen threat correlation.
            </p>

            <form onSubmit={handleSimulateFlight} className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-theme-text-sec uppercase mb-1.5">Flight Number</label>
                  <input 
                    type="text"
                    required
                    value={simFlightNo}
                    onChange={(e) => setSimFlightNo(e.target.value)}
                    placeholder="e.g. AF-442"
                    className="w-full bg-theme-bg border border-theme-border p-2.5 rounded-xl text-xs text-theme-text focus:outline-none focus:border-theme-accent"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-theme-text-sec uppercase mb-1.5">Airline</label>
                  <input 
                    type="text"
                    required
                    value={simAirline}
                    onChange={(e) => setSimAirline(e.target.value)}
                    placeholder="e.g. Air France"
                    className="w-full bg-theme-bg border border-theme-border p-2.5 rounded-xl text-xs text-theme-text focus:outline-none focus:border-theme-accent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-theme-text-sec uppercase mb-1.5">Origin Country (Outbreak Hotspot)</label>
                <select
                  value={simOrigin}
                  onChange={(e) => setSimOrigin(e.target.value)}
                  className="w-full bg-theme-bg border border-theme-border p-2.5 rounded-xl text-xs text-theme-text focus:outline-none focus:border-theme-accent"
                >
                  <option value="Democratic Republic of Congo">Democratic Republic of Congo (Ebola Alert - Critical 94%)</option>
                  <option value="Nigeria">Nigeria (Lassa Fever - Critical 86%)</option>
                  <option value="Brazil">Brazil (Dengue Outbreak - High 78%)</option>
                  <option value="India">India (COVID-19 - Medium 65%)</option>
                  <option value="South Africa">South Africa (Tuberculosis - Medium 58%)</option>
                  <option value="United Kingdom">United Kingdom (Influenza Strain A - Low 32%)</option>
                  <option value="Australia">Australia (Routine Surveillance - Clear 14%)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-theme-text-sec uppercase mb-1.5">Destination Hub</label>
                  <select
                    value={simDestination}
                    onChange={(e) => setSimDestination(e.target.value)}
                    className="w-full bg-theme-bg border border-theme-border p-2.5 rounded-xl text-xs text-theme-text focus:outline-none focus:border-theme-accent"
                  >
                    <option value="JFK International (JFK)">JFK International (JFK)</option>
                    <option value="London Heathrow (LHR)">London Heathrow (LHR)</option>
                    <option value="Indira Gandhi (DEL)">Indira Gandhi (DEL)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-theme-text-sec uppercase mb-1.5">Passengers Onboard</label>
                  <input 
                    type="number"
                    min="10"
                    required
                    value={simPassengers}
                    onChange={(e) => setSimPassengers(e.target.value)}
                    className="w-full bg-theme-bg border border-theme-border p-2.5 rounded-xl text-xs text-theme-text focus:outline-none focus:border-theme-accent"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-theme-border">
                <button 
                  type="button"
                  onClick={() => setShowFlightModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-theme-text-sec hover:bg-theme-bg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2.5 bg-status-blue hover:bg-sky-500 text-xs font-bold rounded-xl text-white transition-all active:scale-95"
                >
                  Run Risk Assessment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DIGITAL BIOSECURITY PASS MODAL */}
      {selectedFlightPass && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-theme-card border border-theme-border w-full max-w-md rounded-2xl shadow-2xl p-6 relative">
            <button 
              onClick={() => setSelectedFlightPass(null)}
              className="absolute right-4 top-4 p-1 rounded-lg text-theme-text-sec hover:bg-theme-bg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center pb-4 border-b border-theme-border">
              <span className="text-3xl">🛃</span>
              <h3 className="text-base font-bold text-theme-text mt-2">INTERNATIONAL BIOSECURITY PASS</h3>
              <p className="text-[10px] text-theme-text-sec uppercase tracking-widest">Global Border Health Protection Protocol</p>
            </div>

            <div className="space-y-3 py-4 text-xs font-mono border-b border-theme-border">
              <div className="flex justify-between">
                <span className="text-theme-text-sec">Flight Identifier:</span>
                <span className="font-bold text-theme-text">{selectedFlightPass.flightNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-theme-text-sec">Origin / Pathogen Risk:</span>
                <span className="font-bold text-status-red">{selectedFlightPass.origin}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-theme-text-sec">Passengers Audited:</span>
                <span className="font-bold text-theme-text">{selectedFlightPass.passengers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-theme-text-sec">Border Threat Score:</span>
                <span className="font-bold text-status-orange">{selectedFlightPass.threatScore}% (Level {selectedFlightPass.riskLevel})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-theme-text-sec">Mandated Clearance:</span>
                <span className="font-bold text-theme-accent">{selectedFlightPass.status}</span>
              </div>
            </div>

            <div className="pt-4 flex justify-between items-center text-[10px] text-theme-text-sec">
              <div>
                <p>CERT: WHO-PASS-2026-X99</p>
                <p>STATUS: VERIFIED ENTRY RECORD</p>
              </div>
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 bg-theme-bg border border-theme-border rounded-lg text-theme-text font-bold hover:bg-theme-card-hover flex items-center gap-1"
              >
                <Printer className="w-3 h-3" />
                Print Pass
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HUB LOG EDIT/ADD MODAL (ORIGINAL) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-theme-card border border-theme-border w-full max-w-lg rounded-2xl shadow-2xl p-6 relative">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute right-4 top-4 p-1 rounded-lg text-theme-text-sec hover:bg-theme-bg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold font-mono text-theme-text mb-6">
              {editMode ? 'UPDATE SCREENING LOG' : 'LOG SCREENING EVENT'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-theme-text-sec uppercase mb-2">Airport / Border Terminal Name</label>
                <input 
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. JFK Airport"
                  className="w-full bg-theme-bg border border-theme-border p-3 rounded-xl text-sm focus:outline-none focus:border-theme-accent text-theme-text"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-theme-text-sec uppercase mb-2">City</label>
                  <input 
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. New York"
                    className="w-full bg-theme-bg border border-theme-border p-3 rounded-xl text-sm focus:outline-none focus:border-theme-accent text-theme-text"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-theme-text-sec uppercase mb-2">Country</label>
                  <input 
                    type="text"
                    required
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="e.g. United States"
                    className="w-full bg-theme-bg border border-theme-border p-3 rounded-xl text-sm focus:outline-none focus:border-theme-accent text-theme-text"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-theme-text-sec uppercase mb-2">Screened Volume</label>
                  <input 
                    type="number"
                    min="0"
                    required
                    value={passengersScreened}
                    onChange={(e) => setPassengersScreened(e.target.value)}
                    className="w-full bg-theme-bg border border-theme-border p-3 rounded-xl text-sm focus:outline-none focus:border-theme-accent text-theme-text"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-theme-text-sec uppercase mb-2">High Risk Flagged</label>
                  <input 
                    type="number"
                    min="0"
                    required
                    value={highRiskFlagged}
                    onChange={(e) => setHighRiskFlagged(e.target.value)}
                    className="w-full bg-theme-bg border border-theme-border p-3 rounded-xl text-sm focus:outline-none focus:border-theme-accent text-theme-text"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-theme-text-sec uppercase mb-2">Quarantined</label>
                  <input 
                    type="number"
                    min="0"
                    required
                    value={quarantined}
                    onChange={(e) => setQuarantined(e.target.value)}
                    className="w-full bg-theme-bg border border-theme-border p-3 rounded-xl text-sm focus:outline-none focus:border-theme-accent text-theme-text"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-theme-border">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl text-sm text-theme-text-sec hover:bg-theme-bg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2.5 bg-status-green hover:bg-emerald-500 text-sm font-semibold rounded-xl text-white transition-all active:scale-95"
                >
                  {editMode ? 'Save Changes' : 'Log Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AirportBorder;
