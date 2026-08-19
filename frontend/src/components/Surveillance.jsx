import React, { useState } from 'react';
import { 
  Search, Plus, Filter, Trash2, Edit3, X, Calendar, 
  Map, Activity, Heart, ShieldAlert 
} from 'lucide-react';
import { hasRole } from '../utils/auth';

const Surveillance = ({ reports, onAddReport, onUpdateReport, onDeleteReport }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCountry, setFilterCountry] = useState('');
  const [filterDisease, setFilterDisease] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  // Form State
  const [country, setCountry] = useState('');
  const [disease, setDisease] = useState('');
  const [cases, setCases] = useState(0);
  const [deaths, setDeaths] = useState(0);
  const [recoveries, setRecoveries] = useState(0);
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);

  const countriesList = [...new Set(reports.map(r => r.country))];
  const diseasesList = [...new Set(reports.map(r => r.disease))];

  const filteredReports = reports.filter((report) => {
    const matchesSearch = 
      report.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.disease.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCountry = filterCountry ? report.country === filterCountry : true;
    const matchesDisease = filterDisease ? report.disease === filterDisease : true;
    return matchesSearch && matchesCountry && matchesDisease;
  });

  const openAddModal = () => {
    setEditMode(false);
    setCountry('');
    setDisease('');
    setCases(0);
    setDeaths(0);
    setRecoveries(0);
    setReportDate(new Date().toISOString().split('T')[0]);
    setShowModal(true);
  };

  const openEditModal = (report) => {
    setEditMode(true);
    setSelectedId(report._id);
    setCountry(report.country);
    setDisease(report.disease);
    setCases(report.cases);
    setDeaths(report.deaths);
    setRecoveries(report.recoveries);
    setReportDate(new Date(report.reportDate).toISOString().split('T')[0]);
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { country, disease, cases: Number(cases), deaths: Number(deaths), recoveries: Number(recoveries), reportDate };
    
    if (editMode) {
      onUpdateReport(selectedId, data);
    } else {
      onAddReport(data);
    }
    setShowModal(false);
  };

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight font-mono text-gradient-crisis">DISEASE SURVEILLANCE</h1>
          <p className="text-theme-text-sec mt-1">Track case records, insert verified clinical cases, and review global reports.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-status-green hover:bg-emerald-500 font-semibold text-theme-text transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Create Case Report
        </button>
      </div>

      {/* FILTER PANEL */}
      <div className="glass-panel p-6 rounded-2xl border border-theme-border grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-theme-text-sec" />
          <input 
            type="text"
            placeholder="Search country or pathogen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-theme-bg border border-theme-border pl-10 pr-4 py-3 rounded-xl text-sm text-theme-text placeholder-theme-text-sec focus:outline-none focus:border-theme-accent text-theme-text"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4.5 h-4.5 text-theme-text-sec" />
          <select 
            value={filterCountry} 
            onChange={(e) => setFilterCountry(e.target.value)}
            className="w-full bg-theme-bg border border-theme-border px-4 py-3 rounded-xl text-sm text-theme-text focus:outline-none focus:border-theme-accent text-theme-text"
          >
            <option value="">All Countries</option>
            {countriesList.map((c, i) => <option key={i} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Activity className="w-4.5 h-4.5 text-theme-text-sec" />
          <select 
            value={filterDisease} 
            onChange={(e) => setFilterDisease(e.target.value)}
            className="w-full bg-theme-bg border border-theme-border px-4 py-3 rounded-xl text-sm text-theme-text focus:outline-none focus:border-theme-accent text-theme-text"
          >
            <option value="">All Pathogens</option>
            {diseasesList.map((d, i) => <option key={i} value={d}>{d}</option>)}
          </select>
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="glass-panel rounded-2xl border border-theme-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-theme-border text-theme-text-sec text-xs uppercase font-semibold bg-slate-100/40 dark:bg-slate-800/40">
                <th className="p-4 pl-6">Region / Country</th>
                <th className="p-4">Pathogen</th>
                <th className="p-4 text-right">Cases</th>
                <th className="p-4 text-right">Recoveries</th>
                <th className="p-4 text-right">Deaths</th>
                <th className="p-4">Report Date</th>
                <th className="p-4 pr-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-border text-sm">
              {filteredReports.length > 0 ? (
                filteredReports.map((report) => (
                  <tr key={report._id} className="hover:bg-theme-card-hover">
                    <td className="p-4 pl-6 font-semibold text-theme-text flex items-center gap-2">
                      <Map className="w-4 h-4 text-theme-text-sec" />
                      {report.country}
                    </td>
                    <td className="p-4 font-mono text-theme-text">{report.disease}</td>
                    <td className="p-4 text-right text-status-blue font-semibold">{report.cases.toLocaleString()}</td>
                    <td className="p-4 text-right text-status-green font-semibold">{report.recoveries.toLocaleString()}</td>
                    <td className="p-4 text-right text-status-red font-semibold">{report.deaths.toLocaleString()}</td>
                    <td className="p-4 text-theme-text-sec font-mono text-xs">
                      {new Date(report.reportDate).toLocaleDateString()}
                    </td>
                    <td className="p-4 pr-6 text-center">
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={() => openEditModal(report)}
                          className="p-1.5 rounded-lg bg-theme-bg hover:bg-theme-card-hover text-status-blue transition-colors"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        {hasRole(['admin']) && (
                          <button 
                            onClick={() => onDeleteReport(report._id)}
                            className="p-1.5 rounded-lg bg-theme-bg hover:bg-status-red-bg text-status-red transition-colors"
                            title="Delete"
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
                  <td colSpan="7" className="p-8 text-center text-theme-text-sec">
                    No surveillance reports found matching filter query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FORM DIALOG MODAL */}
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
              {editMode ? 'EDIT SURVEILLANCE REPORT' : 'NEW SURVEILLANCE REPORT'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-theme-text-sec uppercase mb-2">Country Name</label>
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
                <label className="block text-xs font-semibold text-theme-text-sec uppercase mb-2">Disease / Pathogen</label>
                <input 
                  type="text"
                  required
                  value={disease}
                  onChange={(e) => setDisease(e.target.value)}
                  placeholder="e.g. COVID-19"
                  className="w-full bg-theme-bg border border-theme-border p-3 rounded-xl text-sm focus:outline-none focus:border-theme-accent text-theme-text"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-theme-text-sec uppercase mb-2">Cases</label>
                  <input 
                    type="number"
                    min="0"
                    required
                    value={cases}
                    onChange={(e) => setCases(e.target.value)}
                    className="w-full bg-theme-bg border border-theme-border p-3 rounded-xl text-sm focus:outline-none focus:border-theme-accent text-theme-text"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-theme-text-sec uppercase mb-2">Recoveries</label>
                  <input 
                    type="number"
                    min="0"
                    required
                    value={recoveries}
                    onChange={(e) => setRecoveries(e.target.value)}
                    className="w-full bg-theme-bg border border-theme-border p-3 rounded-xl text-sm focus:outline-none focus:border-theme-accent text-theme-text"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-theme-text-sec uppercase mb-2">Deaths</label>
                  <input 
                    type="number"
                    min="0"
                    required
                    value={deaths}
                    onChange={(e) => setDeaths(e.target.value)}
                    className="w-full bg-theme-bg border border-theme-border p-3 rounded-xl text-sm focus:outline-none focus:border-theme-accent text-theme-text"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-theme-text-sec uppercase mb-2">Date Reported</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 w-4.5 h-4.5 text-theme-text-sec" />
                  <input 
                    type="date"
                    required
                    value={reportDate}
                    onChange={(e) => setReportDate(e.target.value)}
                    className="w-full bg-theme-bg border border-theme-border pl-10 pr-4 p-3 rounded-xl text-sm focus:outline-none focus:border-theme-accent text-theme-text"
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
                  {editMode ? 'Save Changes' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Surveillance;
