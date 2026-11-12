import React, { useState, useEffect, useRef } from 'react';
import { Microscope, Plus, X, Tag, FileText, CheckCircle, AlertTriangle, Trash2, Dna, Play, ShieldCheck, ShieldAlert } from 'lucide-react';
import { hasRole } from '../utils/auth';
import { playSound } from '../utils/sound';

// WHO guidance: test positivity above 5% suggests transmission is not adequately controlled
const WHO_POSITIVITY_LIMIT = 5;

// ---------------------------------------------------------------------------
// GENOMICS REFERENCE DATA
// Lineage names and mutation notations are real nomenclature; the sequencing
// pipeline itself is SIMULATED for demonstration (no real specimen is read).
// risk = contribution to immune-escape / resistance score (1 low .. 3 high)
// ---------------------------------------------------------------------------
const GENOMICS = {
  'COVID-19': {
    organism: 'SARS-CoV-2',
    lineages: ['JN.1', 'XBB.1.5', 'BA.2.86'],
    mutations: [
      { name: 'S:N501Y', note: 'Increased ACE2 binding', risk: 2 },
      { name: 'S:E484K', note: 'Antibody neutralisation escape', risk: 3 },
      { name: 'S:F486P', note: 'Immune evasion', risk: 2 },
      { name: 'S:L455S', note: 'Immune evasion', risk: 2 },
      { name: 'ORF1a:P3395H', note: 'Replication fitness change', risk: 1 }
    ]
  },
  'Influenza': {
    organism: 'Influenza A (H5N1)',
    lineages: ['Clade 2.3.4.4b', 'Clade 2.3.2.1e'],
    mutations: [
      { name: 'PB2:E627K', note: 'Mammalian host adaptation', risk: 3 },
      { name: 'HA:Q226L', note: 'Human-type receptor binding', risk: 3 },
      { name: 'NA:H275Y', note: 'Oseltamivir resistance', risk: 3 },
      { name: 'PB2:D701N', note: 'Mammalian host adaptation', risk: 2 }
    ]
  },
  'Ebola': {
    organism: 'Zaire ebolavirus',
    lineages: ['Makona', 'Kikwit-like', 'Mayinga-like'],
    mutations: [
      { name: 'GP:A82V', note: 'Enhanced cell entry', risk: 3 },
      { name: 'NP:R111C', note: 'Nucleoprotein change', risk: 1 },
      { name: 'VP24:T50I', note: 'Interferon antagonism change', risk: 2 }
    ]
  },
  'Dengue Fever': {
    organism: 'Dengue virus',
    lineages: ['DENV-2 Cosmopolitan', 'DENV-1 Genotype V', 'DENV-3 Genotype III'],
    mutations: [
      { name: 'E:domain-III substitution', note: 'Antigenic drift', risk: 2 },
      { name: 'NS1:substitution', note: 'Vector competence change', risk: 1 },
      { name: 'NS5:substitution', note: 'Replication fitness change', risk: 1 }
    ]
  },
  'Tuberculosis': {
    organism: 'Mycobacterium tuberculosis',
    lineages: ['Lineage 4 (Euro-American)', 'Lineage 2 (East Asian)', 'Lineage 1 (Indo-Oceanic)'],
    mutations: [
      { name: 'katG:S315T', note: 'Isoniazid resistance', risk: 3 },
      { name: 'rpoB:S450L', note: 'Rifampicin resistance', risk: 3 },
      { name: 'embB:M306V', note: 'Ethambutol resistance', risk: 2 }
    ]
  },
  'Lassa Fever': {
    organism: 'Lassa mammarenavirus',
    lineages: ['Lineage II (Nigeria)', 'Lineage III (Nigeria)', 'Lineage IV (Sierra Leone)'],
    mutations: [
      { name: 'GPC:substitution', note: 'Glycoprotein change', risk: 2 },
      { name: 'NP:substitution', note: 'Nucleoprotein change', risk: 1 }
    ]
  }
};

const WATCHLIST = [
  { pathogen: 'COVID-19', lineage: 'JN.1', classification: 'Variant of Interest', vaccineMatch: 88, trend: 'Rising' },
  { pathogen: 'Influenza', lineage: 'H5N1 Clade 2.3.4.4b', classification: 'Under Monitoring', vaccineMatch: 72, trend: 'Rising' },
  { pathogen: 'Ebola', lineage: 'Zaire (Makona)', classification: 'Under Monitoring', vaccineMatch: 94, trend: 'Stable' },
  { pathogen: 'Tuberculosis', lineage: 'Lineage 4 (MDR markers)', classification: 'Variant of Concern', vaccineMatch: 61, trend: 'Stable' },
  { pathogen: 'Dengue Fever', lineage: 'DENV-2 Cosmopolitan', classification: 'Under Monitoring', vaccineMatch: 80, trend: 'Falling' }
];

const SEQ_STEPS = [
  'Nucleic acid extraction',
  'Library preparation',
  'Sequencing run',
  'Read alignment & quality control',
  'Lineage assignment & mutation calling'
];

const SEQ_LOG_KEY = 'gmx_sequencing_log';

const pickRandom = (list) => list[Math.floor(Math.random() * list.length)];

const readSeqLog = () => {
  try {
    const raw = localStorage.getItem(SEQ_LOG_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

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

  // --- GENOMIC SEQUENCING STATE ---
  const [seqLabId, setSeqLabId] = useState('');
  const [seqPathogen, setSeqPathogen] = useState('COVID-19');
  const [sequencing, setSequencing] = useState(false);
  const [seqProgress, setSeqProgress] = useState(0);
  const [seqLog, setSeqLog] = useState(readSeqLog);
  const [seqResult, setSeqResult] = useState(null);
  const seqTimer = useRef(null);

  // Never leave a running interval behind when the user navigates away
  useEffect(() => () => clearInterval(seqTimer.current), []);

  const activeLabId = seqLabId || (labs[0] && labs[0]._id) || '';
  const seqStepIndex = Math.min(SEQ_STEPS.length - 1, Math.floor(seqProgress / (100 / SEQ_STEPS.length)));

  const buildSequencingResult = (lab, pathogen) => {
    const profile = GENOMICS[pathogen];
    const lineage = pickRandom(profile.lineages);
    const shuffled = [...profile.mutations].sort(() => Math.random() - 0.5);
    const found = shuffled.slice(0, 1 + Math.floor(Math.random() * Math.min(3, shuffled.length)));
    const novel = Math.random() < 0.25;

    const riskScore = found.reduce((sum, m) => sum + m.risk, 0) + (novel ? 2 : 0);
    const escapeRisk = riskScore <= 2 ? 'Low' : riskScore <= 5 ? 'Moderate' : 'High';
    const vaccineMatch = Math.max(40, Math.min(99, 98 - riskScore * 6));

    return {
      id: `seq-${Date.now()}`,
      time: new Date().toLocaleTimeString(),
      lab: lab.name,
      pathogen,
      organism: profile.organism,
      lineage: novel ? `${lineage}.1 (novel sub-lineage candidate)` : lineage,
      novel,
      mutations: found,
      escapeRisk,
      vaccineMatch
    };
  };

  const runSequencing = () => {
    const lab = labs.find((l) => l._id === activeLabId);
    if (sequencing || !lab) return;

    setSequencing(true);
    setSeqProgress(0);
    setSeqResult(null);

    let progress = 0;
    seqTimer.current = setInterval(() => {
      progress += 2;
      setSeqProgress(progress);

      if (progress >= 100) {
        clearInterval(seqTimer.current);

        const result = buildSequencingResult(lab, seqPathogen);
        const nextLog = [result, ...seqLog].slice(0, 8);
        setSeqResult(result);
        setSeqLog(nextLog);
        try {
          localStorage.setItem(SEQ_LOG_KEY, JSON.stringify(nextLog));
        } catch (e) {
          // storage unavailable, log still shown for this session
        }
        setSequencing(false);
        playSound(result.escapeRisk === 'High' ? 'warn' : 'success');

        // A sequenced specimen is a confirmed positive: record it against the lab's counters
        onUpdateLab(lab._id, {
          name: lab.name,
          country: lab.country,
          city: lab.city,
          testsConducted: lab.testsConducted + 1,
          positiveResults: lab.positiveResults + 1,
          negativeResults: lab.negativeResults,
          primaryFocus: lab.primaryFocus
        });
      }
    }, 100);
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
                  <div className="mt-6 p-4 rounded-xl bg-slate-100/40 dark:bg-slate-800/40 border border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-status-green" />
                      <span className="text-theme-text-sec font-semibold">Positivity Index:</span>
                    </div>
                    <span className={`font-mono font-bold ${positivityRate > 10 ? 'text-status-red animate-pulse' : 'text-status-green'}`}>
                      {positivityRate}%
                    </span>
                  </div>

                  {/* WHO 5% POSITIVITY THRESHOLD */}
                  {Number(positivityRate) > WHO_POSITIVITY_LIMIT ? (
                    <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-status-red-bg border border-status-red-border text-status-red text-[11px] font-bold">
                      <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                      WHO ALERT: above the {WHO_POSITIVITY_LIMIT}% positivity threshold
                    </div>
                  ) : (
                    <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-status-green-bg border border-status-green-border text-status-green text-[11px] font-bold">
                      <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                      Within WHO {WHO_POSITIVITY_LIMIT}% positivity threshold
                    </div>
                  )}
                </div>

                <div className="flex gap-2 justify-end mt-6 pt-4 border-t border-theme-border">
                  <button 
                    onClick={() => openEditModal(lab)}
                    className="text-xs px-3 py-1.5 bg-theme-bg hover:bg-theme-card-hover rounded-lg text-status-blue font-semibold transition-colors"
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
          <div className="lg:col-span-3 glass-panel p-12 text-center text-theme-text-sec rounded-2xl">
            <Microscope className="w-12 h-12 text-theme-text-sec mx-auto mb-3" />
            <p>No laboratories registered in the system database.</p>
          </div>
        )}
      </div>

      {/* GENOMIC VARIANT SEQUENCING & MUTATION TRACKER */}
      <div className="glass-panel rounded-2xl border border-theme-border overflow-hidden font-mono">
        <div className="p-6 border-b border-theme-border bg-theme-card">
          <h2 className="text-lg font-bold flex items-center gap-2 text-theme-text">
            <Dna className="w-5 h-5 text-status-blue" />
            GENOMIC VARIANT SEQUENCING & MUTATION TRACKER
          </h2>
          <p className="text-xs text-theme-text-sec mt-1">
            Sequence a specimen to assign its lineage, call mutations, and estimate immune-escape risk. The pipeline is simulated for demonstration.
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* SEQUENCER CONTROLS */}
          {labs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end text-xs">
              <div>
                <label className="block text-[10px] font-bold text-theme-text-sec uppercase mb-2">Sequencing Laboratory</label>
                <select
                  value={activeLabId}
                  onChange={(e) => setSeqLabId(e.target.value)}
                  disabled={sequencing}
                  className="w-full bg-theme-bg border border-theme-border p-3 rounded-xl text-xs text-theme-text focus:outline-none focus:border-theme-accent disabled:opacity-50"
                >
                  {labs.map((lab) => (
                    <option key={lab._id} value={lab._id}>{lab.name} ({lab.city})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-theme-text-sec uppercase mb-2">Specimen Pathogen</label>
                <select
                  value={seqPathogen}
                  onChange={(e) => setSeqPathogen(e.target.value)}
                  disabled={sequencing}
                  className="w-full bg-theme-bg border border-theme-border p-3 rounded-xl text-xs text-theme-text focus:outline-none focus:border-theme-accent disabled:opacity-50"
                >
                  {Object.keys(GENOMICS).map((p) => (
                    <option key={p} value={p}>{p} ({GENOMICS[p].organism})</option>
                  ))}
                </select>
              </div>
              <button
                onClick={runSequencing}
                disabled={sequencing}
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-status-blue hover:bg-sky-500 text-white font-bold text-xs transition-all active:scale-95 disabled:opacity-50"
              >
                <Play className="w-4 h-4 fill-current" />
                {sequencing ? 'Sequencing...' : 'Sequence Specimen'}
              </button>
            </div>
          ) : (
            <p className="text-xs text-theme-text-sec">Register a laboratory to enable specimen sequencing.</p>
          )}

          {/* PROGRESS */}
          {sequencing && (
            <div className="p-4 rounded-xl bg-theme-bg border border-theme-border">
              <div className="flex justify-between text-[10px] text-theme-text-sec uppercase tracking-wider mb-2">
                <span>{SEQ_STEPS[seqStepIndex]}</span>
                <span>{Math.min(100, seqProgress)}%</span>
              </div>
              <div className="w-full bg-theme-card h-2 rounded-full overflow-hidden">
                <div className="h-full bg-status-blue transition-all duration-100" style={{ width: `${Math.min(100, seqProgress)}%` }} />
              </div>
              <div className="flex justify-between mt-3 text-[9px] text-theme-text-sec">
                {SEQ_STEPS.map((step, i) => (
                  <span key={step} className={i <= seqStepIndex ? 'text-status-blue font-bold' : ''}>{i + 1}</span>
                ))}
              </div>
            </div>
          )}

          {/* LATEST RESULT */}
          {seqResult && !sequencing && (
            <div className={`p-5 rounded-xl border text-xs ${
              seqResult.escapeRisk === 'High'
                ? 'bg-status-red-bg border-status-red-border'
                : seqResult.escapeRisk === 'Moderate'
                ? 'bg-status-orange-bg border-status-orange-border'
                : 'bg-status-green-bg border-status-green-border'
            }`}>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <span className="font-bold text-theme-text text-sm">Sequencing complete: {seqResult.organism}</span>
                <span className="text-theme-text-sec">Recorded as +1 confirmed positive at {seqResult.lab}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-theme-bg p-3 rounded-lg border border-theme-border">
                  <span className="text-[10px] text-theme-text-sec uppercase block">Assigned Lineage</span>
                  <span className="font-bold text-theme-text mt-1 block">{seqResult.lineage}</span>
                </div>
                <div className="bg-theme-bg p-3 rounded-lg border border-theme-border">
                  <span className="text-[10px] text-theme-text-sec uppercase block">Immune Escape / Resistance Risk</span>
                  <span className={`font-bold mt-1 block ${
                    seqResult.escapeRisk === 'High' ? 'text-status-red' : seqResult.escapeRisk === 'Moderate' ? 'text-status-orange' : 'text-status-green'
                  }`}>{seqResult.escapeRisk}</span>
                </div>
                <div className="bg-theme-bg p-3 rounded-lg border border-theme-border">
                  <span className="text-[10px] text-theme-text-sec uppercase block">Estimated Vaccine Match</span>
                  <span className="font-bold text-theme-text mt-1 block">{seqResult.vaccineMatch}%</span>
                </div>
              </div>
              <div className="mt-3">
                <span className="text-[10px] text-theme-text-sec uppercase block mb-1.5">Mutations Called</span>
                <div className="flex flex-wrap gap-2">
                  {seqResult.mutations.map((m) => (
                    <span key={m.name} className="px-2.5 py-1 rounded-lg bg-theme-bg border border-theme-border text-theme-text" title={m.note}>
                      <strong>{m.name}</strong> <span className="text-theme-text-sec">{m.note}</span>
                    </span>
                  ))}
                </div>
              </div>
              {seqResult.novel && (
                <p className="mt-3 text-status-orange font-bold">Novel sub-lineage candidate flagged. Submit to the WHO genomic surveillance network for confirmation.</p>
              )}
            </div>
          )}

          {/* WATCHLIST */}
          <div>
            <h3 className="text-[10px] font-bold text-theme-text-sec uppercase tracking-widest mb-3">
              Variant Watchlist (illustrative reference)
            </h3>
            <div className="overflow-x-auto rounded-xl border border-theme-border">
              <table className="w-full text-xs text-left">
                <thead className="bg-theme-bg text-theme-text-sec uppercase text-[10px] tracking-wider border-b border-theme-border">
                  <tr>
                    <th className="p-3">Pathogen</th>
                    <th className="p-3">Circulating Lineage</th>
                    <th className="p-3">Classification</th>
                    <th className="p-3 text-right">Vaccine Match</th>
                    <th className="p-3 text-center">Trend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-theme-border bg-theme-bg/40">
                  {WATCHLIST.map((row) => (
                    <tr key={row.pathogen} className="hover:bg-theme-card-hover">
                      <td className="p-3 font-bold text-theme-text">{row.pathogen}</td>
                      <td className="p-3 text-theme-text">{row.lineage}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          row.classification === 'Variant of Concern'
                            ? 'bg-status-red-bg text-status-red'
                            : row.classification === 'Variant of Interest'
                            ? 'bg-status-orange-bg text-status-orange'
                            : 'bg-status-blue-bg text-status-blue'
                        }`}>
                          {row.classification}
                        </span>
                      </td>
                      <td className={`p-3 text-right font-bold ${row.vaccineMatch < 70 ? 'text-status-red' : row.vaccineMatch < 85 ? 'text-status-orange' : 'text-status-green'}`}>
                        {row.vaccineMatch}%
                      </td>
                      <td className="p-3 text-center text-theme-text-sec">{row.trend}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SEQUENCING HISTORY */}
          {seqLog.length > 0 && (
            <div>
              <h3 className="text-[10px] font-bold text-theme-text-sec uppercase tracking-widest mb-3">
                Sequencing Run History
              </h3>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-1.5 max-h-40 overflow-y-auto">
                {seqLog.map((run) => (
                  <div key={run.id} className="text-emerald-400">
                    <span className="text-slate-500">[{run.time}]</span> {run.lab}: {run.pathogen} {run.lineage}, {run.mutations.length} mutation{run.mutations.length === 1 ? '' : 's'}, risk {run.escapeRisk}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
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
                    placeholder="e.g. France"
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
                    placeholder="e.g. Paris"
                    className="w-full bg-theme-bg border border-theme-border p-3 rounded-xl text-sm focus:outline-none focus:border-theme-accent text-theme-text"
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
                  className="w-full bg-theme-bg border border-theme-border p-3 rounded-xl text-sm focus:outline-none focus:border-theme-accent text-theme-text"
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
                    className="w-full bg-theme-bg border border-theme-border p-3 rounded-xl text-sm focus:outline-none focus:border-theme-accent text-theme-text"
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
                    className="w-full bg-theme-bg border border-theme-border p-3 rounded-xl text-sm focus:outline-none focus:border-theme-accent text-theme-text"
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
