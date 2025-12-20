import React, { useState, useEffect, useCallback } from 'react';
import { 
  Monitor, 
  ScanSearch, 
  Bell, 
  Activity, 
  Zap, 
  Target,
  RefreshCw,
  Brain
} from 'lucide-react';
import StatsCard from '../components/StatsCard';
import DeviceCard from '../components/DeviceCard';
import AlertCard from '../components/AlertCard';
import { DetectionTrendChart, DetectionPieChart, RiskTimelineChart, BehavioralBarChart, ActivityHeatmap } from '../components/Charts';
import { dashboardApi, devicesApi, detectionsApi, alertsApi } from '../services/api';
import type { DashboardStats, IoTDevice, DetectionResult, Alert, TimeSeriesData, DetectionSummary } from '../types';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [devices, setDevices] = useState<IoTDevice[]>([]);
  const [recentDetections, setRecentDetections] = useState<DetectionResult[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [trend, setTrend] = useState<TimeSeriesData[]>([]);
  const [summary, setSummary] = useState<DetectionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchData = useCallback(async () => {
    try {
      const [statsData, devicesData, detectionsData, alertsData, trendData, summaryData] = await Promise.all([
        dashboardApi.getStats(),
        devicesApi.getAll(),
        detectionsApi.getAll({ limit: 6 }),
        alertsApi.getAll(true),
        dashboardApi.getTrend(24),
        dashboardApi.getDetectionSummary(),
      ]);

      setStats(statsData);
      setDevices(devicesData);
      setRecentDetections(detectionsData);
      setAlerts(alertsData);
      setTrend(trendData);
      setSummary(summaryData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      // Use mock data for demo
      setStats(getMockStats());
      setDevices(getMockDevices());
      setRecentDetections(getMockDetections());
      setAlerts(getMockAlerts());
      setTrend(getMockTrend());
      setSummary(getMockSummary());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleMarkAlertAsRead = async (alertId: string) => {
    try {
      await alertsApi.markAsRead(alertId);
      setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, isRead: true } : a));
    } catch (error) {
      console.error('Failed to mark alert as read:', error);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Dashboard Monitoring</h1>
          <p className="header-subtitle">Early ADHD/ASD Detection System for Schools & Orphanages</p>
        </div>
        <div className="header-actions">
          <span className="last-updated">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </span>
          <button className="btn btn-secondary" onClick={fetchData}>
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid grid grid-cols-4">
        <StatsCard
          title="Total Devices"
          value={stats?.totalDevices || 0}
          icon={Monitor}
          color="primary"
          change={5}
          changeLabel="vs last week"
        />
        <StatsCard
          title="Online Devices"
          value={stats?.onlineDevices || 0}
          icon={Activity}
          color="success"
          change={2}
          changeLabel="vs yesterday"
        />
        <StatsCard
          title="Total Detections"
          value={stats?.totalDetections?.toLocaleString() || '0'}
          icon={ScanSearch}
          color="primary"
          change={12}
          changeLabel="vs last hour"
        />
        <StatsCard
          title="Active Alerts"
          value={stats?.activeAlerts || 0}
          icon={Bell}
          color={stats?.activeAlerts ? 'danger' : 'success'}
        />
      </div>

      {/* Performance Stats */}
      <div className="stats-grid grid grid-cols-3 mt-md">
        <StatsCard
          title="Avg. Accuracy"
          value={`${stats?.averageAccuracy || 0}%`}
          icon={Target}
          color="success"
        />
        <StatsCard
          title="Avg. Latency"
          value={`${stats?.averageLatency || 0}ms`}
          icon={Zap}
          color="primary"
        />
        <StatsCard
          title="Offline Devices"
          value={stats?.offlineDevices || 0}
          icon={Monitor}
          color={stats?.offlineDevices ? 'warning' : 'success'}
        />
      </div>

      {/* Charts */}
      <div className="charts-section grid grid-cols-2 mt-md">
        <DetectionTrendChart data={trend} />
        <DetectionPieChart data={summary} />
      </div>

      {/* Risk Detection Section */}
      <div className="section mt-md">
        <div className="section-header">
          <h2><Brain size={24} style={{ display: 'inline', marginRight: '8px' }} />Early Risk Detection</h2>
          <span className="section-badge">ADHD/ASD Monitoring for Children</span>
        </div>
        <div className="charts-section grid grid-cols-3 mt-sm">
          <RiskTimelineChart data={stats?.riskScoreTimeline || []} />
          <BehavioralBarChart data={stats?.behavioralIndicators || []} />
          <ActivityHeatmap data={stats?.classroomHeatmap || []} />
        </div>
      </div>

      {/* Devices Section */}
      <div className="section mt-md">
        <div className="section-header">
          <h2>Edge Devices</h2>
          <span className="section-badge">{devices.length} devices</span>
        </div>
        <div className="devices-grid grid grid-cols-3">
          {devices.slice(0, 6).map(device => (
            <DeviceCard key={device.id} device={device} />
          ))}
        </div>
      </div>

      {/* Alerts Section */}
      <div className="section mt-md">
        <div className="section-header">
          <h2>Recent Alerts</h2>
          <span className="section-badge alert">{alerts.filter(a => !a.isRead).length} unread</span>
        </div>
        <div className="alerts-list">
          {alerts.slice(0, 5).map(alert => (
            <AlertCard 
              key={alert.id} 
              alert={alert}
              onMarkAsRead={handleMarkAlertAsRead}
            />
          ))}
          {alerts.length === 0 && (
            <div className="empty-state">
              <Bell size={32} />
              <p>No active alerts</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Mock data functions for demo
function getMockStats(): DashboardStats {
  return {
    totalDevices: 5,
    onlineDevices: 4,
    offlineDevices: 1,
    totalDetections: 28450,
    activeAlerts: 2,
    averageAccuracy: 97.8,
    averageLatency: 24.5,
    recentDetections: [],
    detectionsOverTime: [],
    riskScoreTimeline: [],
    behavioralIndicators: [],
    classroomHeatmap: [],
  };
}

function getMockDevices(): IoTDevice[] {
  return [
    {
      id: 'edge-device-001',
      name: 'Classroom A Camera',
      deviceType: 'Azure IoT Edge',
      status: 'online',
      lastSeen: new Date().toISOString(),
      location: 'Main Building - Classroom A (Grade 1-2)',
      metrics: { cpuUsage: 45.5, memoryUsage: 62.3, temperature: 42.1, framesProcessed: 28450, inferenceLatency: 23.5, accuracy: 97.8 }
    },
    {
      id: 'edge-device-002',
      name: 'Classroom B Camera',
      deviceType: 'Azure IoT Edge',
      status: 'online',
      lastSeen: new Date().toISOString(),
      location: 'Main Building - Classroom B (Grade 3-4)',
      metrics: { cpuUsage: 38.2, memoryUsage: 55.8, temperature: 38.7, framesProcessed: 21340, inferenceLatency: 19.8, accuracy: 98.2 }
    },
    {
      id: 'edge-device-003',
      name: 'Activity Room Monitor',
      deviceType: 'Azure IoT Edge',
      status: 'online',
      lastSeen: new Date().toISOString(),
      location: 'Therapy & Activity Room',
      metrics: { cpuUsage: 78.9, memoryUsage: 71.2, temperature: 48.3, framesProcessed: 45670, inferenceLatency: 31.2, accuracy: 99.1 }
    },
    {
      id: 'edge-device-004',
      name: 'Dormitory Hall Camera',
      deviceType: 'Azure IoT Edge',
      status: 'offline',
      lastSeen: new Date(Date.now() - 7200000).toISOString(),
      location: 'Dormitory Building - Common Area',
      metrics: { cpuUsage: 0, memoryUsage: 0, temperature: 0, framesProcessed: 12890, inferenceLatency: 0, accuracy: 95.6 }
    },
    {
      id: 'edge-device-005',
      name: 'Playground Monitor',
      deviceType: 'Azure IoT Edge',
      status: 'online',
      lastSeen: new Date().toISOString(),
      location: 'Outdoor - Main Playground Area',
      metrics: { cpuUsage: 52.1, memoryUsage: 58.9, temperature: 44.2, framesProcessed: 38920, inferenceLatency: 25.6, accuracy: 97.4 }
    },
  ];
}

function getMockDetections(): DetectionResult[] {
  const types = ['Child-Attention', 'Child-Movement', 'Social-Interaction', 'Hand-Stim', 'Eye-Contact'];
  return Array.from({ length: 6 }, (_, i) => ({
    id: `det-${i}`,
    deviceId: `edge-device-00${(i % 4) + 1}`,
    timestamp: new Date(Date.now() - i * 600000).toISOString(),
    objectType: types[i % types.length],
    confidence: 85 + Math.random() * 15,
    imageUrl: `https://picsum.photos/seed/${i}/640/480`,
  }));
}

function getMockAlerts(): Alert[] {
  return [
    { id: '1', deviceId: 'edge-device-001', severity: 'warning', title: 'High Risk Behavior Detected', message: 'Student showing elevated hyperactivity indicators in Classroom A', timestamp: new Date(Date.now() - 300000).toISOString(), isRead: false, isResolved: false },
    { id: '2', deviceId: 'edge-device-004', severity: 'warning', title: 'Camera Offline', message: 'Dormitory Hall Camera has been offline for 2 hours', timestamp: new Date(Date.now() - 7200000).toISOString(), isRead: false, isResolved: false },
    { id: '3', deviceId: 'edge-device-003', severity: 'info', title: 'Detection Model Updated', message: 'ADHD/ASD detection model updated to v2.3.1', timestamp: new Date(Date.now() - 14400000).toISOString(), isRead: true, isResolved: false },
  ];
}

function getMockTrend(): TimeSeriesData[] {
  return Array.from({ length: 24 }, (_, i) => ({
    timestamp: new Date(Date.now() - (23 - i) * 3600000).toISOString(),
    value: Math.floor(10 + Math.random() * 25),
  }));
}

function getMockSummary(): DetectionSummary[] {
  return [
    { objectType: 'Attention-Deficit', count: 245, averageConfidence: 91.5 },
    { objectType: 'Hyperactivity', count: 198, averageConfidence: 89.2 },
    { objectType: 'Repetitive-Behavior', count: 156, averageConfidence: 93.8 },
    { objectType: 'Social-Withdrawal', count: 134, averageConfidence: 87.1 },
    { objectType: 'Sensory-Sensitivity', count: 89, averageConfidence: 85.4 },
  ];
}

export default Dashboard;
