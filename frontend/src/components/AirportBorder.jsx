import React, { useState } from 'react';
import { PlaneTakeoff, Plus, X, ShieldAlert, Heart, ClipboardCheck, Trash2 } from 'lucide-react';
import { hasRole } from '../utils/auth';

const AirportBorder = ({ airports, onAddAirportLog, onUpdateAirportLog, onDeleteAirportLog }) => {
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [passengersScreened, setPassengersScreened] = useState(0);
  const [highRiskFlagged, setHighRiskFlagged] = useState(0);
  const [quarantined, setQuarantined] = useState(0);

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

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight font-mono text-gradient-tech">AIRPORT & BORDER MONITORING</h1>
          <p className="text-theme-text-sec mt-1">Monitor border entry logs, passenger health inspections, and active isolation metrics.</p>
        </div>
        <button 
          onClick={openLogModal}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-status-green hover:bg-emerald-500 font-semibold text-theme-text transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Log Screening Event
        </button>
      </div>

      {/* PORT OF ENTRY TABLE */}
      <div className="glass-panel rounded-2xl border border-theme-border overflow-hidden">
        <div className="p-6 border-b border-theme-border bg-theme-card/20">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-status-green" />
            Active Entry Point Screening Registry
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-theme-border text-theme-text-sec text-xs uppercase font-semibold bg-theme-card/40">
                <th className="p-4 pl-6">Transit Hub / Port</th>
                <th className="p-4">Location</th>
                <th className="p-4 text-right">Passengers Screened</th>
                <th className="p-4 text-right">High Risk Flagged</th>
                <th className="p-4 text-right">Quarantined</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-sm">
              {airports.length > 0 ? (
                airports.map((log) => (
                  <tr key={log._id} className="hover:bg-theme-bg/20">
                    <td className="p-4 pl-6 font-semibold text-theme-text flex items-center gap-2">
                      <PlaneTakeoff className="w-4.5 h-4.5 text-status-blue" />
                      {log.name}
                    </td>
                    <td className="p-4 text-theme-text font-medium">{log.city}, {log.country}</td>
                    <td className="p-4 text-right font-mono text-theme-text">{log.passengersScreened.toLocaleString()}</td>
                    <td className="p-4 text-right font-semibold text-status-orange font-mono">{log.highRiskFlagged.toLocaleString()}</td>
                    <td className="p-4 text-right font-semibold text-status-red font-mono">{log.quarantined.toLocaleString()}</td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={() => openEditModal(log)}
                          className="text-xs px-2.5 py-1.5 bg-theme-bg rounded-lg hover:bg-theme-card-hover font-semibold text-status-blue transition-colors"
                        >
                          Update
                        </button>
                        {hasRole(['admin']) && (
                          <button 
                            onClick={() => onDeleteAirportLog(log._id)}
                            className="p-1.5 bg-status-red-bg hover:bg-status-red-bg text-status-red rounded-lg transition-colors"
                            title="Delete Log"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-theme-text-muted">
                    No border crossing inspection records available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* SCREENING MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-theme-bg/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
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
                  className="w-full bg-theme-bg border border-slate-750 p-3 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
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
                    className="w-full bg-theme-bg border border-slate-750 p-3 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
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
                    className="w-full bg-theme-bg border border-slate-750 p-3 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
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
                    className="w-full bg-theme-bg border border-slate-750 p-3 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
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
                    className="w-full bg-theme-bg border border-slate-750 p-3 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
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
                    className="w-full bg-theme-bg border border-slate-750 p-3 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
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
                  className="px-6 py-2.5 bg-status-green hover:bg-emerald-500 text-sm font-semibold rounded-xl text-theme-text transition-all active:scale-95"
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
