import React, { useState, useEffect, useCallback } from 'react';
import { 
  Monitor, 
  ScanSearch, 
  Bell, 
  Activity, 
  Zap, 
  Target,
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
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

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
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      // Set empty data on error
      setStats(null);
      setDevices([]);
      setRecentDetections([]);
      setAlerts([]);
      setTrend([]);
      setSummary([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [fetchData]);

  // Real-time clock update
  useEffect(() => {
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Update every second
    return () => clearInterval(clockInterval);
  }, []);

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
            {currentTime.toLocaleTimeString()}
          </span>
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


export default Dashboard;
