import React from 'react';
import { Settings, ShieldCheck, HeartPulse, HardDrive, Cpu, ShieldAlert, Key } from 'lucide-react';

const AdminPortal = ({ health, users }) => {
  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight font-mono text-gradient-tech">ADMINISTRATION PORTAL</h1>
        <p className="text-theme-text-sec mt-1">Audit server hardware diagnostics, database states, and review registered operator credentials.</p>
      </div>

      {/* HARDWARE DIAGNOSTICS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* PLATFORM HEATH */}
        <div className="glass-panel p-6 rounded-2xl border border-theme-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-theme-text-sec uppercase tracking-wider">Service Status</h3>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="flex items-baseline gap-2 mt-4">
            <span className="text-3xl font-extrabold text-theme-text">ONLINE</span>
            <span className="text-xs font-semibold text-status-green">HTTP {health?.status || 'UP'}</span>
          </div>
          <p className="text-xs text-theme-text-sec mt-2 font-mono">Server Uptime: {health?.uptime || 'N/A'}</p>
        </div>

        {/* DATABASE STATUS */}
        <div className="glass-panel p-6 rounded-2xl border border-theme-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-theme-text-sec uppercase tracking-wider">Mongoose Database</h3>
            <HardDrive className="w-5 h-5 text-status-blue" />
          </div>
          <div className="flex items-baseline gap-2 mt-4">
            <span className="text-3xl font-extrabold text-theme-text">CONNECTED</span>
          </div>
          <p className="text-xs text-theme-text-sec mt-2 font-mono">Status: {health?.database || 'Healthy'}</p>
        </div>

        {/* NODE RAM ALLOCATION */}
        <div className="glass-panel p-6 rounded-2xl border border-theme-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-theme-text-sec uppercase tracking-wider">RAM Allocation</h3>
            <Cpu className="w-5 h-5 text-theme-accent" />
          </div>
          <div className="flex items-baseline gap-2 mt-4">
            <span className="text-3xl font-extrabold text-theme-text">{health?.processDetails?.memoryHeapUsed || 'N/A'}</span>
          </div>
          <p className="text-xs text-theme-text-sec mt-2 font-mono">Heap Total: {health?.processDetails?.memoryHeapTotal || 'N/A'}</p>
        </div>
      </div>

      {/* USER DIRECTORY */}
      <div className="glass-panel rounded-2xl border border-theme-border overflow-hidden">
        <div className="p-6 border-b border-theme-border bg-theme-card">
          <h2 className="text-lg font-bold flex items-center gap-2 text-theme-text">
            <ShieldCheck className="w-5 h-5 text-status-green" />
            Registered Operators Directory
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-theme-border text-theme-text-sec text-xs uppercase font-semibold bg-slate-100/40 dark:bg-slate-800/40">
                <th className="p-4 pl-6">Operator Name</th>
                <th className="p-4">Email ID</th>
                <th className="p-4">Assigned Role</th>
                <th className="p-4 pr-6">Created On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-border text-sm font-medium">
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user._id} className="hover:bg-theme-card-hover">
                    <td className="p-4 pl-6 text-theme-text font-semibold flex items-center gap-2">
                      <Key className="w-4 h-4 text-status-blue" />
                      {user.name}
                    </td>
                    <td className="p-4 text-theme-text font-mono text-xs">{user.email}</td>
                    <td className="p-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] uppercase font-mono font-bold ${
                        user.role === 'admin' 
                          ? 'bg-status-red-bg text-status-red border border-status-red-border' 
                          : 'bg-status-blue-bg text-status-blue border border-blue-500/20'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-theme-text-sec text-xs font-mono">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-theme-text-sec">
                    No operator accounts found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPortal;
