import React, { useState, useEffect } from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, 
  PointElement, LineElement, ArcElement, Title, Tooltip, Legend 
} from 'chart.js';
import { BarChart3, LineChart, PieChart } from 'lucide-react';

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
    orangeBorder: '#f97316',
    purpleBorder: '#a855f7',
    
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
  
  const getBarData = (canvas) => {
    const ctx = canvas.getContext('2d');
    const height = canvas.height || 250;

    const gradBlueBar = ctx.createLinearGradient(0, 0, 0, height);
    gradBlueBar.addColorStop(0, 'rgba(56, 189, 248, 0.85)');
    gradBlueBar.addColorStop(1, 'rgba(56, 189, 248, 0.2)');

    const gradGreenBar = ctx.createLinearGradient(0, 0, 0, height);
    gradGreenBar.addColorStop(0, 'rgba(16, 185, 129, 0.85)');
    gradGreenBar.addColorStop(1, 'rgba(16, 185, 129, 0.2)');

    return {
      labels: countryLabels,
      datasets: [
        {
          label: 'Total Cases',
          data: countryCases,
          backgroundColor: gradBlueBar,
          borderColor: colors.blueBorder,
          borderWidth: 1,
          borderRadius: 4
        },
        {
          label: 'Recoveries',
          data: countryRecoveries,
          backgroundColor: gradGreenBar,
          borderColor: colors.emeraldBorder,
          borderWidth: 1,
          borderRadius: 4
        }
      ]
    };
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

  const getLineData = (canvas) => {
    const ctx = canvas.getContext('2d');
    const height = canvas.height || 350;
    
    const gradBlue = ctx.createLinearGradient(0, 0, 0, height);
    gradBlue.addColorStop(0, 'rgba(56, 189, 248, 0.35)');
    gradBlue.addColorStop(1, 'rgba(56, 189, 248, 0.01)');

    const gradGreen = ctx.createLinearGradient(0, 0, 0, height);
    gradGreen.addColorStop(0, 'rgba(16, 185, 129, 0.35)');
    gradGreen.addColorStop(1, 'rgba(16, 185, 129, 0.01)');

    const gradRose = ctx.createLinearGradient(0, 0, 0, height);
    gradRose.addColorStop(0, 'rgba(239, 68, 68, 0.35)');
    gradRose.addColorStop(1, 'rgba(239, 68, 68, 0.01)');

    return {
      labels: trendMonths,
      datasets: [
        {
          label: 'Cases Trend',
          data: trendCases,
          borderColor: colors.blueBorder,
          backgroundColor: gradBlue,
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
          backgroundColor: gradGreen,
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
          backgroundColor: gradRose,
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
          <Line data={getLineData} options={options} />
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
            <Bar data={getBarData} options={options} />
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
              <p className="text-slate-500 text-sm">No disease distributions to display.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
