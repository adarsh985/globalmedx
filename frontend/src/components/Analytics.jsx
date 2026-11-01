import React, { useState, useEffect, useMemo } from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, 
  PointElement, LineElement, ArcElement, Title, Tooltip, Legend 
} from 'chart.js';
import { BarChart3, LineChart, PieChart, TrendingUp, Sparkles, Sliders, ShieldAlert, CheckCircle2 } from 'lucide-react';

// Register ChartJS plugins
ChartJS.register(
  CategoryScale, LinearScale, BarElement, PointElement, 
  LineElement, ArcElement, Title, Tooltip, Legend
);

const Analytics = ({ data }) => {
  // Observe HTML element theme changes to update chart styling instantly
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Theme Colors Configuration
  const textColor = isDark ? '#94a3b8' : '#64748b'; // --theme-text-sec
  const gridColor = isDark ? '#1e293b' : '#e2e8f0'; // --theme-border

  const colors = {
    blueBorder: '#38bdf8',
    emeraldBorder: '#10b981',
    roseBorder: '#ef4444',
    
    // Doughnut chart fills (static colors)
    rose: 'rgba(244, 63, 94, 0.8)',
    orange: 'rgba(249, 115, 22, 0.8)',
    blue: 'rgba(56, 189, 248, 0.8)',
    purple: 'rgba(168, 85, 247, 0.8)',
    emerald: 'rgba(16, 185, 129, 0.8)'
  };

  // 1. Cases by Country Chart Data
  const countryLabels = data?.byCountry?.map(c => c.country) || [];
  const countryCases = data?.byCountry?.map(c => c.cases) || [];
  const countryRecoveries = data?.byCountry?.map(c => c.recoveries) || [];
  
  const barData = {
    labels: countryLabels,
    datasets: [
      {
        label: 'Total Cases',
        data: countryCases,
        backgroundColor: 'rgba(56, 189, 248, 0.6)',
        borderColor: colors.blueBorder,
        borderWidth: 1,
        borderRadius: 4
      },
      {
        label: 'Recoveries',
        data: countryRecoveries,
        backgroundColor: 'rgba(16, 185, 129, 0.6)',
        borderColor: colors.emeraldBorder,
        borderWidth: 1,
        borderRadius: 4
      }
    ]
  };

  // 2. Cases by Disease Doughnut Data
  const diseaseLabels = data?.byDisease?.map(d => d.disease) || [];
  const diseaseCases = data?.byDisease?.map(d => d.cases) || [];
  const diseaseChartData = {
    labels: diseaseLabels,
    datasets: [
      {
        data: diseaseCases,
        backgroundColor: [
          colors.rose,
          colors.orange,
          colors.blue,
          colors.purple,
          colors.emerald
        ],
        borderColor: isDark ? '#131e3a' : '#ffffff', // --theme-card
        borderWidth: 2
      }
    ]
  };

  // 3. Line Chart Trends
  const trendMonths = data?.monthlyTrends?.map(t => t.month) || [];
  const trendCases = data?.monthlyTrends?.map(t => t.cases) || [];
  const trendDeaths = data?.monthlyTrends?.map(t => t.deaths) || [];
  const trendRecoveries = data?.monthlyTrends?.map(t => t.recoveries) || [];

  const lineData = {
    labels: trendMonths,
    datasets: [
      {
        label: 'Cases Trend',
        data: trendCases,
        borderColor: colors.blueBorder,
        backgroundColor: 'rgba(56, 189, 248, 0.15)',
        tension: 0.35,
        fill: true,
        borderWidth: 3,
        pointBackgroundColor: colors.blueBorder,
        pointBorderColor: isDark ? '#131e3a' : '#ffffff', // --theme-card
        pointBorderWidth: 1.5,
        pointHoverRadius: 6,
        pointRadius: 4
      },
      {
        label: 'Recoveries Trend',
        data: trendRecoveries,
        borderColor: colors.emeraldBorder,
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        tension: 0.35,
        fill: true,
        borderWidth: 2.5,
        pointBackgroundColor: colors.emeraldBorder,
        pointBorderColor: isDark ? '#131e3a' : '#ffffff',
        pointBorderWidth: 1.5,
        pointHoverRadius: 5,
        pointRadius: 3.5
      },
      {
        label: 'Deaths Trend',
        data: trendDeaths,
        borderColor: colors.roseBorder,
        backgroundColor: 'rgba(239, 68, 68, 0.15)',
        tension: 0.35,
        fill: true,
        borderWidth: 2,
        pointBackgroundColor: colors.roseBorder,
        pointBorderColor: isDark ? '#131e3a' : '#ffffff',
        pointBorderWidth: 1.5,
        pointHoverRadius: 5,
        pointRadius: 3.5
      }
    ]
  };

  // --- SIR 14-DAY OUTBREAK PREDICTIVE MODEL ---
  const [r0, setR0] = useState(2.2);
  const [intervention, setIntervention] = useState('none');

  const { projectionDays, projectedInfections, projectedRecoveries, effectiveR0, peakDay, peakCases } = useMemo(() => {
    const effR0 = intervention === 'strict' ? r0 * 0.45 : intervention === 'moderate' ? r0 * 0.8 : r0;
    const days = Array.from({ length: 14 }, (_, i) => `Day ${i + 1}`);
    let currentI = 14500;
    let currentR = 2500;
    const projI = [];
    const projR = [];
    let pDay = 1;
    let maxI = currentI;

    for (let i = 0; i < 14; i++) {
      projI.push(Math.round(currentI));
      projR.push(Math.round(currentR));
      if (currentI > maxI) {
        maxI = currentI;
        pDay = i + 1;
      }
      const growthFactor = (effR0 - 1) * 0.12;
      const dailyNew = Math.max(0, currentI * growthFactor);
      const dailyRec = currentI * 0.075;
      currentI = Math.max(800, currentI + dailyNew - dailyRec);
      currentR += dailyRec;
    }

    return {
      projectionDays: days,
      projectedInfections: projI,
      projectedRecoveries: projR,
      effectiveR0: Number(effR0.toFixed(2)),
      peakDay: pDay,
      peakCases: Math.round(maxI)
    };
  }, [r0, intervention]);

  const projectionChartData = {
    labels: projectionDays,
    datasets: [
      {
        label: 'Projected Active Infections',
        data: projectedInfections,
        borderColor: effectiveR0 > 1 ? '#f43f5e' : '#10b981',
        backgroundColor: effectiveR0 > 1 ? 'rgba(244, 63, 94, 0.12)' : 'rgba(16, 185, 129, 0.12)',
        tension: 0.35,
        fill: true,
        borderWidth: 3,
        pointRadius: 4
      },
      {
        label: 'Cumulative Recovered',
        data: projectedRecoveries,
        borderColor: '#38bdf8',
        backgroundColor: 'rgba(56, 189, 248, 0.08)',
        tension: 0.35,
        fill: true,
        borderWidth: 2,
        pointRadius: 3
      }
    ]
  };

  // Theme-aware Chart Configuration
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: textColor,
          font: { family: 'Inter', size: 11 }
        }
      },
      tooltip: {
        backgroundColor: isDark ? '#131e3a' : '#ffffff',
        titleColor: isDark ? '#f8fafc' : '#0f172a',
        bodyColor: isDark ? '#94a3b8' : '#64748b',
        borderColor: isDark ? '#1e293b' : '#e2e8f0',
        borderWidth: 1,
        titleFont: { family: 'Outfit', size: 12, weight: 'bold' },
        bodyFont: { family: 'Inter', size: 12 },
        padding: 10,
        boxPadding: 4,
        usePointStyle: true
      }
    },
    scales: {
      x: {
        grid: { color: gridColor },
        ticks: { color: textColor, font: { family: 'Inter' } }
      },
      y: {
        grid: { color: gridColor },
        ticks: { color: textColor, font: { family: 'Inter' } }
      }
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-theme-text">ANALYTICS BOARD</h1>
        <p className="text-theme-text-sec mt-1">Cross-examine disease propagation trends, recovery indices, and geographical distribution curves.</p>
      </div>

      {/* TREND PROJECTIONS CHART */}
      <div className="medical-card p-6">
        <h2 className="text-lg font-bold flex items-center gap-2 mb-6 text-theme-text">
          <LineChart className="w-5 h-5 text-status-blue" />
          Pandemic Aggregated Monthly Trends (Last 6 Months)
        </h2>
        <div className="h-96">
          <Line data={lineData} options={options} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* CASES BY COUNTRY */}
        <div className="lg:col-span-2 medical-card p-6">
          <h2 className="text-lg font-bold flex items-center gap-2 mb-6 text-theme-text">
            <BarChart3 className="w-5 h-5 text-theme-accent" />
            Cases and Recoveries by Country
          </h2>
          <div className="h-80">
            <Bar data={barData} options={options} />
          </div>
        </div>

        {/* CASES BY PATHOGEN */}
        <div className="medical-card p-6">
          <h2 className="text-lg font-bold flex items-center gap-2 mb-6 text-theme-text">
            <PieChart className="w-5 h-5 text-theme-accent" />
            Active Cases by Pathogen Strain
          </h2>
          <div className="h-80 relative flex items-center justify-center">
            {diseaseLabels.length > 0 ? (
              <Doughnut 
                data={diseaseChartData} 
                options={{
                  ...options,
                  scales: {} // Disable scales for Doughnut
                }} 
                className="z-10"
              />
            ) : (
              <p className="text-theme-text-sec text-sm">No disease distributions to display.</p>
            )}
          </div>
        </div>
      </div>

      {/* 14-DAY EPIDEMIOLOGICAL SIR PREDICTIVE PROJECTION MODEL */}
      <div className="medical-card p-6 border border-theme-border rounded-2xl bg-theme-card">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2 text-theme-text font-mono">
              <Sparkles className="w-5 h-5 text-status-orange" />
              14-DAY OUTBREAK PREDICTIVE MODEL (SIR / R₀ PROJECTION)
            </h2>
            <p className="text-xs text-theme-text-sec mt-1">
              Simulate epidemiological transmission velocity, curve flattening, and containment thresholds.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${
              effectiveR0 > 1 
                ? 'bg-status-red-bg text-status-red border-status-red-border' 
                : 'bg-status-green-bg text-status-green border-status-green-border'
            }`}>
              {effectiveR0 > 1 ? '⚠️ EXPONENTIAL SPREAD' : '✅ EPIDEMIC CONTAINED'} (R₀ = {effectiveR0})
            </span>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 rounded-xl bg-theme-bg border border-theme-border mb-6 text-xs font-mono">
          <div>
            <label className="block text-theme-text-sec font-bold uppercase text-[10px] mb-2 flex justify-between">
              <span>Basic Reproduction Number (R₀)</span>
              <span className="text-theme-accent font-bold text-sm">{r0}</span>
            </label>
            <input 
              type="range" 
              min="0.8" 
              max="3.8" 
              step="0.1" 
              value={r0} 
              onChange={(e) => setR0(parseFloat(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-theme-text-sec mt-1">
              <span>0.8 (Sub-critical)</span>
              <span>2.2 (Seasonal)</span>
              <span>3.8 (Severe)</span>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-theme-text-sec font-bold uppercase text-[10px] mb-2">
              Public Health Intervention Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button 
                type="button"
                onClick={() => setIntervention('none')}
                className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                  intervention === 'none' 
                    ? 'bg-status-red-bg text-status-red border-status-red' 
                    : 'border-theme-border text-theme-text-sec hover:bg-theme-card-hover'
                }`}
              >
                No Restrictions (100%)
              </button>
              <button 
                type="button"
                onClick={() => setIntervention('moderate')}
                className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                  intervention === 'moderate' 
                    ? 'bg-status-orange-bg text-status-orange border-status-orange' 
                    : 'border-theme-border text-theme-text-sec hover:bg-theme-card-hover'
                }`}
              >
                Distancing (-20%)
              </button>
              <button 
                type="button"
                onClick={() => setIntervention('strict')}
                className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                  intervention === 'strict' 
                    ? 'bg-status-green-bg text-status-green border-status-green' 
                    : 'border-theme-border text-theme-text-sec hover:bg-theme-card-hover'
                }`}
              >
                Strict Lockdown (-55%)
              </button>
            </div>
          </div>
        </div>

        {/* METRICS CALLOUTS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 text-xs font-mono">
          <div className="bg-theme-bg p-3 rounded-xl border border-theme-border">
            <span className="text-[10px] text-theme-text-sec uppercase">Effective R₀</span>
            <span className={`text-base font-bold block mt-1 ${effectiveR0 > 1 ? 'text-status-red' : 'text-status-green'}`}>
              {effectiveR0}
            </span>
          </div>
          <div className="bg-theme-bg p-3 rounded-xl border border-theme-border">
            <span className="text-[10px] text-theme-text-sec uppercase">Projected Peak Day</span>
            <span className="text-base font-bold text-theme-text block mt-1">Day {peakDay}</span>
          </div>
          <div className="bg-theme-bg p-3 rounded-xl border border-theme-border">
            <span className="text-[10px] text-theme-text-sec uppercase">Peak Active Load</span>
            <span className="text-base font-bold text-status-orange block mt-1">{peakCases.toLocaleString()}</span>
          </div>
          <div className="bg-theme-bg p-3 rounded-xl border border-theme-border">
            <span className="text-[10px] text-theme-text-sec uppercase">14-Day Cumulative Rec</span>
            <span className="text-base font-bold text-status-blue block mt-1">
              {(projectedRecoveries[13] || 0).toLocaleString()}
            </span>
          </div>
        </div>

        {/* CHART */}
        <div className="h-80">
          <Line data={projectionChartData} options={options} />
        </div>
      </div>
    </div>
  );
};

export default Analytics;
