import React, { useState } from 'react';
import { BedDouble, Plus, X, Phone, Building2, MapPin, Layers, HeartHandshake, Siren, Ambulance } from 'lucide-react';
import { hasRole } from '../utils/auth';
import { playSound } from '../utils/sound';

// ICU triage tiers by bed occupancy
const getTier = (rate) => {
  if (rate > 85) return { key: 'critical', label: 'CRITICAL', badge: 'bg-status-red-bg text-status-red border-status-red-border', bar: 'bg-rose-500' };
  if (rate >= 70) return { key: 'elevated', label: 'ELEVATED', badge: 'bg-status-orange-bg text-status-orange border-status-orange-border', bar: 'bg-orange-500' };
  return { key: 'normal', label: 'NORMAL', badge: 'bg-status-green-bg text-status-green border-status-green-border', bar: 'bg-emerald-500' };
};

const SURGE_KEY = 'gmx_surge_beds';
const SURGE_EXPANSION = 0.2; // Code Black adds field beds equal to +20% of registered capacity

const readSurge = () => {
  try {
    const raw = localStorage.getItem(SURGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
};

// The API expects the full record on update
const hospitalPayload = (h, overrides) => ({
  name: h.name,
  country: h.country,
  city: h.city,
  totalBeds: h.totalBeds,
  availableBeds: h.availableBeds,
  activeCases: h.activeCases,
  contactNumber: h.contactNumber,
  ...overrides
});

const HospitalManager = ({ hospitals, onRegisterHospital, onUpdateHospital, onDeleteHospital }) => {
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  // ICU surge protocol state
  const [surge, setSurge] = useState(readSurge); // { hospitalId: fieldBedsAdded }
  const [busyId, setBusyId] = useState(null);
  const [dispatchLog, setDispatchLog] = useState([]);

  // Form states
  const [name, setName] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [totalBeds, setTotalBeds] = useState(0);
  const [availableBeds, setAvailableBeds] = useState(0);
  const [activeCases, setActiveCases] = useState(0);
  const [contactNumber, setContactNumber] = useState('');

  const openRegisterModal = () => {
    setEditMode(false);
    setName('');
    setCountry('');
    setCity('');
    setTotalBeds(0);
    setAvailableBeds(0);
    setActiveCases(0);
    setContactNumber('');
    setShowModal(true);
  };

  const openEditModal = (hosp) => {
    setEditMode(true);
    setSelectedId(hosp._id);
    setName(hosp.name);
    setCountry(hosp.country);
    setCity(hosp.city);
    setTotalBeds(hosp.totalBeds);
    setAvailableBeds(hosp.availableBeds);
    setActiveCases(hosp.activeCases);
    setContactNumber(hosp.contactNumber);
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      name, country, city,
      totalBeds: Number(totalBeds),
      availableBeds: Number(availableBeds),
      activeCases: Number(activeCases),
      contactNumber
    };

    if (editMode) {
      onUpdateHospital(selectedId, data);
    } else {
      onRegisterHospital(data);
    }
    setShowModal(false);
  };

  const saveSurge = (next) => {
    setSurge(next);
    try {
      localStorage.setItem(SURGE_KEY, JSON.stringify(next));
    } catch (e) {
      // storage unavailable, state still works for this session
    }
  };

  const pushLog = (text) => {
    setDispatchLog((prev) => [{ id: `${Date.now()}-${Math.random()}`, time: new Date().toLocaleTimeString(), text }, ...prev].slice(0, 8));
  };

  // Code Black: open field beds equal to +20% of capacity
  const activateSurge = async (h, currentSurge = surge) => {
    if (currentSurge[h._id]) return currentSurge;
    const added = Math.max(1, Math.round(h.totalBeds * SURGE_EXPANSION));
    await onUpdateHospital(h._id, hospitalPayload(h, {
      totalBeds: h.totalBeds + added,
      availableBeds: h.availableBeds + added
    }));
    pushLog(`CODE BLACK at ${h.name}: +${added} field beds opened`);
    return { ...currentSurge, [h._id]: added };
  };

  const handleActivateSurge = async (h) => {
    setBusyId(h._id);
    try {
      const next = await activateSurge(h);
      saveSurge(next);
      playSound('warn');
    } finally {
      setBusyId(null);
    }
  };

  const handleStandDown = async (h) => {
    const added = surge[h._id];
    if (!added) return;
    setBusyId(h._id);
    try {
      const occupied = h.totalBeds - h.availableBeds;
      const newTotal = Math.max(1, h.totalBeds - added);
      await onUpdateHospital(h._id, hospitalPayload(h, {
        totalBeds: newTotal,
        availableBeds: Math.max(0, newTotal - occupied)
      }));
      const next = { ...surge };
      delete next[h._id];
      saveSurge(next);
      pushLog(`STAND DOWN at ${h.name}: field beds closed`);
      playSound('success');
    } finally {
      setBusyId(null);
    }
  };

  // Network-wide Code Black for every hospital currently above 85% occupancy
  const handleNetworkSurge = async () => {
    const targets = hospitals.filter((h) => {
      const rate = h.totalBeds > 0 ? Math.round(((h.totalBeds - h.availableBeds) / h.totalBeds) * 100) : 0;
      return rate > 85 && !surge[h._id];
    });
    if (targets.length === 0) return;

    setBusyId('network');
    try {
      let next = { ...surge };
      for (const h of targets) {
        next = await activateSurge(h, next);
      }
      saveSurge(next);
      playSound('warn');
    } finally {
      setBusyId(null);
    }
  };

  // Best receiving hospital: same country first, then most free beds
  const getDiversion = (h) => {
    const occupied = h.totalBeds - h.availableBeds;
    const candidates = hospitals.filter((o) => o._id !== h._id && o.availableBeds > 0);
    if (candidates.length === 0 || occupied <= 0) return null;

    candidates.sort((a, b) =>
      (b.country === h.country) - (a.country === h.country) || b.availableBeds - a.availableBeds
    );
    const target = candidates[0];
    const count = Math.min(Math.max(1, Math.ceil(occupied * 0.05)), target.availableBeds);
    return { target, count };
  };

  const handleDivert = async (h) => {
    const plan = getDiversion(h);
    if (!plan) return;
    const { target, count } = plan;

    setBusyId(h._id);
    try {
      await onUpdateHospital(h._id, hospitalPayload(h, {
        availableBeds: h.availableBeds + count,
        activeCases: Math.max(0, h.activeCases - count)
      }));
      await onUpdateHospital(target._id, hospitalPayload(target, {
        availableBeds: target.availableBeds - count,
        activeCases: target.activeCases + count
      }));
      pushLog(`AMBULANCE DISPATCH: ${count} patients diverted ${h.name} → ${target.name}`);
      playSound('success');
    } finally {
      setBusyId(null);
    }
  };

  // Network summary
  const tierCounts = { critical: 0, elevated: 0, normal: 0 };
  let networkBeds = 0;
  let networkOccupied = 0;
  hospitals.forEach((h) => {
    const rate = h.totalBeds > 0 ? Math.round(((h.totalBeds - h.availableBeds) / h.totalBeds) * 100) : 0;
    tierCounts[getTier(rate).key] += 1;
    networkBeds += h.totalBeds;
    networkOccupied += h.totalBeds - h.availableBeds;
  });
  const networkRate = networkBeds > 0 ? Math.round((networkOccupied / networkBeds) * 100) : 0;
  const pendingCritical = hospitals.filter((h) => {
    const rate = h.totalBeds > 0 ? Math.round(((h.totalBeds - h.availableBeds) / h.totalBeds) * 100) : 0;
    return rate > 85 && !surge[h._id];
  }).length;

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight font-mono text-gradient-stable">HOSPITAL MANAGEMENT</h1>
          <p className="text-theme-text-sec mt-1">Track healthcare capacity, available beds, active caseloads, and direct facility contacts.</p>
        </div>
        <button 
          onClick={openRegisterModal}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-status-green hover:bg-emerald-500 font-semibold text-theme-text transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Register Hospital
        </button>
      </div>

      {/* ICU TRIAGE COMMAND PANEL */}
      <div className="glass-panel rounded-2xl border border-theme-border p-6 font-mono">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2 text-theme-text">
              <Siren className="w-5 h-5 text-status-red" />
              ICU TRIAGE & SURGE COMMAND
            </h2>
            <p className="text-xs text-theme-text-sec mt-1">
              Tiers: Normal under 70% occupancy, Elevated 70 to 85%, Critical above 85%. Code Black opens field beds worth +20% of capacity.
            </p>
          </div>
          <button
            onClick={handleNetworkSurge}
            disabled={pendingCritical === 0 || busyId !== null}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-status-red hover:bg-rose-500 font-bold text-white text-xs shadow-md transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
          >
            <Siren className="w-4 h-4" />
            {busyId === 'network'
              ? 'Activating...'
              : pendingCritical > 0
              ? `Code Black: ${pendingCritical} Critical Hospital${pendingCritical === 1 ? '' : 's'}`
              : 'No Critical Hospitals Pending'}
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5 text-xs">
          <div className="bg-theme-bg p-3 rounded-xl border border-theme-border">
            <span className="text-[10px] text-theme-text-sec uppercase block">Network Occupancy</span>
            <span className="text-lg font-bold text-theme-text mt-1 block">{networkRate}%</span>
          </div>
          <div className="bg-theme-bg p-3 rounded-xl border border-status-red-border">
            <span className="text-[10px] text-theme-text-sec uppercase block">Critical</span>
            <span className="text-lg font-bold text-status-red mt-1 block">{tierCounts.critical}</span>
          </div>
          <div className="bg-theme-bg p-3 rounded-xl border border-status-orange-border">
            <span className="text-[10px] text-theme-text-sec uppercase block">Elevated</span>
            <span className="text-lg font-bold text-status-orange mt-1 block">{tierCounts.elevated}</span>
          </div>
          <div className="bg-theme-bg p-3 rounded-xl border border-status-green-border">
            <span className="text-[10px] text-theme-text-sec uppercase block">Normal</span>
            <span className="text-lg font-bold text-status-green mt-1 block">{tierCounts.normal}</span>
          </div>
        </div>

        {dispatchLog.length > 0 && (
          <div className="mt-5 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-1.5 max-h-36 overflow-y-auto">
            {dispatchLog.map((entry) => (
              <div key={entry.id} className="text-emerald-400">
                <span className="text-slate-500">[{entry.time}]</span> {entry.text}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* HOSPITAL CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {hospitals.length > 0 ? (
          hospitals.map((hosp) => {
            const occupancyRate = hosp.totalBeds > 0 ? Math.round(((hosp.totalBeds - hosp.availableBeds) / hosp.totalBeds) * 100) : 0;
            const tier = getTier(occupancyRate);
            const surgeBeds = surge[hosp._id];
            const diversion = tier.key === 'critical' ? getDiversion(hosp) : null;
            const busy = busyId !== null;
            return (
              <div key={hosp._id} className="glass-panel rounded-2xl border border-theme-border p-6 flex flex-col justify-between hover:border-theme-border transition-colors">
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-status-blue-bg rounded-xl">
                        <Building2 className="w-6 h-6 text-status-blue" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-theme-text leading-tight">{hosp.name}</h2>
                        <p className="text-xs text-theme-text-sec flex items-center gap-1 mt-1 font-semibold">
                          <MapPin className="w-3 h-3 text-status-red" />
                          {hosp.city}, {hosp.country}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => openEditModal(hosp)}
                        className="text-xs px-2.5 py-1.5 bg-theme-bg rounded-lg hover:bg-theme-card-hover font-semibold text-status-blue transition-colors"
                      >
                        Edit
                      </button>
                      {hasRole(['admin']) && (
                        <button 
                          onClick={() => onDeleteHospital(hosp._id)}
                          className="text-xs px-2.5 py-1.5 bg-status-red-bg rounded-lg hover:bg-status-red-bg font-semibold text-status-red transition-colors"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>

                  {/* BED STATS */}
                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="bg-theme-card-hover p-3 rounded-xl border border-slate-300/50 dark:border-slate-700/50">
                      <p className="text-[10px] text-theme-text-sec font-semibold uppercase tracking-wider">Total Beds</p>
                      <p className="text-lg font-bold text-theme-text mt-1">{hosp.totalBeds.toLocaleString()}</p>
                    </div>
                    <div className="bg-theme-card-hover p-3 rounded-xl border border-slate-300/50 dark:border-slate-700/50">
                      <p className="text-[10px] text-theme-text-sec font-semibold uppercase tracking-wider">Available</p>
                      <p className="text-lg font-bold text-status-green mt-1">{hosp.availableBeds.toLocaleString()}</p>
                    </div>
                    <div className="bg-theme-card-hover p-3 rounded-xl border border-slate-300/50 dark:border-slate-700/50">
                      <p className="text-[10px] text-theme-text-sec font-semibold uppercase tracking-wider">Active Cases</p>
                      <p className="text-lg font-bold text-status-orange mt-1">{hosp.activeCases.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* CAPACITY PROGRESS BAR */}
                  <div className="mt-6">
                    <div className="flex justify-between items-center text-xs font-semibold mb-2">
                      <span className="text-theme-text-sec flex items-center gap-2">
                        Bed Occupancy Rate
                        <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${tier.badge}`}>{tier.label}</span>
                        {surgeBeds && (
                          <span className="px-2 py-0.5 rounded border text-[10px] font-bold bg-status-red-bg text-status-red border-status-red-border">
                            SURGE ACTIVE +{surgeBeds}
                          </span>
                        )}
                      </span>
                      <span className={occupancyRate > 85 ? 'text-status-red' : 'text-theme-text'}>{occupancyRate}%</span>
                    </div>
                    <div className="w-full bg-theme-bg h-2.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${tier.bar}`} 
                        style={{ width: `${Math.min(100, occupancyRate)}%` }}
                      />
                    </div>
                  </div>

                  {/* TRIAGE ACTIONS */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {surgeBeds ? (
                      <button
                        onClick={() => handleStandDown(hosp)}
                        disabled={busy}
                        className="flex items-center gap-1.5 text-xs px-3 py-2 bg-theme-bg border border-theme-border rounded-lg font-semibold text-theme-text hover:bg-theme-card-hover transition-colors disabled:opacity-50"
                      >
                        Stand Down Surge
                      </button>
                    ) : (
                      <button
                        onClick={() => handleActivateSurge(hosp)}
                        disabled={busy}
                        className="flex items-center gap-1.5 text-xs px-3 py-2 bg-status-red-bg border border-status-red-border rounded-lg font-semibold text-status-red hover:bg-status-red hover:text-white transition-colors disabled:opacity-50"
                      >
                        <Siren className="w-3.5 h-3.5" />
                        Activate Code Black
                      </button>
                    )}
                    {diversion && (
                      <button
                        onClick={() => handleDivert(hosp)}
                        disabled={busy}
                        className="flex items-center gap-1.5 text-xs px-3 py-2 bg-status-blue-bg border border-status-blue-border rounded-lg font-semibold text-status-blue hover:bg-status-blue hover:text-white transition-colors disabled:opacity-50"
                        title={`Divert to ${diversion.target.name}`}
                      >
                        <Ambulance className="w-3.5 h-3.5" />
                        Divert {diversion.count} to {diversion.target.name}
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-6 pt-4 border-t border-theme-border text-xs font-semibold text-theme-text-sec">
                  <Phone className="w-3.5 h-3.5 text-status-blue" />
                  <span>Contact:</span>
                  <span className="text-theme-text font-mono">{hosp.contactNumber}</span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="md:col-span-2 glass-panel p-12 text-center text-theme-text-sec rounded-2xl">
            <Building2 className="w-12 h-12 text-theme-text-sec mx-auto mb-3" />
            <p>No medical facilities registered in the database.</p>
          </div>
        )}
      </div>

      {/* REGISTRATION MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-theme-card border border-theme-border w-full max-w-lg rounded-2xl shadow-2xl p-6 relative">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute right-4 top-4 p-1 rounded-lg text-theme-text-sec hover:bg-theme-bg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold font-mono text-theme-text mb-6">
              {editMode ? 'EDIT HOSPITAL DETAILS' : 'REGISTER NEW HOSPITAL'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-theme-text-sec uppercase mb-2">Hospital Name</label>
                <input 
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Mayo Clinic"
                  className="w-full bg-theme-bg border border-theme-border p-3 rounded-xl text-sm focus:outline-none focus:border-theme-accent text-theme-text"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                <div>
                  <label className="block text-xs font-semibold text-theme-text-sec uppercase mb-2">City</label>
                  <input 
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Rochester"
                    className="w-full bg-theme-bg border border-theme-border p-3 rounded-xl text-sm focus:outline-none focus:border-theme-accent text-theme-text"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-theme-text-sec uppercase mb-2">Total Beds</label>
                  <input 
                    type="number"
                    min="0"
                    required
                    value={totalBeds}
                    onChange={(e) => setTotalBeds(e.target.value)}
                    className="w-full bg-theme-bg border border-theme-border p-3 rounded-xl text-sm focus:outline-none focus:border-theme-accent text-theme-text"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-theme-text-sec uppercase mb-2">Available Beds</label>
                  <input 
                    type="number"
                    min="0"
                    required
                    value={availableBeds}
                    onChange={(e) => setAvailableBeds(e.target.value)}
                    className="w-full bg-theme-bg border border-theme-border p-3 rounded-xl text-sm focus:outline-none focus:border-theme-accent text-theme-text"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-theme-text-sec uppercase mb-2">Active Cases</label>
                  <input 
                    type="number"
                    min="0"
                    required
                    value={activeCases}
                    onChange={(e) => setActiveCases(e.target.value)}
                    className="w-full bg-theme-bg border border-theme-border p-3 rounded-xl text-sm focus:outline-none focus:border-theme-accent text-theme-text"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-theme-text-sec uppercase mb-2">Emergency Hotline</label>
                <input 
                  type="text"
                  required
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="e.g. +1-800-555-0199"
                  className="w-full bg-theme-bg border border-theme-border p-3 rounded-xl text-sm focus:outline-none focus:border-theme-accent text-theme-text"
                />
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
                  className="px-6 py-2.5 bg-status-green hover:bg-emerald-500 text-sm font-semibold rounded-xl text-theme-text transition-all active:scale-95"
                >
                  {editMode ? 'Save Changes' : 'Register'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HospitalManager;
