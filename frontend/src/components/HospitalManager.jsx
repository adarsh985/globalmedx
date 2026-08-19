import React, { useState } from 'react';
import { BedDouble, Plus, X, Phone, Building2, MapPin, Layers, HeartHandshake } from 'lucide-react';
import { hasRole } from '../utils/auth';

const HospitalManager = ({ hospitals, onRegisterHospital, onUpdateHospital, onDeleteHospital }) => {
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

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

      {/* HOSPITAL CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {hospitals.length > 0 ? (
          hospitals.map((hosp) => {
            const occupancyRate = hosp.totalBeds > 0 ? Math.round(((hosp.totalBeds - hosp.availableBeds) / hosp.totalBeds) * 100) : 0;
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
                    <div className="flex justify-between text-xs font-semibold mb-2">
                      <span className="text-theme-text-sec">Bed Occupancy Rate</span>
                      <span className={occupancyRate > 80 ? 'text-status-red' : 'text-theme-text'}>{occupancyRate}%</span>
                    </div>
                    <div className="w-full bg-theme-bg h-2.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          occupancyRate > 90 
                            ? 'bg-rose-500' 
                            : occupancyRate > 75 
                              ? 'bg-orange-500' 
                              : 'bg-emerald-500'
                        }`} 
                        style={{ width: `${occupancyRate}%` }}
                      />
                    </div>
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
