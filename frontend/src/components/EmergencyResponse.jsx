import React, { useState } from 'react';
import { Radio, Truck, Layers, Wrench, Check, AlertCircle, PlusCircle, Sparkles } from 'lucide-react';

const EmergencyResponse = ({ resources, incidents, onUpdateResource, onUpdateIncident }) => {
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  
  // Allocate amount state
  const [allocateQty, setAllocateQty] = useState(0);

  const handleOpenAllocate = (res) => {
    setSelectedResource(res);
    setAllocateQty(res.allocatedQuantity);
    setShowAllocateModal(true);
  };

  const handleSaveAllocation = (e) => {
    e.preventDefault();
    if (selectedResource) {
      onUpdateResource(selectedResource._id, {
        allocatedQuantity: Number(allocateQty)
      });
      setShowAllocateModal(false);
    }
  };

  const handleResolveIncident = (id) => {
    onUpdateIncident(id, { status: 'Resolved' });
  };

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight font-mono text-gradient-crisis">EMERGENCY RESPONSE</h1>
        <p className="text-theme-text-sec mt-1">Audit emergency reserve distribution and inspect active logistical/medical incident tickets.</p>
      </div>

      {/* STOCKS & stockpiles */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {resources.map((res) => {
          const allocationPct = res.totalQuantity > 0 ? Math.round((res.allocatedQuantity / res.totalQuantity) * 100) : 0;
          return (
            <div key={res._id} className="glass-panel p-6 rounded-2xl border border-theme-border flex flex-col justify-between hover:border-theme-border transition-colors">
              <div>
                <span className="text-xs font-semibold text-theme-text-sec uppercase tracking-widest">{res.region}</span>
                <h3 className="text-xl font-bold mt-1 text-theme-text">{res.item}</h3>
                
                <div className="grid grid-cols-2 gap-2 mt-4 text-xs font-medium">
                  <div>
                    <p className="text-theme-text-muted">Total Stockpile</p>
                    <p className="text-theme-text mt-0.5 font-bold">{res.totalQuantity.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-theme-text-muted">Allocated</p>
                    <p className="text-status-green mt-0.5 font-bold">{res.allocatedQuantity.toLocaleString()}</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-[10px] font-mono text-theme-text-sec mb-1.5">
                    <span>Allocation Level</span>
                    <span>{allocationPct}%</span>
                  </div>
                  <div className="w-full bg-theme-bg h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full transition-all duration-300" style={{ width: `${allocationPct}%` }} />
                  </div>
                </div>
              </div>

              <button 
                onClick={() => handleOpenAllocate(res)}
                className="mt-6 w-full text-center text-xs font-semibold py-2.5 bg-theme-bg hover:bg-theme-card-hover text-status-blue rounded-xl transition-colors"
              >
                Reallocate Reserves
              </button>
            </div>
          );
        })}
      </div>

      {/* INCIDENTS TABLE */}
      <div className="glass-panel rounded-2xl border border-theme-border overflow-hidden">
        <div className="p-6 border-b border-theme-border bg-theme-card/20 flex items-center justify-between">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Radio className="w-5 h-5 text-status-red animate-pulse" />
            Active Emergency Incident Log
          </h2>
        </div>
        
        <div className="divide-y divide-slate-800">
          {incidents.length > 0 ? (
            incidents.map((inc) => (
              <div key={inc._id} className="p-6 hover:bg-theme-bg/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-colors">
                <div className="flex gap-3 items-start">
                  <div className={`p-2 rounded-lg mt-0.5 ${
                    inc.status === 'Resolved' ? 'bg-status-green-bg text-status-green' : 'bg-status-red-bg text-status-red animate-pulse'
                  }`}>
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h3 className="font-bold text-base text-theme-text">{inc.title}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        inc.status === 'Resolved' ? 'bg-status-green-bg text-status-green' : 'bg-status-red-bg text-status-red'
                      }`}>
                        {inc.status}
                      </span>
                    </div>
                    <p className="text-sm text-theme-text-sec mt-1 leading-relaxed">{inc.description}</p>
                    <div className="flex gap-4 mt-3 text-xs text-theme-text-muted font-mono">
                      <span>Region: <strong className="text-theme-text">{inc.region}</strong></span>
                      <span>Reported By: <strong className="text-theme-text">{inc.reportedBy}</strong></span>
                    </div>
                  </div>
                </div>

                {inc.status !== 'Resolved' && (
                  <button 
                    onClick={() => handleResolveIncident(inc._id)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-status-green/10 border border-emerald-500/20 text-status-green hover:bg-status-green hover:text-theme-text rounded-lg text-xs font-semibold transition-all"
                  >
                    <Check className="w-4 h-4" />
                    Resolve Ticket
                  </button>
                )}
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-theme-text-muted">
              No emergency incidents reported.
            </div>
          )}
        </div>
      </div>

      {/* ALLOCATION DIALOG */}
      {showAllocateModal && selectedResource && (
        <div className="fixed inset-0 bg-theme-bg/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-theme-card border border-theme-border w-full max-w-md rounded-2xl shadow-2xl p-6 relative">
            <button 
              onClick={() => setShowAllocateModal(false)}
              className="absolute right-4 top-4 p-1 rounded-lg text-theme-text-sec hover:bg-theme-bg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold font-mono text-theme-text mb-2 uppercase">REALLOCATE RESERVES</h2>
            <p className="text-xs text-theme-text-sec mb-6">{selectedResource.item} stockpiles for region: {selectedResource.region}</p>

            <form onSubmit={handleSaveAllocation} className="space-y-6">
              <div>
                <div className="flex justify-between text-sm font-semibold text-theme-text mb-2">
                  <span>Allocation Level</span>
                  <span>{allocateQty.toLocaleString()} / {selectedResource.totalQuantity.toLocaleString()}</span>
                </div>
                <input 
                  type="range"
                  min="0"
                  max={selectedResource.totalQuantity}
                  value={allocateQty}
                  onChange={(e) => setAllocateQty(Number(e.target.value))}
                  className="w-full h-2 bg-theme-bg rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-theme-border">
                <button 
                  type="button"
                  onClick={() => setShowAllocateModal(false)}
                  className="px-4 py-2.5 rounded-xl text-sm text-theme-text-sec hover:bg-theme-bg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2.5 bg-status-green hover:bg-emerald-500 text-sm font-semibold rounded-xl text-theme-text transition-all active:scale-95"
                >
                  Save Allocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmergencyResponse;
