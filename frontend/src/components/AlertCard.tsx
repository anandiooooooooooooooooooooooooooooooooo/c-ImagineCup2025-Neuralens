import React from 'react';
import { AlertTriangle, AlertCircle, Info, Check, X, Clock } from 'lucide-react';
import type { Alert } from '../types';
import { formatDistanceToNow } from 'date-fns';
import './AlertCard.css';

interface AlertCardProps {
  alert: Alert;
  onMarkAsRead?: (alertId: string) => void;
  onResolve?: (alertId: string) => void;
}

const AlertCard: React.FC<AlertCardProps> = ({ alert, onMarkAsRead, onResolve }) => {
  const getSeverityIcon = () => {
    switch (alert.severity) {
      case 'critical':
        return <AlertTriangle size={20} />;
      case 'warning':
        return <AlertCircle size={20} />;
      default:
        return <Info size={20} />;
    }
  };

  const timeAgo = formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true });

  return (
    <div className={`alert-card card alert-${alert.severity} ${alert.isRead ? 'read' : 'unread'}`}>
      <div className="alert-icon-wrapper">
        {getSeverityIcon()}
      </div>
      
      <div className="alert-content">
        <div className="alert-header">
          <h4 className="alert-title">{alert.title}</h4>
          <div className="alert-meta">
            <Clock size={12} />
            <span>{timeAgo}</span>
          </div>
        </div>
        <p className="alert-message">{alert.message}</p>
        <span className="alert-device">Device: {alert.deviceId}</span>
      </div>

      <div className="alert-actions">
        {!alert.isRead && onMarkAsRead && (
          <button 
            className="alert-action-btn"
            onClick={() => onMarkAsRead(alert.id)}
            title="Mark as read"
          >
            <Check size={16} />
          </button>
        )}
        {!alert.isResolved && onResolve && (
          <button 
            className="alert-action-btn resolve"
            onClick={() => onResolve(alert.id)}
            title="Resolve"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default AlertCard;
