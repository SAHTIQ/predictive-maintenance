import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Activity,
  Cpu,
  ShieldCheck,
  Zap,
  RotateCcw,
  ArrowRight,
  Database,
} from 'lucide-react';

import { api } from '../services/api';
import { Machine, PredictionResponse } from '../types';
import { HealthBadge } from '../components/common/HealthBadge';

const PRESETS = {
  healthy: {
    label: 'Normal Baseline (Healthy)',
    values: {
      temperature: 62.5,
      vibration: 1.85,
      pressure: 4.8,
      voltage: 402.0,
      current: 14.5,
      rpm: 1495.0,
      operating_hours: 2150.0,
    },
  },
  warning_temp: {
    label: 'Elevated Temperature (Warning)',
    values: {
      temperature: 84.5,
      vibration: 3.95,
      pressure: 5.2,
      voltage: 395.0,
      current: 21.8,
      rpm: 1460.0,
      operating_hours: 4800.0,
    },
  },
  critical_bearing: {
    label: 'Severe Bearing Failure (Critical)',
    values: {
      temperature: 96.2,
      vibration: 7.85,
      pressure: 5.6,
      voltage: 388.0,
      current: 29.5,
      rpm: 1360.0,
      operating_hours: 8100.0,
    },
  },
  electrical_anomaly: {
    label: 'Electrical Surge Anomaly (Anomaly)',
    values: {
      temperature: 75.0,
      vibration: 3.1,
      pressure: 5.0,
      voltage: 358.0,
      current: 31.2,
      rpm: 1220.0,
      operating_hours: 3400.0,
    },
  },
};

export const Prediction: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialMachineId = searchParams.get('machine_id') || 'M-001';

  const [machines, setMachines] = useState<Machine[]>([]);
  const [selectedMachineId, setSelectedMachineId] = useState(initialMachineId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Sensor Form Input States
  const [sensorValues, setSensorValues] = useState(PRESETS.healthy.values);

  useEffect(() => {
    const loadMachineList = async () => {
      try {
        const res = await api.getMachines({ limit: 100 });
        setMachines(res.items);
      } catch (err) {
        console.error(err);
      }
    };
    loadMachineList();
  }, []);

  const handlePresetSelect = (presetKey: keyof typeof PRESETS) => {
    setSensorValues(PRESETS[presetKey].values);
    setResult(null);
  };

  const handleInputChange = (field: keyof typeof sensorValues, value: number) => {
    setSensorValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleRunPrediction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setError(null);
      const res = await api.predict({
        machine_id: selectedMachineId,
        ...sensorValues,
      });
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Diagnostic execution failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              3-Layer Diagnostic Studio
            </h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Inference Engine
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Evaluate live or simulated sensor telemetry across Machine Learning, Industrial Rule Thresholds, and Unsupervised Isolation Forest.
          </p>
        </div>

        {/* Quick-fill Presets */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-slate-400 mr-1 hidden sm:inline">Presets:</span>
          <button
            type="button"
            onClick={() => handlePresetSelect('healthy')}
            className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-medium transition-colors"
          >
            Normal
          </button>
          <button
            type="button"
            onClick={() => handlePresetSelect('warning_temp')}
            className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-medium transition-colors"
          >
            Warning
          </button>
          <button
            type="button"
            onClick={() => handlePresetSelect('critical_bearing')}
            className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-medium transition-colors"
          >
            Critical
          </button>
          <button
            type="button"
            onClick={() => handlePresetSelect('electrical_anomaly')}
            className="px-2.5 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 text-xs font-medium transition-colors"
          >
            Anomaly
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Interactive Telemetry Form */}
        <div className="lg:col-span-6 space-y-6">
          <form onSubmit={handleRunPrediction} className="panel-card p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" />
                <span>Sensor Measurements Input</span>
              </h3>
              <button
                type="button"
                onClick={() => handlePresetSelect('healthy')}
                className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
                title="Reset to default baseline"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* Target Machine Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Target Machine Unit *
              </label>
              <select
                value={selectedMachineId}
                onChange={(e) => setSelectedMachineId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-sm focus:border-emerald-500 focus:outline-none"
              >
                {machines.length > 0 ? (
                  machines.map((m) => (
                    <option key={m.machine_id} value={m.machine_id}>
                      {m.machine_id} — {m.name} ({m.type})
                    </option>
                  ))
                ) : (
                  <option value="M-001">M-001 — CNC Milling Machine #01</option>
                )}
              </select>
            </div>

            {/* Sliders and Numeric Inputs Grid */}
            <div className="space-y-4 pt-2">
              {/* Temperature */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-200">
                    Temperature (°C)
                  </label>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    {sensorValues.temperature.toFixed(1)} °C
                  </span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="120"
                  step="0.5"
                  value={sensorValues.temperature}
                  onChange={(e) => handleInputChange('temperature', parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>Normal &lt;80°C</span>
                  <span>Warn 80-92°C</span>
                  <span className="text-rose-400 font-semibold">Critical &gt;92°C</span>
                </div>
              </div>

              {/* Vibration */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-200">
                    Vibration (mm/s)
                  </label>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    {sensorValues.vibration.toFixed(2)} mm/s
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="12.0"
                  step="0.05"
                  value={sensorValues.vibration}
                  onChange={(e) => handleInputChange('vibration', parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>Normal &lt;4.2 mm/s</span>
                  <span>Warn 4.2-6.5</span>
                  <span className="text-rose-400 font-semibold">Critical &gt;6.5</span>
                </div>
              </div>

              {/* Pressure & Voltage (2-col) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-200">Pressure (bar)</label>
                    <span className="text-xs font-mono font-bold text-white">
                      {sensorValues.pressure.toFixed(1)} bar
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="10.0"
                    step="0.1"
                    value={sensorValues.pressure}
                    onChange={(e) => handleInputChange('pressure', parseFloat(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-500 block">Nominal: 2.5 - 7.5 bar</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-200">Voltage (V)</label>
                    <span className="text-xs font-mono font-bold text-white">
                      {sensorValues.voltage.toFixed(0)} V
                    </span>
                  </div>
                  <input
                    type="range"
                    min="320"
                    max="450"
                    step="1"
                    value={sensorValues.voltage}
                    onChange={(e) => handleInputChange('voltage', parseFloat(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-500 block">Tolerance: 370 - 430 V</span>
                </div>
              </div>

              {/* Current, RPM, Operating Hours */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Current (A)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={sensorValues.current}
                    onChange={(e) => handleInputChange('current', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Speed (RPM)
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={sensorValues.rpm}
                    onChange={(e) => handleInputChange('rpm', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Runtime (Hours)
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={sensorValues.operating_hours}
                    onChange={(e) => handleInputChange('operating_hours', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-950/60 hover:from-emerald-500 hover:to-emerald-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-[1.01]"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSubmitting ? 'Executing 3-Layer Diagnostic...' : 'Execute 3-Layer Diagnostic Analysis'}</span>
            </button>
          </form>
        </div>

        {/* Right Side: Explainable 3-Layer Diagnostic Card */}
        <div className="lg:col-span-6 space-y-6">
          {!result ? (
            <div className="panel-card p-12 text-center h-full flex flex-col items-center justify-center text-slate-400 space-y-4 border-dashed">
              <div className="p-4 rounded-2xl bg-slate-800/50 text-slate-500">
                <Cpu className="w-12 h-12 text-slate-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-300">Awaiting Diagnostic Input</h3>
              <p className="text-xs text-slate-500 max-w-sm">
                Select preset telemetry or tweak parameter sliders on the left, then click <strong className="text-slate-300">Execute 3-Layer Diagnostic</strong> to run full inference.
              </p>
            </div>
          ) : (
            <div className="panel-card p-6 space-y-6 animate-in slide-in-from-right-4 duration-300 border-emerald-500/30">
              {/* Overall Result Banner */}
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                    Overall Machine Status
                  </div>
                  <div className="text-2xl font-black font-mono text-white mt-1 flex items-center gap-3">
                    <span>{result.overall_status.toUpperCase()}</span>
                    <HealthBadge status={result.overall_status} size="md" />
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                    Risk Level
                  </div>
                  <div className={`text-lg font-bold font-mono mt-1 ${
                    result.risk_level === 'Critical' ? 'text-rose-400' :
                    result.risk_level === 'High' ? 'text-amber-400' :
                    result.risk_level === 'Medium' ? 'text-yellow-400' : 'text-emerald-400'
                  }`}>
                    {result.risk_level}
                  </div>
                </div>
              </div>

              {/* 3 Prediction Layers Breakdown */}
              <div className="space-y-3">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  3-Layer Intelligence Breakdown
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Layer 1: ML Classification */}
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-medium">Layer 1: ML Model</span>
                      <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <div className="font-bold text-sm text-white flex items-center justify-between">
                      <span>{result.ml_result.prediction}</span>
                      <span className="font-mono text-xs text-emerald-400 font-normal">
                        {(result.ml_result.confidence * 100).toFixed(0)}% Conf
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-emerald-400 h-full rounded-full"
                        style={{ width: `${result.ml_result.confidence * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Layer 2: Rule Engine */}
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-medium">Layer 2: Rule Engine</span>
                      <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                    </div>
                    <div className="font-bold text-sm text-white flex items-center justify-between">
                      <span>{result.rule_result.prediction}</span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        {result.rule_result.violations.length} breach(es)
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 line-clamp-1">
                      {result.rule_result.violations.length > 0 ? 'Thresholds exceeded' : 'All parameters nominal'}
                    </div>
                  </div>

                  {/* Layer 3: Anomaly Engine */}
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-medium">Layer 3: Anomaly</span>
                      <Activity className="w-3.5 h-3.5 text-purple-400" />
                    </div>
                    <div className="font-bold text-sm text-white flex items-center justify-between">
                      <span className={result.anomaly_result.is_anomaly ? 'text-purple-400' : 'text-slate-300'}>
                        {result.anomaly_result.prediction}
                      </span>
                      <span className="font-mono text-xs text-purple-400 font-normal">
                        {result.anomaly_result.anomaly_score.toFixed(2)}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 line-clamp-1">
                      {result.anomaly_result.is_anomaly ? 'Outlier signature' : 'Within normal cluster'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Explainability Section */}
              <div className="space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Detected Stress Factors
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {result.detected_factors.map((factor, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                        <span>{factor}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Actionable Maintenance Recommendation */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/30 space-y-1.5">
                <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Actionable Maintenance Recommendation</span>
                </div>
                <p className="text-xs text-slate-200 font-medium leading-relaxed">
                  {result.recommended_action}
                </p>
              </div>

              {/* Persistence confirmation tag */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Stored in PostgreSQL (Audit #{result.id || 'N/A'})</span>
                </div>
                <button
                  onClick={() => navigate(`/history?machine_id=${selectedMachineId}`)}
                  className="text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
                >
                  <span>View Machine History</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
