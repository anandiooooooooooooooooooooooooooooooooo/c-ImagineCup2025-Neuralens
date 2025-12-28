import React, { useState, useEffect } from 'react';
import { RefreshCw, CheckCheck, Bell, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import AlertCard from '../components/AlertCard';
import { DetectionPieChart } from '../components/Charts';
import { alertsApi } from '../services/api';
import type { Alert } from '../types';
import './AlertsPage.css';

import { useApp } from '../i18n/AppContext';

const AlertsPage: React.FC = () => {
  const { t } = useApp();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const apiAlerts = await alertsApi.getAll();
      
      // Fetch local alerts
      const localAlertsStr = localStorage.getItem('localAlerts');
      let localAlerts: Alert[] = localAlertsStr ? JSON.parse(localAlertsStr) : [];
      
      // Filter out legacy dummy data (User Request: "masih dummy")
      localAlerts = localAlerts.filter(a => !a.id.startsWith('mock-'));

      // Merge: Local first
      let allAlerts = [...localAlerts, ...apiAlerts];


      
      setAlerts(allAlerts);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
      
      // Fallback to local only on error
      const localAlertsStr = localStorage.getItem('localAlerts');
      if (localAlertsStr) {
         setAlerts(JSON.parse(localAlertsStr));
      } else {
         setAlerts([]);
      }
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
          <h1>{t('alerts')}</h1>
          <p className="header-subtitle">{t('monitorAndManageAlerts')}</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={handleMarkAllAsRead}>
            <CheckCheck size={16} />
            {t('markAllRead')}
          </button>
          <button className="btn btn-primary" onClick={fetchAlerts}>
            <RefreshCw size={16} />
            {t('refresh')}
          </button>
        </div>
      </div>

      <div className="alerts-summary">
        <div className="summary-card critical">
          <AlertTriangle size={24} />
          <span className="summary-value">{criticalCount}</span>
          <span className="summary-label">{t('critical')}</span>
        </div>
        <div className="summary-card warning">
          <AlertCircle size={24} />
          <span className="summary-value">{warningCount}</span>
          <span className="summary-label">{t('warning')}</span>
        </div>
        <div className="summary-card info">
          <Info size={24} />
          <span className="summary-value">{infoCount}</span>
          <span className="summary-label">{t('info')}</span>
        </div>
        <div className="summary-card unread">
          <Bell size={24} />
          <span className="summary-value">{unreadCount}</span>
          <span className="summary-label">{t('unread')}</span>
        </div>
      </div>

      <div className="alerts-chart-section" style={{ marginTop: '20px', marginBottom: '20px' }}>
         <DetectionPieChart 
            data={[
              { objectType: t('critical'), count: criticalCount, averageConfidence: 0 },
              { objectType: t('warning'), count: warningCount, averageConfidence: 0 },
              { objectType: t('info'), count: infoCount, averageConfidence: 0 }
            ].filter(d => d.count > 0)} 
            title={t('alertDistribution')} 
         />
      </div>

      <div className="alerts-controls">
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${severityFilter === 'all' ? 'active' : ''}`}
            onClick={() => setSeverityFilter('all')}
          >
            {t('all')}
          </button>
          <button 
            className={`filter-btn critical ${severityFilter === 'critical' ? 'active' : ''}`}
            onClick={() => setSeverityFilter('critical')}
          >
            {t('critical')}
          </button>
          <button 
            className={`filter-btn warning ${severityFilter === 'warning' ? 'active' : ''}`}
            onClick={() => setSeverityFilter('warning')}
          >
            {t('warning')}
          </button>
          <button 
            className={`filter-btn info ${severityFilter === 'info' ? 'active' : ''}`}
            onClick={() => setSeverityFilter('info')}
          >
            {t('info')}
          </button>
        </div>

        <label className="unread-toggle">
          <input 
            type="checkbox"
            checked={showUnreadOnly}
            onChange={(e) => setShowUnreadOnly(e.target.checked)}
          />
          <span>{t('showUnreadOnly')}</span>
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
          <h3>{t('noAlerts')}</h3>
          <p>{t('allCaughtUp')}</p>
        </div>
      )}
    </div>
  );
};


export default AlertsPage;

