import axios from 'axios';
import type { IoTDevice, DetectionResult, Alert, DashboardStats, TimeSeriesData, DetectionSummary } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Dashboard API
export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const { data } = await api.get<DashboardStats>('/dashboard/stats');
    return data;
  },
  getTrend: async (hours: number = 24): Promise<TimeSeriesData[]> => {
    const { data } = await api.get<TimeSeriesData[]>(`/dashboard/trend?hours=${hours}`);
    return data;
  },
  getDetectionSummary: async (): Promise<DetectionSummary[]> => {
    const { data } = await api.get<DetectionSummary[]>('/dashboard/detection-summary');
    return data;
  },
};

// Devices API
export const devicesApi = {
  getAll: async (): Promise<IoTDevice[]> => {
    const { data } = await api.get<IoTDevice[]>('/devices');
    return data;
  },
  getById: async (deviceId: string): Promise<IoTDevice> => {
    const { data } = await api.get<IoTDevice>(`/devices/${deviceId}`);
    return data;
  },
  sendCommand: async (deviceId: string, command: string, payload: unknown): Promise<void> => {
    await api.post(`/devices/${deviceId}/command`, { command, payload });
  },
};

// Detections API
export const detectionsApi = {
  getAll: async (params?: { deviceId?: string; limit?: number }): Promise<DetectionResult[]> => {
    const { data } = await api.get<DetectionResult[]>('/detections', { params });
    return data;
  },
  getTrend: async (hours: number = 24): Promise<TimeSeriesData[]> => {
    const { data } = await api.get<TimeSeriesData[]>(`/detections/trend?hours=${hours}`);
    return data;
  },
  getSummary: async (): Promise<DetectionSummary[]> => {
    const { data } = await api.get<DetectionSummary[]>('/detections/summary');
    return data;
  },
};

// Alerts API
export const alertsApi = {
  getAll: async (unreadOnly?: boolean): Promise<Alert[]> => {
    const { data } = await api.get<Alert[]>('/alerts', { params: { unreadOnly } });
    return data;
  },
  getUnreadCount: async (): Promise<{ count: number }> => {
    const { data } = await api.get<{ count: number }>('/alerts/unread/count');
    return data;
  },
  markAsRead: async (alertId: string): Promise<void> => {
    await api.patch(`/alerts/${alertId}/read`);
  },
  resolve: async (alertId: string): Promise<void> => {
    await api.patch(`/alerts/${alertId}/resolve`);
  },
  markAllAsRead: async (): Promise<void> => {
    await api.post('/alerts/read-all');
  },
};

export default api;
