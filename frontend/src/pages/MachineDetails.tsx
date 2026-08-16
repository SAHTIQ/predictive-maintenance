import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  HardDrive,
  ArrowLeft,
  Sparkles,
  Calendar,
  Clock,
  MapPin,
  Building,
  Activity,
  History,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

import { api } from '../services/api';
import { Machine, SensorTrendPoint, PredictionHistoryItem } from '../types';
import { HealthBadge } from '../components/common/HealthBadge';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';

export const MachineDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [machine, setMachine] = useState<Machine | null>(null);
  const [trends, setTrends] = useState<SensorTrendPoint[]>([]);
  const [history, setHistory] = useState<PredictionHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const [machRes, trendRes, histRes] = await Promise.all([
          api.getMachine(id),
          api.getMachineTrend(id, 30),
          api.getMachineHistory(id, { limit: 10 }),
        ]);
        setMachine(machRes);
        setTrends(trendRes);
        setHistory(histRes.items);
      } catch (err: any) {
        setError(err.message || 'Failed to load machine profile');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton rows={2} height="h-20" />
        <LoadingSkeleton rows={4} height="h-64" />
      </div>
    );
  }

  if (error || !machine) {
    return (
      <div className="p-8 rounded-2xl bg-rose-950/20 border border-rose-500/30 text-center space-y-4">
        <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto" />
        <h3 className="text-lg font-semibold text-rose-200">Machine Not Found</h3>
        <p className="text-sm text-slate-400">{error || `Machine ${id} could not be located.`}</p>
        <button
          onClick={() => navigate('/machines')}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm"
        >
          Back to Fleet Directory
        </button>
      </div>
    );
  }

  const latestTrend = trends.length > 0 ? trends[trends.length - 1] : null;

  // Format trend data for charts
  const chartData = trends.map((t, idx) => ({
    time: new Date(t.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    temperature: t.temperature,
    vibration: t.vibration,
    pressure: t.pressure,
    current: t.current,
    voltage: t.voltage,
    rpm: t.rpm,
  }));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/machines')}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-white font-mono">
                {machine.machine_id}
              </h1>
              <HealthBadge status={machine.current_health} size="md" />
              {!machine.active && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                  Inactive
                </span>
              )}
            </div>
            <p className="text-sm text-slate-400 mt-0.5">
              {machine.name} · {machine.type}
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate(`/predict?machine_id=${machine.machine_id}`)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm transition-all shadow-md shadow-emerald-950/60"
        >
          <Sparkles className="w-4 h-4" />
          <span>Run Sensor Diagnosis</span>
        </button>
      </div>

      {/* Machine Specifications Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="panel-card p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-slate-800 text-slate-400">
            <MapPin className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
              Location
            </div>
            <div className="text-sm font-medium text-white line-clamp-1">{machine.location}</div>
          </div>
        </div>

        <div className="panel-card p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-slate-800 text-slate-400">
            <Clock className="w-5 h-5 text-sky-400" />
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
              Runtime Hours
            </div>
            <div className="text-sm font-medium text-white font-mono">
              {machine.operating_hours.toLocaleString()} hrs
            </div>
          </div>
        </div>

        <div className="panel-card p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-slate-800 text-slate-400">
            <Building className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
              Manufacturer / Model
            </div>
            <div className="text-sm font-medium text-white line-clamp-1">
              {machine.manufacturer || 'N/A'} {machine.model ? `(${machine.model})` : ''}
            </div>
          </div>
        </div>

        <div className="panel-card p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-slate-800 text-slate-400">
            <Calendar className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
              Commissioned
            </div>
            <div className="text-sm font-medium text-white">
              {new Date(machine.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* Latest Telemetry Gauges */}
      {latestTrend && (
        <div className="panel-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-white">Active Sensor Telemetry</h3>
            <span className="text-xs text-slate-500 font-mono">
              Updated {new Date(latestTrend.recorded_at).toLocaleTimeString()}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
              <div className="text-xs text-slate-400 mb-1">Temperature</div>
              <div className={`text-xl font-bold font-mono ${latestTrend.temperature > 85 ? 'text-rose-400' : 'text-white'}`}>
                {latestTrend.temperature.toFixed(1)}°C
              </div>
              <div className="text-[10px] text-slate-500 mt-1">Normal: &lt;80°C</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
              <div className="text-xs text-slate-400 mb-1">Vibration</div>
              <div className={`text-xl font-bold font-mono ${latestTrend.vibration > 4.5 ? 'text-rose-400' : 'text-white'}`}>
                {latestTrend.vibration.toFixed(2)} mm/s
              </div>
              <div className="text-[10px] text-slate-500 mt-1">Normal: &lt;4.2 mm/s</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
              <div className="text-xs text-slate-400 mb-1">Pressure</div>
              <div className="text-xl font-bold font-mono text-white">
                {latestTrend.pressure.toFixed(1)} bar
              </div>
              <div className="text-[10px] text-slate-500 mt-1">Range: 2.5 - 7.5 bar</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
              <div className="text-xs text-slate-400 mb-1">Voltage</div>
              <div className="text-xl font-bold font-mono text-white">
                {latestTrend.voltage.toFixed(0)} V
              </div>
              <div className="text-[10px] text-slate-500 mt-1">Tolerance: 370 - 430 V</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
              <div className="text-xs text-slate-400 mb-1">Current</div>
              <div className={`text-xl font-bold font-mono ${latestTrend.current > 22 ? 'text-amber-400' : 'text-white'}`}>
                {latestTrend.current.toFixed(1)} A
              </div>
              <div className="text-[10px] text-slate-500 mt-1">Nominal: &lt;22 A</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
              <div className="text-xs text-slate-400 mb-1">Speed</div>
              <div className="text-xl font-bold font-mono text-white">
                {latestTrend.rpm.toFixed(0)} RPM
              </div>
              <div className="text-[10px] text-slate-500 mt-1">Nominal: ~1500 RPM</div>
            </div>
          </div>
        </div>
      )}

      {/* Degradation Time Series Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Thermal & Vibration Degradation */}
        <div className="panel-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-white">Thermal & Mechanical Wear Timeline</h3>
              <p className="text-xs text-slate-400">Temperature (°C) & Vibration (mm/s) progression</p>
            </div>
            <span className="text-xs font-mono text-slate-500">{chartData.length} observations</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                <YAxis yAxisId="left" stroke="#10b981" fontSize={11} />
                <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#f8fafc',
                  }}
                />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="temperature"
                  name="Temperature (°C)"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="vibration"
                  name="Vibration (mm/s)"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Electrical & Pressure Trend */}
        <div className="panel-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-white">Electrical & Hydraulic Profile</h3>
              <p className="text-xs text-slate-400">Current (A), Pressure (bar), and Voltage (V)</p>
            </div>
            <span className="text-xs font-mono text-slate-500">{chartData.length} observations</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#38bdf8" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#f8fafc',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="current"
                  name="Current (A)"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="pressure"
                  name="Pressure (bar)"
                  stroke="#a855f7"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Machine Diagnostic Audit History */}
      <div className="panel-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-white">Recent Machine Diagnostics</h3>
          <button
            onClick={() => navigate(`/history?machine_id=${machine.machine_id}`)}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-medium"
          >
            View Complete Audit Log
          </button>
        </div>

        {history.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-6">No historical prediction logs recorded for this machine.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Overall Status</th>
                  <th className="py-3 px-4">ML Layer</th>
                  <th className="py-3 px-4">Rule Layer</th>
                  <th className="py-3 px-4">Anomaly Layer</th>
                  <th className="py-3 px-4">Explanation & Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {history.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono text-slate-400 whitespace-nowrap">
                      {new Date(item.created_at).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <HealthBadge status={item.overall_status} size="sm" />
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-300">
                      {item.ml_prediction} ({(item.ml_confidence * 100).toFixed(0)}%)
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {item.rule_prediction}
                    </td>
                    <td className="py-3 px-4">
                      <span className={item.anomaly_prediction === 'Anomaly' ? 'text-purple-400 font-medium' : 'text-slate-400'}>
                        {item.anomaly_prediction}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300 max-w-xs truncate" title={item.explanation}>
                      {item.explanation}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
