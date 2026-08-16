import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  History as HistoryIcon,
  Search,
  Filter,
  Eye,
  Calendar,
  Sparkles,
  ShieldCheck,
  Activity,
  Cpu,
} from 'lucide-react';

import { api } from '../services/api';
import { PredictionHistoryItem, Machine } from '../types';
import { HealthBadge } from '../components/common/HealthBadge';
import { Modal } from '../components/common/Modal';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';

export const History: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialMachineId = searchParams.get('machine_id') || '';

  const [historyItems, setHistoryItems] = useState<PredictionHistoryItem[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [selectedMachine, setSelectedMachine] = useState<string>(initialMachineId);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<PredictionHistoryItem | null>(null);

  useEffect(() => {
    const loadMachines = async () => {
      try {
        const res = await api.getMachines({ limit: 100 });
        setMachines(res.items);
      } catch (err) {
        console.error(err);
      }
    };
    loadMachines();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const res = await api.getAllHistory({
        machine_id: selectedMachine || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter,
        limit: 100,
      });
      setHistoryItems(res.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [selectedMachine, statusFilter]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <HistoryIcon className="w-6 h-6 text-emerald-400" />
            <span>Prediction & Diagnostic Audit History</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Immutable log of all 3-layer diagnostic analyses, telemetry parameters, and maintenance recommendations.
          </p>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Machine Filter Dropdown */}
          <select
            value={selectedMachine}
            onChange={(e) => setSelectedMachine(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-emerald-500 focus:outline-none"
          >
            <option value="">All Monitored Machines (50 Units)</option>
            {machines.map((m) => (
              <option key={m.machine_id} value={m.machine_id}>
                {m.machine_id} — {m.name}
              </option>
            ))}
          </select>

          {selectedMachine && (
            <button
              onClick={() => setSelectedMachine('')}
              className="text-xs text-slate-400 hover:text-white"
            >
              Clear Filter
            </button>
          )}
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {['all', 'Healthy', 'Warning', 'Critical'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                statusFilter === status
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* History Log Table */}
      {loading ? (
        <LoadingSkeleton rows={6} height="h-16" />
      ) : historyItems.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-slate-900/40 rounded-2xl border border-slate-800">
          <HistoryIcon className="w-10 h-10 mx-auto text-slate-600 mb-3" />
          <h3 className="text-base font-semibold text-slate-300">No prediction history found</h3>
          <p className="text-sm text-slate-500 mt-1">Run predictions on the Diagnostic Studio page to generate audit logs.</p>
        </div>
      ) : (
        <div className="panel-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Audit ID</th>
                  <th className="py-3.5 px-4">Machine ID</th>
                  <th className="py-3.5 px-4">Overall Status</th>
                  <th className="py-3.5 px-4">Layer 1 (ML)</th>
                  <th className="py-3.5 px-4">Layer 2 (Rules)</th>
                  <th className="py-3.5 px-4">Layer 3 (Anomaly)</th>
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {historyItems.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4 font-mono text-slate-500">
                      #{item.id}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-emerald-400">
                      {item.machine_id}
                    </td>
                    <td className="py-3.5 px-4">
                      <HealthBadge status={item.overall_status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-300">
                      {item.ml_prediction} ({(item.ml_confidence * 100).toFixed(0)}%)
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {item.rule_prediction}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={item.anomaly_prediction === 'Anomaly' ? 'text-purple-400 font-medium' : 'text-slate-400'}>
                        {item.anomaly_prediction}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono">
                      {new Date(item.created_at).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedItem(item);
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                        title="Inspect Complete Audit Breakdown"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Drill-down Audit Detail Modal */}
      {selectedItem && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedItem(null)}
          title={`Diagnostic Audit Record #${selectedItem.id} — Machine ${selectedItem.machine_id}`}
        >
          <div className="space-y-6">
            {/* Top Status Banner */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                  Overall Health Decision
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xl font-bold text-white font-mono">{selectedItem.overall_status}</span>
                  <HealthBadge status={selectedItem.overall_status} size="sm" />
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Recorded At</span>
                <div className="text-xs font-mono text-slate-300 mt-1">
                  {new Date(selectedItem.created_at).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Input Features Table */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Recorded Telemetry Telemetry Vector
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {Object.entries(selectedItem.input_features || {}).map(([key, val]) => (
                  <div key={key} className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">{key}</div>
                    <div className="text-sm font-bold font-mono text-white mt-0.5">
                      {typeof val === 'number' ? (val % 1 !== 0 ? val.toFixed(2) : val) : String(val)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3-Layer Diagnostic Matrix */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                3-Layer Diagnostic Breakdown
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>L1: Random Forest ML</span>
                    <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="text-sm font-bold text-white">{selectedItem.ml_prediction}</div>
                  <div className="text-[11px] font-mono text-emerald-400">
                    {(selectedItem.ml_confidence * 100).toFixed(1)}% confidence
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>L2: Industrial Rule Engine</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                  </div>
                  <div className="text-sm font-bold text-white">{selectedItem.rule_prediction}</div>
                  <div className="text-[11px] text-slate-400">
                    {(selectedItem.rule_violations || []).length} limit breach(es)
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>L3: Isolation Anomaly</span>
                    <Activity className="w-3.5 h-3.5 text-purple-400" />
                  </div>
                  <div className={`text-sm font-bold ${selectedItem.anomaly_prediction === 'Anomaly' ? 'text-purple-400' : 'text-white'}`}>
                    {selectedItem.anomaly_prediction}
                  </div>
                  <div className="text-[11px] font-mono text-purple-400">
                    Score: {selectedItem.anomaly_score.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            {/* Explanation & Recommendation */}
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <div className="text-xs font-semibold text-slate-300">Root Cause Explanation</div>
                <p className="text-xs text-slate-400 leading-relaxed">{selectedItem.explanation}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-1">
                <div className="text-xs font-semibold text-emerald-400">Recommended Action</div>
                <p className="text-xs text-slate-200 leading-relaxed">{selectedItem.recommended_action}</p>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
