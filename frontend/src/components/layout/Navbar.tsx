import React from 'react';
import { Activity, Bell, Cpu, RefreshCw, Zap } from 'lucide-react';
import { HealthBadge } from '../common/HealthBadge';

interface NavbarProps {
  systemHealthy?: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  systemHealthy = true,
  onRefresh,
  isRefreshing = false,
}) => {
  return (
    <header className="sticky top-0 z-30 h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between">
      {/* Left Title / Branding Badge */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-slate-950 shadow-md shadow-emerald-950/50">
          <Cpu className="w-5 h-5 font-bold" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-white tracking-tight text-base sm:text-lg">
              Predictive<span className="text-emerald-400">Guard</span>
            </span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              v1.0
            </span>
          </div>
          <p className="text-xs text-slate-400 hidden sm:block">
            Industrial Machine Health & Predictive Maintenance Platform
          </p>
        </div>
      </div>

      {/* Right System Status & Actions */}
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>Engine Active</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">3-Layer Diagnostic</span>
        </div>

        <HealthBadge status={systemHealthy ? 'Healthy' : 'Warning'} size="sm" />

        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-all disabled:opacity-50"
            title="Refresh Telemetry"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
        )}
      </div>
    </header>
  );
};
