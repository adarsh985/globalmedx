import React, { useState } from 'react';
import { Microscope, Plus, X, Tag, FileText, CheckCircle, AlertTriangle, Trash2 } from 'lucide-react';
import { hasRole } from '../utils/auth';

const Laboratory = ({ labs, onRegisterLab, onUpdateLab, onDeleteLab }) => {
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [testsConducted, setTestsConducted] = useState(0);
  const [positiveResults, setPositiveResults] = useState(0);
  const [negativeResults, setNegativeResults] = useState(0);
  const [primaryFocus, setPrimaryFocus] = useState('');

  const openRegisterModal = () => {
    setEditMode(false);
    setName('');
    setCountry('');
    setCity('');
    setTestsConducted(0);
    setPositiveResults(0);
    setNegativeResults(0);
    setPrimaryFocus('');
    setShowModal(true);
  };

  const openEditModal = (lab) => {
    setEditMode(true);
    setSelectedId(lab._id);
    setName(lab.name);
    setCountry(lab.country);
    setCity(lab.city);
    setTestsConducted(lab.testsConducted);
    setPositiveResults(lab.positiveResults);
    setNegativeResults(lab.negativeResults);
    setPrimaryFocus(lab.primaryFocus);
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      name, country, city,
      testsConducted: Number(testsConducted),
      positiveResults: Number(positiveResults),
      negativeResults: Number(negativeResults),
      primaryFocus
    };

    if (editMode) {
      onUpdateLab(selectedId, data);
    } else {
      onRegisterLab(data);
    }
    setShowModal(false);
  };

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight font-mono text-gradient-stable">LABORATORY PORTAL</h1>
          <p className="text-theme-text-sec mt-1">Register regional diagnostic labs, monitor pathogen testing pipelines, and check case positivity counts.</p>
        </div>
        <button 
          onClick={openRegisterModal}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-status-green hover:bg-emerald-500 font-semibold text-theme-text transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Register Laboratory
        </button>
      </div>

      {/* LAB CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {labs.length > 0 ? (
          labs.map((lab) => {
            const positivityRate = lab.testsConducted > 0 ? ((lab.positiveResults / lab.testsConducted) * 100).toFixed(1) : 0;
            return (
              <div key={lab._id} className="glass-panel rounded-2xl border border-theme-border p-6 flex flex-col justify-between hover:border-theme-border transition-colors">
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-status-blue-bg rounded-xl">
                        <Microscope className="w-6 h-6 text-status-blue" />
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-theme-text leading-tight">{lab.name}</h2>
                        <p className="text-xs text-theme-text-sec mt-1">{lab.city}, {lab.country}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-1.5 bg-theme-card-hover w-max px-2.5 py-1 rounded-lg border border-theme-border text-xs text-theme-text font-semibold">
                    <Tag className="w-3.5 h-3.5 text-status-green" />
                    <span>Focus: {lab.primaryFocus}</span>
                  </div>

                  {/* LAB TESTING COUNTERS */}
                  <div className="grid grid-cols-3 gap-3 mt-6">
                    <div className="bg-theme-card-hover p-2.5 rounded-xl border border-theme-border text-center">
                      <p className="text-[10px] text-theme-text-sec font-semibold uppercase">Tests Run</p>
                      <p className="text-sm font-bold text-theme-text mt-1">{lab.testsConducted.toLocaleString()}</p>
                    </div>
                    <div className="bg-theme-card-hover p-2.5 rounded-xl border border-theme-border text-center">
                      <p className="text-[10px] text-theme-text-sec font-semibold uppercase">Positives</p>
                      <p className="text-sm font-bold text-status-red mt-1">{lab.positiveResults.toLocaleString()}</p>
                    </div>
                    <div className="bg-theme-card-hover p-2.5 rounded-xl border border-theme-border text-center">
                      <p className="text-[10px] text-theme-text-sec font-semibold uppercase">Negatives</p>
                      <p className="text-sm font-bold text-status-green mt-1">{lab.negativeResults.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* DIAGNOSTIC GRAPHICS */}
                  <div className="mt-6 p-4 rounded-xl bg-theme-card/40 border border-slate-850 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-status-green" />
                      <span className="text-theme-text-sec font-semibold">Positivity Index:</span>
                    </div>
                    <span className={`font-mono font-bold ${positivityRate > 10 ? 'text-status-red animate-pulse' : 'text-status-green'}`}>
                      {positivityRate}%
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 justify-end mt-6 pt-4 border-t border-theme-border">
                  <button 
                    onClick={() => openEditModal(lab)}
                    className="text-xs px-3 py-1.5 bg-slate-850 hover:bg-theme-bg rounded-lg text-status-blue font-semibold transition-colors"
                  >
                    Edit Logs
                  </button>
                  {hasRole(['admin']) && (
                    <button 
                      onClick={() => onDeleteLab(lab._id)}
                      className="p-1.5 bg-status-red-bg hover:bg-status-red-bg text-status-red rounded-lg transition-colors"
                      title="Delete Laboratory"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="lg:col-span-3 glass-panel p-12 text-center text-theme-text-muted rounded-2xl">
            <Microscope className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p>No laboratories registered in the system database.</p>
          </div>
        )}
      </div>

      {/* REGISTRATION MODAL */}
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
              {editMode ? 'UPDATE LABORATORY DETAILS' : 'REGISTER NEW LABORATORY'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-theme-text-sec uppercase mb-2">Laboratory Name</label>
                <input 
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Pasteur Laboratory"
                  className="w-full bg-theme-bg border border-slate-750 p-3 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
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
                    placeholder="e.g. France"
                    className="w-full bg-theme-bg border border-slate-750 p-3 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-theme-text-sec uppercase mb-2">City</label>
                  <input 
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Paris"
                    className="w-full bg-theme-bg border border-slate-750 p-3 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-theme-text-sec uppercase mb-2">Pathogen Focus / Specialization</label>
                <input 
                  type="text"
                  required
                  value={primaryFocus}
                  onChange={(e) => setPrimaryFocus(e.target.value)}
                  placeholder="e.g. Coronavirus Research"
                  className="w-full bg-theme-bg border border-slate-750 p-3 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-theme-text-sec uppercase mb-2">Tests Run</label>
                  <input 
                    type="number"
                    min="0"
                    required
                    value={testsConducted}
                    onChange={(e) => setTestsConducted(e.target.value)}
                    className="w-full bg-theme-bg border border-slate-750 p-3 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-theme-text-sec uppercase mb-2">Positive Cases</label>
                  <input 
                    type="number"
                    min="0"
                    required
                    value={positiveResults}
                    onChange={(e) => setPositiveResults(e.target.value)}
                    className="w-full bg-theme-bg border border-slate-750 p-3 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-theme-text-sec uppercase mb-2">Negative Cases</label>
                  <input 
                    type="number"
                    min="0"
                    required
                    value={negativeResults}
                    onChange={(e) => setNegativeResults(e.target.value)}
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
                  {editMode ? 'Save Changes' : 'Register Lab'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Laboratory;
