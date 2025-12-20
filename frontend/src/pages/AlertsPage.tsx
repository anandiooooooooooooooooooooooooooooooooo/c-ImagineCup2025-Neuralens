import React, { useState, useEffect } from 'react';
import { RefreshCw, CheckCheck, Bell, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import AlertCard from '../components/AlertCard';
import { alertsApi } from '../services/api';
import type { Alert } from '../types';
import './AlertsPage.css';

const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const data = await alertsApi.getAll();
      setAlerts(data);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
      setAlerts(getMockAlerts());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleMarkAsRead = async (alertId: string) => {
    try {
      await alertsApi.markAsRead(alertId);
      setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, isRead: true } : a));
    } catch (error) {
      console.error('Failed to mark alert as read:', error);
      // Optimistic update
      setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, isRead: true } : a));
    }
  };

  const handleResolve = async (alertId: string) => {
    try {
      await alertsApi.resolve(alertId);
      setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, isResolved: true, isRead: true } : a));
    } catch (error) {
      console.error('Failed to resolve alert:', error);
      setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, isResolved: true, isRead: true } : a));
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await alertsApi.markAllAsRead();
      setAlerts(prev => prev.map(a => ({ ...a, isRead: true })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      setAlerts(prev => prev.map(a => ({ ...a, isRead: true })));
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesSeverity = severityFilter === 'all' || alert.severity === severityFilter;
    const matchesUnread = !showUnreadOnly || !alert.isRead;
    return matchesSeverity && matchesUnread && !alert.isResolved;
  });

  const criticalCount = alerts.filter(a => a.severity === 'critical' && !a.isResolved).length;
  const warningCount = alerts.filter(a => a.severity === 'warning' && !a.isResolved).length;
  const infoCount = alerts.filter(a => a.severity === 'info' && !a.isResolved).length;
  const unreadCount = alerts.filter(a => !a.isRead && !a.isResolved).length;

  return (
    <div className="alerts-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Alerts</h1>
          <p className="header-subtitle">Monitor and manage system alerts</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={handleMarkAllAsRead}>
            <CheckCheck size={16} />
            Mark All Read
          </button>
          <button className="btn btn-primary" onClick={fetchAlerts}>
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      <div className="alerts-summary">
        <div className="summary-card critical">
          <AlertTriangle size={24} />
          <span className="summary-value">{criticalCount}</span>
          <span className="summary-label">Critical</span>
        </div>
        <div className="summary-card warning">
          <AlertCircle size={24} />
          <span className="summary-value">{warningCount}</span>
          <span className="summary-label">Warning</span>
        </div>
        <div className="summary-card info">
          <Info size={24} />
          <span className="summary-value">{infoCount}</span>
          <span className="summary-label">Info</span>
        </div>
        <div className="summary-card unread">
          <Bell size={24} />
          <span className="summary-value">{unreadCount}</span>
          <span className="summary-label">Unread</span>
        </div>
      </div>

      <div className="alerts-controls">
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${severityFilter === 'all' ? 'active' : ''}`}
            onClick={() => setSeverityFilter('all')}
          >
            All
          </button>
          <button 
            className={`filter-btn critical ${severityFilter === 'critical' ? 'active' : ''}`}
            onClick={() => setSeverityFilter('critical')}
          >
            Critical
          </button>
          <button 
            className={`filter-btn warning ${severityFilter === 'warning' ? 'active' : ''}`}
            onClick={() => setSeverityFilter('warning')}
          >
            Warning
          </button>
          <button 
            className={`filter-btn info ${severityFilter === 'info' ? 'active' : ''}`}
            onClick={() => setSeverityFilter('info')}
          >
            Info
          </button>
        </div>

        <label className="unread-toggle">
          <input 
            type="checkbox"
            checked={showUnreadOnly}
            onChange={(e) => setShowUnreadOnly(e.target.checked)}
          />
          <span>Show unread only</span>
        </label>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading alerts...</p>
        </div>
      ) : (
        <div className="alerts-list">
          {filteredAlerts.map((alert, index) => (
            <div key={alert.id} style={{ animationDelay: `${index * 0.05}s` }} className="animate-slide-in">
              <AlertCard 
                alert={alert}
                onMarkAsRead={handleMarkAsRead}
                onResolve={handleResolve}
              />
            </div>
          ))}
        </div>
      )}

      {!loading && filteredAlerts.length === 0 && (
        <div className="empty-state">
          <Bell size={48} />
          <h3>No alerts</h3>
          <p>All caught up! No alerts match your current filters.</p>
        </div>
      )}
    </div>
  );
};

function getMockAlerts(): Alert[] {
  return [
    { id: '1', deviceId: 'edge-device-001', severity: 'critical', title: 'Safety Violation Detected', message: 'Person detected without safety helmet in restricted zone. Immediate action required.', timestamp: new Date(Date.now() - 300000).toISOString(), isRead: false, isResolved: false },
    { id: '2', deviceId: 'edge-device-004', severity: 'warning', title: 'Device Offline', message: 'Parking Lot Monitor has been offline for 2 hours. Check network connectivity.', timestamp: new Date(Date.now() - 7200000).toISOString(), isRead: false, isResolved: false },
    { id: '3', deviceId: 'edge-device-003', severity: 'warning', title: 'High CPU Usage', message: 'Quality Control Station CPU usage exceeded 75% threshold.', timestamp: new Date(Date.now() - 1800000).toISOString(), isRead: true, isResolved: false },
    { id: '4', deviceId: 'edge-device-002', severity: 'info', title: 'Model Updated', message: 'ONNX model successfully updated to version 2.3.1 on Warehouse Entrance device.', timestamp: new Date(Date.now() - 14400000).toISOString(), isRead: true, isResolved: false },
    { id: '5', deviceId: 'edge-device-005', severity: 'critical', title: 'Unauthorized Access', message: 'Unauthorized person detected in assembly line area after hours.', timestamp: new Date(Date.now() - 600000).toISOString(), isRead: false, isResolved: false },
    { id: '6', deviceId: 'edge-device-001', severity: 'info', title: 'System Maintenance', message: 'Scheduled maintenance completed successfully. All systems operational.', timestamp: new Date(Date.now() - 28800000).toISOString(), isRead: true, isResolved: false },
  ];
}

export default AlertsPage;
