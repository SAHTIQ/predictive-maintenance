import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HardDrive,
  Search,
  Plus,
  Filter,
  Eye,
  Sparkles,
  History,
  PowerOff,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

import { api } from '../services/api';
import { Machine } from '../types';
import { HealthBadge } from '../components/common/HealthBadge';
import { Modal } from '../components/common/Modal';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';

export const Machines: React.FC = () => {
  const navigate = useNavigate();
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // New Machine Form State
  const [formData, setFormData] = useState({
    machine_id: '',
    name: '',
    type: 'CNC Milling Machine',
    location: 'Plant 1 - Machining Bay A',
    manufacturer: 'Haas Automation',
    model: 'VF-4SS',
    operating_hours: 0,
    description: '',
  });

  const loadMachines = async () => {
    try {
      setLoading(true);
      const res = await api.getMachines({ search });
      setMachines(res.items);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadMachines();
    }, 250);
    return () => clearTimeout(timeout);
  }, [search]);

  const handleCreateMachine = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      await api.createMachine({
        ...formData,
        operating_hours: Number(formData.operating_hours),
      });
      setIsAddModalOpen(false);
      setFormData({
        machine_id: '',
        name: '',
        type: 'CNC Milling Machine',
        location: 'Plant 1 - Machining Bay A',
        manufacturer: 'Haas Automation',
        model: 'VF-4SS',
        operating_hours: 0,
        description: '',
      });
      await loadMachines();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create machine');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeactivate = async (machineId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Are you sure you want to deactivate machine ${machineId}?`)) return;
    try {
      await api.deactivateMachine(machineId);
      await loadMachines();
    } catch (err: any) {
      alert(err.message || 'Failed to deactivate machine');
    }
  };

  const filteredMachines = machines.filter((m) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'active') return m.active;
    if (statusFilter === 'inactive') return !m.active;
    return (m.current_health || 'Healthy').toLowerCase() === statusFilter.toLowerCase();
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Industrial Machine Fleet
          </h1>
          <p className="text-sm text-slate-400">
            Directory of all monitored equipment, operational health classifications, and telemetry specs.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm transition-all shadow-md shadow-emerald-950/50"
        >
          <Plus className="w-4 h-4" />
          <span>Add Machine</span>
        </button>
      </div>

      {/* Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by ID, name, type, location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {['all', 'Healthy', 'Warning', 'Critical', 'inactive'].map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize whitespace-nowrap transition-colors ${
                statusFilter === filter
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Machines Table / Cards */}
      {loading ? (
        <LoadingSkeleton rows={6} height="h-16" />
      ) : filteredMachines.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-slate-900/40 rounded-2xl border border-slate-800">
          <HardDrive className="w-10 h-10 mx-auto text-slate-600 mb-3" />
          <h3 className="text-base font-semibold text-slate-300">No machines matched your filter</h3>
          <p className="text-sm text-slate-500 mt-1">Try refining your search terms or status selection.</p>
        </div>
      ) : (
        <div className="panel-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Machine ID</th>
                  <th className="py-3.5 px-4">Name & Specs</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Operating Hours</th>
                  <th className="py-3.5 px-4">Current Health</th>
                  <th className="py-3.5 px-4">Active State</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredMachines.map((m) => (
                  <tr
                    key={m.id}
                    onClick={() => navigate(`/machines/${m.machine_id}`)}
                    className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-400 text-sm">
                      {m.machine_id}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white group-hover:text-emerald-300 transition-colors">
                        {m.name}
                      </div>
                      <div className="text-slate-400 text-[11px]">
                        {m.type} {m.model ? `· ${m.model}` : ''}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {m.location}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {m.operating_hours.toLocaleString()} hrs
                    </td>
                    <td className="py-3.5 px-4">
                      <HealthBadge status={m.current_health} size="sm" />
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                          m.active
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {m.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/machines/${m.machine_id}`);
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                          title="Inspect Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/predict?machine_id=${m.machine_id}`);
                          }}
                          className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400"
                          title="Run Diagnosis"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/history?machine_id=${m.machine_id}`);
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                          title="View History"
                        >
                          <History className="w-3.5 h-3.5" />
                        </button>
                        {m.active && (
                          <button
                            onClick={(e) => handleDeactivate(m.machine_id, e)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400"
                            title="Deactivate Machine"
                          >
                            <PowerOff className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Machine Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Industrial Machine"
      >
        <form onSubmit={handleCreateMachine} className="space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-500/50 text-rose-200 text-xs">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Machine ID *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. M-051"
                value={formData.machine_id}
                onChange={(e) => setFormData({ ...formData, machine_id: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Machine Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. High Precision CNC Lathe #05"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Machine Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm focus:border-emerald-500 focus:outline-none"
              >
                <option value="CNC Milling Machine">CNC Milling Machine</option>
                <option value="Induction Motor Drive">Induction Motor Drive</option>
                <option value="Hydraulic Pump Unit">Hydraulic Pump Unit</option>
                <option value="Centrifugal Gas Compressor">Centrifugal Gas Compressor</option>
                <option value="6-Axis Articulated Robot">6-Axis Articulated Robot</option>
                <option value="Industrial Extruder">Industrial Extruder</option>
                <option value="Turbine Generator Set">Turbine Generator Set</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Location *
              </label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Manufacturer
              </label>
              <input
                type="text"
                value={formData.manufacturer}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Operating Hours
              </label>
              <input
                type="number"
                value={formData.operating_hours}
                onChange={(e) => setFormData({ ...formData, operating_hours: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm focus:border-emerald-500 focus:outline-none"
              placeholder="Optional maintenance notes and operating context..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-semibold transition-all shadow-md shadow-emerald-950/50 disabled:opacity-50"
            >
              {isSubmitting ? 'Registering...' : 'Register Machine'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
