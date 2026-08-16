import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  Activity,
  HardDrive,
  ArrowRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  ZAxis,
} from 'recharts';

import { api } from '../services/api';
import { FleetAnalyticsOverview, DashboardStats, Machine } from '../types';
import { HealthBadge } from '../components/common/HealthBadge';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';

const PIE_COLORS = ['#10b981', '#f59e0b', '#f43f5e', '#64748b'];

export const Analytics: React.FC = () => {
  const navigate = useNavigate();
  const [overview, setOverview] = useState<FleetAnalyticsOverview | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        const [ovRes, stRes, machRes] = await Promise.all([
          api.getFleetAnalytics(),
          api.getDashboardStats(),
          api.getMachines({ limit: 50 }),
        ]);
        setOverview(ovRes);
        setStats(stRes);
        setMachines(machRes.items);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadAnalytics();
  }, []);

  if (loading || !overview || !stats) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton rows={2} height="h-20" />
        <LoadingSkeleton rows={4} height="h-64" />
      </div>
    );
  }

  // Distribution chart data
  const distData = [
    { name: 'Healthy', count: overview.health_distribution.healthy, fill: '#10b981' },
    { name: 'Warning', count: overview.health_distribution.warning, fill: '#f59e0b' },
    { name: 'Critical', count: overview.health_distribution.critical, fill: '#f43f5e' },
    { name: 'Inactive', count: overview.health_distribution.inactive, fill: '#64748b' },
  ];

  // Machine Runtime Hours ranking
  const hoursRanking = [...machines]
    .sort((a, b) => b.operating_hours - a.operating_hours)
    .slice(0, 8)
    .map((m) => ({
      name: m.machine_id,
      hours: Math.round(m.operating_hours),
      status: m.current_health,
    }));

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-emerald-400" />
            <span>Fleet Health Analytics & Degradation Intelligence</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Comparative machine metrics, runtime hour distributions, and predictive degradation trends.
          </p>
        </div>
      </div>

      {/* Analytics KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="panel-card p-5">
          <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
            Overall Fleet Reliability
          </div>
          <div className="text-3xl font-bold font-mono text-emerald-400 mt-2">
            {stats.fleet_health_score}%
          </div>
          <div className="text-xs text-slate-500 mt-1">Weighted availability score</div>
        </div>

        <div className="panel-card p-5">
          <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
            Monitored Datapoints
          </div>
          <div className="text-3xl font-bold font-mono text-sky-400 mt-2">
            {overview.total_sensor_readings.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 mt-1">Stored sensor readings in DB</div>
        </div>

        <div className="panel-card p-5">
          <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
            At-Risk Equipment
          </div>
          <div className="text-3xl font-bold font-mono text-rose-400 mt-2">
            {stats.critical_machines + stats.warning_machines}
          </div>
          <div className="text-xs text-slate-500 mt-1">Units requiring inspection</div>
        </div>

        <div className="panel-card p-5">
          <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
            Anomaly Detection Rate
          </div>
          <div className="text-3xl font-bold font-mono text-purple-400 mt-2">
            {stats.anomalies_detected_today}
          </div>
          <div className="text-xs text-slate-500 mt-1">Outliers isolated today</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fleet Health Category Distribution */}
        <div className="panel-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-white">Machine Health Status Breakdown</h3>
              <p className="text-xs text-slate-400">Total 50 Monitored Units</p>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#f8fafc',
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {distData.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Operating Hours Ranking */}
        <div className="panel-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-white">Top Operating Hours Machines</h3>
              <p className="text-xs text-slate-400">Equipment with highest cumulative wear</p>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hoursRanking} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" stroke="#64748b" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="#10b981" fontSize={11} width={50} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#f8fafc',
                  }}
                />
                <Bar dataKey="hours" fill="#38bdf8" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Fleet Priority Risk Matrix */}
      <div className="panel-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-white">Fleet Priority Risk Ranking</h3>
            <p className="text-xs text-slate-400">Actionable maintenance queue prioritized by severity</p>
          </div>
        </div>

        <div className="space-y-3">
          {overview.top_at_risk_machines.map((mach, idx) => (
            <div
              key={mach.machine_id}
              onClick={() => navigate(`/machines/${mach.machine_id}`)}
              className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold text-slate-500 w-6">
                  #{idx + 1}
                </span>
                <HealthBadge status={mach.status} size="sm" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-white group-hover:text-emerald-400 transition-colors text-sm">
                      {mach.machine_id}
                    </span>
                    <span className="text-xs text-slate-300 font-medium">{mach.machine_name}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{mach.primary_issue}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-400">
                <span>{mach.location}</span>
                <button className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium flex items-center gap-1">
                  <span>Inspect</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
