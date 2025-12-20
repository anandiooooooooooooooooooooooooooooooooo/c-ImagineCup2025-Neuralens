import React from 'react';
import { Eye, Clock, Target } from 'lucide-react';
import type { DetectionResult } from '../types';
import { formatDistanceToNow } from 'date-fns';
import './DetectionCard.css';

interface DetectionCardProps {
  detection: DetectionResult;
  onClick?: () => void;
}

const DetectionCard: React.FC<DetectionCardProps> = ({ detection, onClick }) => {
  const timeAgo = formatDistanceToNow(new Date(detection.timestamp), { addSuffix: true });

  const getObjectIcon = (type: string) => {
    const icons: Record<string, string> = {
      'Person': '👤',
      'Vehicle': '🚗',
      'Package': '📦',
      'Forklift': '🏗️',
      'Safety Helmet': '⛑️',
      'Safety Vest': '🦺',
      'Face Mask': '😷',
    };
    return icons[type] || '📷';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 95) return 'excellent';
    if (confidence >= 85) return 'good';
    if (confidence >= 70) return 'fair';
    return 'low';
  };

  return (
    <div className="detection-card card" onClick={onClick}>
      <div className="detection-image-wrapper">
        <img 
          src={detection.imageUrl} 
          alt={`Detection: ${detection.objectType}`}
          className="detection-image"
          loading="lazy"
        />
        <div className="detection-overlay">
          <Eye size={20} />
        </div>
        <div className={`confidence-badge ${getConfidenceColor(detection.confidence)}`}>
          <Target size={12} />
          {detection.confidence.toFixed(1)}%
        </div>
      </div>

      <div className="detection-content">
        <div className="detection-type">
          <span className="type-icon">{getObjectIcon(detection.objectType)}</span>
          <span className="type-name">{detection.objectType}</span>
        </div>

        <div className="detection-meta">
          <div className="meta-item">
            <Clock size={12} />
            <span>{timeAgo}</span>
          </div>
          <div className="meta-item">
            <span className="device-badge">{detection.deviceId}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetectionCard;
