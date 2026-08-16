import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HardDrive,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Activity,
  Zap,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

import { api } from '../services/api';
import { DashboardStats, FleetAnalyticsOverview } from '../types';
import { MetricCard } from '../components/common/MetricCard';
import { HealthBadge } from '../components/common/HealthBadge';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';

const HEALTH_COLORS = {
  healthy: '#10b981', // emerald-500
  warning: '#f59e0b', // amber-500
  critical: '#f43f5e', // rose-500
  inactive: '#64748b', // slate-500
};

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [overview, setOverview] = useState<FleetAnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsRes, overviewRes] = await Promise.all([
        api.getDashboardStats(),
        api.getFleetAnalytics(),
      ]);
      setStats(statsRes);
      setOverview(overviewRes);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton rows={2} height="h-24" />
        <LoadingSkeleton rows={4} height="h-36" />
      </div>
    );
  }

  if (error || !stats || !overview) {
    return (
      <div className="p-8 rounded-2xl bg-rose-950/20 border border-rose-500/30 text-center space-y-4">
        <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto" />
        <h3 className="text-lg font-semibold text-rose-200">Unable to load dashboard data</h3>
        <p className="text-sm text-slate-400">{error}</p>
        <button
          onClick={loadData}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  const pieData = [
    { name: 'Healthy', value: stats.healthy_machines, color: HEALTH_COLORS.healthy },
    { name: 'Warning', value: stats.warning_machines, color: HEALTH_COLORS.warning },
    { name: 'Critical', value: stats.critical_machines, color: HEALTH_COLORS.critical },
    { name: 'Inactive', value: stats.inactive_machines, color: HEALTH_COLORS.inactive },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Operational Health Overview
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time machine telemetry, 3-layer predictive diagnostics, and active maintenance alerts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/predict')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-slate-950 font-semibold text-sm shadow-lg shadow-emerald-950/60 hover:from-emerald-500 hover:to-emerald-400 transition-all hover:scale-[1.02]"
          >
            <Sparkles className="w-4 h-4" />
            <span>Run Sensor Diagnosis</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Monitored Fleet"
          value={stats.total_machines}
          subtitle={`${stats.total_machines - stats.inactive_machines} active units`}
          icon={<HardDrive className="w-5 h-5 text-sky-400" />}
        />
        <MetricCard
          title="Healthy Machines"
          value={stats.healthy_machines}
          subtitle={`${Math.round((stats.healthy_machines / (stats.total_machines || 1)) * 100)}% of total`}
          icon={<ShieldCheck className="w-5 h-5 text-emerald-400" />}
          variant="emerald"
        />
        <MetricCard
          title="Warning State"
          value={stats.warning_machines}
          subtitle="Operating limits approaching"
          icon={<AlertTriangle className="w-5 h-5 text-amber-400" />}
          variant="amber"
        />
        <MetricCard
          title="Critical Maintenance"
          value={stats.critical_machines}
          subtitle="Immediate action required"
          icon={<AlertOctagon className="w-5 h-5 text-rose-400" />}
          variant="rose"
        />
      </div>

      {/* Secondary Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 uppercase tracking-wider">Fleet Health Index</div>
            <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
              {stats.fleet_health_score}%
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 uppercase tracking-wider">Anomalies Detected Today</div>
            <div className="text-2xl font-bold font-mono text-purple-400 mt-1">
              {stats.anomalies_detected_today}
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 uppercase tracking-wider">Predictions Run Today</div>
            <div className="text-2xl font-bold font-mono text-sky-400 mt-1">
              {stats.predictions_today}
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-sky-500/10 text-sky-400">
            <Zap className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Charts & At-Risk Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Machine Health Distribution Chart */}
        <div className="panel-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-white">Machine Health Distribution</h3>
            <span className="text-xs text-slate-400 font-mono">50 Machines</span>
          </div>

          <div className="h-56 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#f8fafc',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-800 text-xs">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-400">{item.name}:</span>
                <span className="font-mono font-semibold text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Maintenance Alerts */}
        <div className="panel-card p-6 lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-white">Priority Maintenance Alerts</h3>
              <p className="text-xs text-slate-400">Machines requiring immediate technician inspection</p>
            </div>
            <button
              onClick={() => navigate('/machines')}
              className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {overview.top_at_risk_machines.length === 0 ? (
            <div className="p-8 text-center text-slate-400 bg-slate-950/40 rounded-xl border border-slate-800/60">
              <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm">All operational units are running within healthy baselines.</p>
            </div>
          ) : (
            <div className="space-y-2.5 overflow-y-auto max-h-72 pr-1">
              {overview.top_at_risk_machines.map((alert) => (
                <div
                  key={alert.machine_id}
                  onClick={() => navigate(`/machines/${alert.machine_id}`)}
                  className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80 hover:border-slate-700 transition-all flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <HealthBadge status={alert.status} size="sm" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-sm font-mono group-hover:text-emerald-400 transition-colors">
                          {alert.machine_id}
                        </span>
                        <span className="text-xs text-slate-400">· {alert.machine_name}</span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                        {alert.primary_issue}
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex items-center gap-3">
                    <span className="text-xs text-slate-500 hidden sm:inline-block">
                      {alert.location}
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Predictions Feed Table */}
      <div className="panel-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-white">Recent 3-Layer Diagnostic Logs</h3>
            <p className="text-xs text-slate-400">Latest machine health evaluations stored in PostgreSQL</p>
          </div>
          <button
            onClick={() => navigate('/history')}
            className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium"
          >
            <span>Full History</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Machine ID</th>
                <th className="py-3 px-4">Overall Status</th>
                <th className="py-3 px-4">Layer 1 (ML)</th>
                <th className="py-3 px-4">Layer 2 (Rules)</th>
                <th className="py-3 px-4">Layer 3 (Anomaly)</th>
                <th className="py-3 px-4">Confidence</th>
                <th className="py-3 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {overview.recent_predictions.slice(0, 7).map((pred) => (
                <tr
                  key={pred.id}
                  onClick={() => navigate(`/machines/${pred.machine_id}`)}
                  className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                >
                  <td className="py-3 px-4 font-mono font-medium text-emerald-400">
                    {pred.machine_id}
                  </td>
                  <td className="py-3 px-4">
                    <HealthBadge status={pred.overall_status} size="sm" />
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-300">
                    {pred.ml_prediction}
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    {pred.rule_prediction}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`font-medium ${
                        pred.anomaly_prediction === 'Anomaly'
                          ? 'text-purple-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {pred.anomaly_prediction}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-300">
                    {(pred.ml_confidence * 100).toFixed(1)}%
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    {new Date(pred.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
