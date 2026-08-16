import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  HardDrive,
  Activity,
  History,
  BarChart3,
  Settings,
  Sparkles,
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Machine Fleet', path: '/machines', icon: HardDrive },
  { name: 'Run Prediction', path: '/predict', icon: Sparkles, highlight: true },
  { name: 'Audit History', path: '/history', icon: History },
  { name: 'Fleet Analytics', path: '/analytics', icon: BarChart3 },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 border-r border-slate-800/80 bg-slate-950/60 backdrop-blur-md p-4 flex flex-col justify-between shrink-0 hidden lg:flex">
      <div className="space-y-6">
        {/* Navigation Section */}
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 px-3 mb-2">
            Operations
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm'
                        : item.highlight
                        ? 'text-slate-200 hover:bg-slate-900/80 hover:text-white border border-dashed border-emerald-500/30'
                        : 'text-slate-400 hover:bg-slate-900/60 hover:text-slate-200'
                    }`
                  }
                >
                  <Icon className={`w-4 h-4 ${item.highlight ? 'text-emerald-400' : ''}`} />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* 3-Layer Diagnostic Legend */}
        <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80 space-y-2">
          <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>3-Layer Health Matrix</span>
          </div>
          <ul className="space-y-1.5 text-[11px] text-slate-400">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>L1: Random Forest ML</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
              <span>L2: Industrial Rule Engine</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
              <span>L3: Isolation Anomaly</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-slate-800/60 text-xs text-slate-500">
        <div className="flex items-center justify-between">
          <span>PostgreSQL Active</span>
          <span className="font-mono text-emerald-400">50 Units</span>
        </div>
      </div>
    </aside>
  );
};
