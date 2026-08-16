import {
  Machine,
  MachineListResponse,
  PredictionResponse,
  PredictionHistoryResponse,
  DashboardStats,
  FleetAnalyticsOverview,
  SensorTrendPoint
} from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const fullUrl = url.startsWith('http') ? url : `${API_BASE}${url}`;
  const response = await fetch(fullUrl, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    let errorDetail = `HTTP ${response.status}: ${response.statusText}`;
    try {
      const errorJson = await response.json();
      if (errorJson.detail) {
        errorDetail = errorJson.detail;
      }
    } catch {
      // ignore
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

export const api = {
  // Health
  checkHealth: () => fetchJSON<{ status: string; version: string }>('/api/health'),

  // Dashboard & Analytics
  getDashboardStats: () => fetchJSON<DashboardStats>('/api/dashboard/stats'),
  getFleetAnalytics: () => fetchJSON<FleetAnalyticsOverview>('/api/analytics/overview'),

  // Machines
  getMachines: (params?: { search?: string; active_only?: boolean; limit?: number; offset?: number }) => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.active_only !== undefined) query.set('active_only', String(params.active_only));
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.offset) query.set('offset', String(params.offset));
    return fetchJSON<MachineListResponse>(`/api/machines?${query.toString()}`);
  },

  getMachine: (machineId: string) => fetchJSON<Machine>(`/api/machines/${machineId}`),

  createMachine: (payload: Partial<Machine>) =>
    fetchJSON<Machine>('/api/machines', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateMachine: (machineId: string, payload: Partial<Machine>) =>
    fetchJSON<Machine>(`/api/machines/${machineId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  deactivateMachine: (machineId: string) =>
    fetchJSON<{ message: string }>(`/api/machines/${machineId}`, {
      method: 'DELETE',
    }),

  getMachineTrend: (machineId: string, limit = 50) =>
    fetchJSON<SensorTrendPoint[]>(`/api/machines/${machineId}/trend?limit=${limit}`),

  // Predictions
  predict: (payload: {
    machine_id: string;
    temperature: number;
    vibration: number;
    pressure: number;
    voltage: number;
    current: number;
    rpm: number;
    operating_hours: number;
  }) =>
    fetchJSON<PredictionResponse>('/api/predict', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getRecentPredictions: (limit = 15) =>
    fetchJSON<any[]>(`/api/predictions/recent?limit=${limit}`),

  getMachineHistory: (machineId: string, params?: { status?: string; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.limit) query.set('limit', String(params.limit));
    return fetchJSON<PredictionHistoryResponse>(`/api/predictions/history/${machineId}?${query.toString()}`);
  },

  getAllHistory: (params?: { machine_id?: string; status?: string; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.machine_id) query.set('machine_id', params.machine_id);
    if (params?.status) query.set('status', params.status);
    if (params?.limit) query.set('limit', String(params.limit));
    return fetchJSON<PredictionHistoryResponse>(`/api/predictions/history?${query.toString()}`);
  },
};
