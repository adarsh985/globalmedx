import React, { useState, useMemo } from 'react';
import { 
  Radio, Truck, Layers, Wrench, Check, AlertCircle, PlusCircle, Sparkles, X, 
  ArrowRight, Cpu, Scale
} from 'lucide-react';
import { playSound } from '../utils/sound';

// ---------------------------------------------------------------------------
// SUPPLY CHAIN OPTIMIZER MODEL
// Each backend stockpile record is one (item, region) pair. To balance supply
// across regions we model the other regions' inventory with a fixed reference
// table. The record's own region ("home") always uses the LIVE database values,
// so simulator events (e.g. "Stockpile Depletion") change the optimizer's output.
//   stock  = units on hand            demand = units committed / required
//   need   = demand + 15% safety buffer
//   balance = stock - need   (negative = deficit, positive = surplus donor)
// ---------------------------------------------------------------------------
const SAFETY_BUFFER = 1.15;
const REGIONS = ['Asia-Pacific', 'North America', 'South America', 'Europe'];

const REGIONAL_REFERENCE = {
  'Vaccines': {
    'North America': { stock: 60000, demand: 30000 },
    'South America': { stock: 40000, demand: 52000 },
    'Europe': { stock: 55000, demand: 28000 }
  },
  'Ventilators': {
    'Asia-Pacific': { stock: 900, demand: 1050 },
    'South America': { stock: 500, demand: 380 },
    'Europe': { stock: 800, demand: 520 }
  },
  'PPE Kits': {
    'Asia-Pacific': { stock: 300000, demand: 340000 },
    'North America': { stock: 450000, demand: 260000 },
    'Europe': { stock: 280000, demand: 190000 }
  },
  'ICU Beds': {
    'Asia-Pacific': { stock: 3200, demand: 3700 },
    'North America': { stock: 4500, demand: 2900 },
    'South America': { stock: 1800, demand: 1950 }
  }
};

const ADJUST_KEY = 'gmx_supply_adjust';
const LOG_KEY = 'gmx_supply_log';

const readJSON = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
};

const writeJSON = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    // storage unavailable, state still works for this session
  }
};

const EmergencyResponse = ({ resources, incidents, onUpdateResource, onUpdateIncident }) => {
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  
  // Allocate amount state
  const [allocateQty, setAllocateQty] = useState(0);

  // Supply chain optimizer state
  const [adjustments, setAdjustments] = useState(() => readJSON(ADJUST_KEY, {}));
  const [transferLog, setTransferLog] = useState(() => readJSON(LOG_KEY, []));
  const [executing, setExecuting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [lastResult, setLastResult] = useState(null);

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

  // Build the item x region inventory matrix
  const matrix = useMemo(() => {
    const grouped = {};
    resources.forEach((res) => {
      (grouped[res.item] = grouped[res.item] || []).push(res);
    });

    const result = {};
    Object.entries(grouped).forEach(([item, list]) => {
      const rows = list.map((res) => ({
        region: res.region,
        stock: res.totalQuantity,
        demand: res.allocatedQuantity,
        home: true,
        resId: res._id
      }));

      Object.entries(REGIONAL_REFERENCE[item] || {}).forEach(([region, v]) => {
        if (rows.some((r) => r.region === region)) return;
        const adj = adjustments[`${item}|${region}`] || 0;
        rows.push({ region, stock: v.stock + adj, demand: v.demand, home: false, resId: null });
      });

      rows.forEach((r) => {
        r.need = Math.round(r.demand * SAFETY_BUFFER);
        r.balance = r.stock - r.need;
      });
      result[item] = rows;
    });
    return result;
  }, [resources, adjustments]);

  // Greedy rebalancing: biggest deficit first, filled from the biggest surplus first
  const plan = useMemo(() => {
    const transfers = [];
    const unmet = [];

    Object.entries(matrix).forEach(([item, rows]) => {
      const deficits = rows
        .filter((r) => r.balance < 0)
        .map((r) => ({ ...r, remaining: -r.balance }))
        .sort((a, b) => b.remaining - a.remaining);
      const donors = rows
        .filter((r) => r.balance > 0)
        .map((r) => ({ ...r, available: r.balance }))
        .sort((a, b) => b.available - a.available);

      deficits.forEach((d) => {
        donors.forEach((s) => {
          if (d.remaining <= 0 || s.available <= 0) return;
          const qty = Math.min(d.remaining, s.available);
          transfers.push({
            item,
            from: s.region,
            to: d.region,
            qty,
            fromHome: s.home,
            fromResId: s.resId,
            toHome: d.home,
            toResId: d.resId
          });
          d.remaining -= qty;
          s.available -= qty;
        });
        if (d.remaining > 0) unmet.push({ item, region: d.region, qty: d.remaining });
      });
    });

    return { transfers, unmet };
  }, [matrix]);

  const executeBalancing = async () => {
    if (executing || plan.transfers.length === 0) return;

    const transfers = plan.transfers;
    setExecuting(true);
    setProgress(0);
    setLastResult(null);
    playSound('warn');

    // Cargo flight animation
    const duration = 2800;
    const startedAt = Date.now();
    const timer = setInterval(() => {
      setProgress(Math.min(100, ((Date.now() - startedAt) / duration) * 100));
    }, 50);

    try {
      await new Promise((resolve) => setTimeout(resolve, duration));

      // Net the movements: home-region stock lives in the database, others in local reference state
      const homeDelta = {};
      const nextAdjustments = { ...adjustments };

      transfers.forEach((t) => {
        if (t.fromHome) {
          homeDelta[t.fromResId] = (homeDelta[t.fromResId] || 0) - t.qty;
        } else {
          const key = `${t.item}|${t.from}`;
          nextAdjustments[key] = (nextAdjustments[key] || 0) - t.qty;
        }
        if (t.toHome) {
          homeDelta[t.toResId] = (homeDelta[t.toResId] || 0) + t.qty;
        } else {
          const key = `${t.item}|${t.to}`;
          nextAdjustments[key] = (nextAdjustments[key] || 0) + t.qty;
        }
      });

      setAdjustments(nextAdjustments);
      writeJSON(ADJUST_KEY, nextAdjustments);

      for (const [resId, delta] of Object.entries(homeDelta)) {
        const res = resources.find((r) => r._id === resId);
        if (res) {
          await onUpdateResource(resId, { totalQuantity: res.totalQuantity + delta });
        }
      }

      const time = new Date().toLocaleTimeString();
      const entries = transfers.map((t, i) => ({
        id: `${Date.now()}-${i}`,
        time,
        text: `${t.qty.toLocaleString()} ${t.item}: ${t.from} → ${t.to}`
      }));
      const nextLog = [...entries, ...transferLog].slice(0, 8);
      setTransferLog(nextLog);
      writeJSON(LOG_KEY, nextLog);

      setLastResult({
        count: transfers.length,
        units: transfers.reduce((sum, t) => sum + t.qty, 0)
      });
      playSound('success');
    } finally {
      clearInterval(timer);
      setProgress(100);
      setExecuting(false);
    }
  };

  const itemNames = Object.keys(matrix);

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
                    <p className="text-theme-text-sec">Total Stockpile</p>
                    <p className="text-theme-text mt-0.5 font-bold">{res.totalQuantity.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-theme-text-sec">Allocated</p>
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

      {/* SMART SUPPLY CHAIN OPTIMIZER */}
      <div className="glass-panel rounded-2xl border border-theme-border overflow-hidden font-mono">
        <div className="p-6 border-b border-theme-border bg-theme-card flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2 text-theme-text">
              <Cpu className="w-5 h-5 text-status-blue" />
              SMART SUPPLY CHAIN OPTIMIZER
            </h2>
            <p className="text-xs text-theme-text-sec mt-1">
              Scans regional inventory against demand (+15% safety buffer), detects deficits, and routes surplus stock to the regions that need it.
            </p>
          </div>
          <button
            onClick={executeBalancing}
            disabled={executing || plan.transfers.length === 0}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-status-blue hover:bg-sky-500 font-bold text-white text-xs shadow-md transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
          >
            <Scale className="w-4 h-4" />
            {executing ? 'Dispatching Cargo...' : 'Execute Auto-Balancing'}
          </button>
        </div>

        {/* CARGO FLIGHT ANIMATION */}
        {executing && (
          <div className="px-6 py-4 border-b border-theme-border bg-theme-bg">
            <div className="flex justify-between text-[10px] text-theme-text-sec mb-2 uppercase tracking-wider">
              <span>Emergency airlift in progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="relative h-6">
              <div className="absolute top-1/2 inset-x-0 h-0.5 -translate-y-1/2 border-t-2 border-dashed border-theme-border" />
              <div
                className="absolute top-0 text-xl transition-all duration-100 ease-linear"
                style={{ left: `calc(${progress}% - ${progress * 0.24}px)` }}
              >
                ✈️
              </div>
            </div>
          </div>
        )}

        {lastResult && !executing && (
          <div className="mx-6 mt-6 p-3 rounded-xl border bg-status-green-bg border-status-green-border text-status-green text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4" />
            Auto-balancing complete: {lastResult.count} transfer{lastResult.count === 1 ? '' : 's'} executed, {lastResult.units.toLocaleString()} units redistributed.
          </div>
        )}

        {/* REGIONAL BALANCE MATRIX */}
        <div className="p-6">
          <h3 className="text-[10px] font-bold text-theme-text-sec uppercase tracking-widest mb-3">
            Regional Balance Matrix (stock minus buffered demand)
          </h3>
          <div className="overflow-x-auto rounded-xl border border-theme-border">
            <table className="w-full text-xs text-left">
              <thead className="bg-theme-bg text-theme-text-sec uppercase text-[10px] tracking-wider border-b border-theme-border">
                <tr>
                  <th className="p-3">Resource</th>
                  {REGIONS.map((region) => (
                    <th key={region} className="p-3 text-right">{region}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-theme-border bg-theme-bg/40">
                {itemNames.map((item) => (
                  <tr key={item}>
                    <td className="p-3 font-bold text-theme-text">{item}</td>
                    {REGIONS.map((region) => {
                      const cell = matrix[item].find((r) => r.region === region);
                      if (!cell) {
                        return <td key={region} className="p-3 text-right text-theme-text-sec">n/a</td>;
                      }
                      const deficit = cell.balance < 0;
                      return (
                        <td
                          key={region}
                          className={`p-3 text-right font-bold ${deficit ? 'text-status-red' : 'text-status-green'}`}
                          title={`Stock ${cell.stock.toLocaleString()} / Need ${cell.need.toLocaleString()}${cell.home ? ' (live database record)' : ' (regional reference model)'}`}
                        >
                          {deficit ? '−' : '+'}{Math.abs(cell.balance).toLocaleString()}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* RECOMMENDATIONS */}
          <h3 className="text-[10px] font-bold text-theme-text-sec uppercase tracking-widest mt-6 mb-3">
            Optimizer Recommendations
          </h3>
          {plan.transfers.length > 0 ? (
            <div className="space-y-2">
              {plan.transfers.map((t, idx) => (
                <div key={idx} className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-theme-bg border border-theme-border text-xs">
                  <Truck className="w-4 h-4 text-status-orange flex-shrink-0" />
                  <span className="font-bold text-theme-text">Transfer {t.qty.toLocaleString()} {t.item}</span>
                  <span className="text-status-green font-bold">{t.from}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-theme-text-sec" />
                  <span className="text-status-red font-bold">{t.to}</span>
                </div>
              ))}
            </div>
          ) : plan.unmet.length === 0 ? (
            <div className="p-4 rounded-xl bg-status-green-bg border border-status-green-border text-status-green text-xs font-bold">
              All regions are balanced. No transfers required.
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-theme-bg border border-theme-border text-theme-text-sec text-xs font-bold">
              No surplus stock remains to route. See the shortfall below.
            </div>
          )}

          {plan.unmet.length > 0 && (
            <div className="mt-3 p-3 rounded-xl bg-status-orange-bg border border-status-orange-border text-status-orange text-xs">
              <span className="font-bold">Unresolvable shortfall (global surplus exhausted): </span>
              {plan.unmet.map((u) => `${u.qty.toLocaleString()} ${u.item} in ${u.region}`).join('; ')}. Request external aid.
            </div>
          )}

          {/* TRANSFER LOG */}
          {transferLog.length > 0 && (
            <div className="mt-6">
              <h3 className="text-[10px] font-bold text-theme-text-sec uppercase tracking-widest mb-3">
                Executed Transfer Log
              </h3>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-1.5 max-h-40 overflow-y-auto">
                {transferLog.map((entry) => (
                  <div key={entry.id} className="text-emerald-400">
                    <span className="text-slate-500">[{entry.time}]</span> {entry.text}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* INCIDENTS TABLE */}
      <div className="glass-panel rounded-2xl border border-theme-border overflow-hidden">
        <div className="p-6 border-b border-theme-border bg-theme-card flex items-center justify-between">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Radio className="w-5 h-5 text-status-red animate-pulse" />
            Active Emergency Incident Log
          </h2>
        </div>
        
        <div className="divide-y divide-theme-border">
          {incidents.length > 0 ? (
            incidents.map((inc) => (
              <div key={inc._id} className="p-6 hover:bg-theme-card-hover flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-colors">
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
                    <div className="flex gap-4 mt-3 text-xs text-theme-text-sec font-mono">
                      <span>Region: <strong className="text-theme-text">{inc.region}</strong></span>
                      <span>Reported By: <strong className="text-theme-text">{inc.reportedBy}</strong></span>
                    </div>
                  </div>
                </div>

                {inc.status !== 'Resolved' && (
                  <button 
                    onClick={() => handleResolveIncident(inc._id)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-status-green-bg border border-status-green-border text-status-green hover:bg-status-green hover:text-theme-text rounded-lg text-xs font-semibold transition-all"
                  >
                    <Check className="w-4 h-4" />
                    Resolve Ticket
                  </button>
                )}
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-theme-text-sec">
              No emergency incidents reported.
            </div>
          )}
        </div>
      </div>

      {/* ALLOCATION DIALOG */}
      {showAllocateModal && selectedResource && (
        <div className="fixed inset-0 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
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
