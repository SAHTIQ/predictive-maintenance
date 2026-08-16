import React, { useEffect, useState } from 'react';
import { Settings as SettingsIcon, Cpu, Database, ShieldCheck, CheckCircle2, Server, Sliders } from 'lucide-react';
import { api } from '../services/api';

export const Settings: React.FC = () => {
  const [health, setHealth] = useState<{ status: string; version: string; ml_model_loaded: boolean } | null>(null);

  useEffect(() => {
    api.checkHealth().then((res: any) => setHealth(res)).catch(() => {});
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <SettingsIcon className="w-6 h-6 text-emerald-400" />
          <span>System Settings & Operational Configurations</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Review machine learning model parameters, industrial domain thresholds, and database connection status.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ML & Diagnostics Architecture */}
        <div className="panel-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span>Machine Learning & Diagnostic Engine</span>
            </h3>
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Active
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">Supervised Model:</span>
              <span className="font-mono text-white font-semibold">RandomForestClassifier (150 Estimators)</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">Test Classification Accuracy:</span>
              <span className="font-mono text-emerald-400 font-semibold">99.25% (Balanced Class Weights)</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">Anomaly Detection:</span>
              <span className="font-mono text-purple-400 font-semibold">Isolation Forest (Contamination=0.08)</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">Preprocessing:</span>
              <span className="font-mono text-white">StandardScaler Feature Normalization</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">Feature Schema (7 Dims):</span>
              <span className="font-mono text-slate-300 text-[11px]">temp, vib, press, volt, curr, rpm, op_hours</span>
            </div>
          </div>
        </div>

        {/* Database & System Environment */}
        <div className="panel-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-sky-400" />
              <span>Database & Environment Architecture</span>
            </h3>
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/30">
              Connected
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">Database Engine:</span>
              <span className="font-mono text-white font-semibold">PostgreSQL (psycopg2 / SQLAlchemy)</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">FastAPI REST Framework:</span>
              <span className="font-mono text-white">v{health?.version || '1.0.0'}</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">Dataset Scale:</span>
              <span className="font-mono text-white">5,000 Observations (50 Machines × 100 timesteps)</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">Licensing:</span>
              <span className="font-mono text-emerald-400 font-semibold">MIT License (SPDX: MIT)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Configured Industrial Domain Rule Thresholds */}
      <div className="panel-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-400" />
            <span>Configured Industrial Rule Thresholds (Layer 2)</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">ISO 10816 Mechanical Standards</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <div className="text-slate-400 font-semibold">Temperature Limits</div>
            <div className="text-slate-200 mt-1">Warning: &ge; 80.0°C</div>
            <div className="text-rose-400 font-semibold mt-0.5">Critical: &ge; 92.0°C</div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <div className="text-slate-400 font-semibold">Vibration Velocity</div>
            <div className="text-slate-200 mt-1">Warning: &ge; 4.2 mm/s</div>
            <div className="text-rose-400 font-semibold mt-0.5">Critical: &ge; 6.5 mm/s</div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <div className="text-slate-400 font-semibold">Pressure Envelope</div>
            <div className="text-slate-200 mt-1">Minimum: 2.5 bar</div>
            <div className="text-slate-200 mt-0.5">Maximum: 7.5 bar</div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <div className="text-slate-400 font-semibold">Motor Current Load</div>
            <div className="text-slate-200 mt-1">Warning: &ge; 22.0 A</div>
            <div className="text-rose-400 font-semibold mt-0.5">Critical: &ge; 28.0 A</div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <div className="text-slate-400 font-semibold">Voltage Stability</div>
            <div className="text-slate-200 mt-1">Minimum: 370.0 V</div>
            <div className="text-slate-200 mt-0.5">Maximum: 430.0 V</div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <div className="text-slate-400 font-semibold">Speed Bounds</div>
            <div className="text-slate-200 mt-1">Nominal: ~1500 RPM</div>
            <div className="text-slate-200 mt-0.5">Jitter Tolerance: ±10%</div>
          </div>
        </div>
      </div>
    </div>
  );
};
