import React, { useState } from 'react';
import { ShieldAlert, Users, Truck, PlaneTakeoff, Zap, Play, CheckCircle2, Loader2, Sparkles, CloudOff, Database, Cpu } from 'lucide-react';

const Simulator = ({ onTriggerSimulation }) => {
  const [loadingType, setLoadingType] = useState(null);
  const [feedback, setFeedback] = useState(null);

  // Regional outbreak config
  const [selectedCountry, setSelectedCountry] = useState('Brazil');
  const [selectedDisease, setSelectedDisease] = useState('Dengue Fever');

  const handleSimulate = async (type) => {
    setLoadingType(type);
    setFeedback(null);
    try {
      const response = await onTriggerSimulation(type, selectedCountry, selectedDisease);
      setFeedback({
        success: true,
        message: response || 'Simulation event processed successfully.'
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
    <div className="space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight font-mono text-gradient-crisis">OUTBREAK SIMULATION ENGINE</h1>
        <p className="text-theme-text-sec mt-1">Stress-test the surveillance portal, generate live data fluctuations, and audit alerts tracking.</p>
      </div>

      {/* FEEDBACK PROMPTS */}
      {feedback && (
        <div className={`p-4 rounded-xl border flex gap-3 items-center animate-fadeIn ${
          feedback.success 
            ? 'bg-status-green-bg border-status-green-border text-status-green' 
            : 'bg-status-red-bg border-status-red-border text-status-red'
        }`}>
          {feedback.success ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-status-green" />
          ) : (
            <ShieldAlert className="w-5 h-5 flex-shrink-0 text-status-red" />
          )}
          <span className="text-sm font-semibold">{feedback.message}</span>
        </div>
      )}

      {/* MAIN CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {simulationCards.map((card) => {
          const Icon = card.icon;
          const isCurrentLoading = loadingType === card.id;
          return (
            <div key={card.id} className={`glass-panel border p-6 rounded-2xl flex flex-col justify-between transition-all duration-300 ${card.color}`}>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Icon className="w-8 h-8" />
                  <span className="text-[10px] uppercase font-mono tracking-widest font-bold opacity-60">{card.category}</span>
                </div>
                <h3 className="text-xl font-bold text-theme-text leading-tight">{card.title}</h3>
                <p className="text-sm text-theme-text-sec mt-2 leading-relaxed">{card.description}</p>
              </div>

              <button 
                onClick={() => handleSimulate(card.id)}
                disabled={loadingType !== null}
                className="mt-8 flex items-center justify-center gap-2 w-full py-3 bg-theme-card border border-theme-border hover:bg-theme-bg text-sm font-bold rounded-xl transition-all disabled:opacity-50 text-theme-text"
              >
                {isCurrentLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-status-green" />
                    Executing Load...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    Launch Simulation
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* REGIONAL OUTBREAK CUSTOM SIMULATOR */}
      <div className="glass-panel p-8 rounded-2xl border border-theme-border">
        <div className="flex items-center gap-2.5 mb-6">
          <Sparkles className="w-6 h-6 text-status-orange" />
          <h2 className="text-xl font-bold text-theme-text font-mono">CUSTOM REGIONAL OUTBREAK</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-theme-text-sec uppercase mb-2">Target Country</label>
            <select 
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full bg-theme-bg border border-theme-border px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-theme-accent text-theme-text"
            >
              <option value="United States">United States</option>
              <option value="India">India</option>
              <option value="Brazil">Brazil</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="South Africa">South Africa</option>
              <option value="Australia">Australia</option>
              <option value="Nigeria">Nigeria</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-theme-text-sec uppercase mb-2">Pathogen Strain</label>
            <select 
              value={selectedDisease}
              onChange={(e) => setSelectedDisease(e.target.value)}
              className="w-full bg-theme-bg border border-theme-border px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-theme-accent text-theme-text"
            >
              <option value="COVID-19">COVID-19</option>
              <option value="Dengue Fever">Dengue Fever</option>
              <option value="Ebola">Ebola</option>
              <option value="Influenza">Influenza</option>
              <option value="Tuberculosis">Tuberculosis</option>
              <option value="Lassa Fever">Lassa Fever</option>
            </select>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-theme-border flex justify-end">
          <button 
            onClick={() => handleSimulate('regional_outbreak')}
            disabled={loadingType !== null}
            className="flex items-center gap-2 px-6 py-3.5 bg-orange-600 hover:bg-orange-500 font-bold rounded-xl text-sm transition-all text-theme-text active:scale-95 disabled:opacity-50"
          >
            {loadingType === 'regional_outbreak' ? (
              <>
                <Loader2 className="w-4.5 h-4.5 animate-spin" />
                Simulating Spread...
              </>
            ) : (
              <>
                <Play className="w-4.5 h-4.5 fill-current" />
                Simulate Local Surge
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Simulator;
