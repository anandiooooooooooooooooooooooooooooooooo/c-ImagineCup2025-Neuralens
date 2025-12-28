import React from 'react';
import { Wifi, WifiOff, MapPin, Thermometer, Cpu, HardDrive, Timer, Target } from 'lucide-react';
import type { IoTDevice } from '../types';
import './DeviceCard.css';

interface DeviceCardProps {
  device: IoTDevice;
  onClick?: () => void;
}

import { useApp } from '../i18n/AppContext';

const DeviceCard: React.FC<DeviceCardProps> = ({ device, onClick }) => {
  const { t } = useApp();
  const isOnline = device.status === 'online';
  const isWebcam = device.deviceType === 'Browser WebRTC';

  const getProgressClass = (value: number) => {
    if (value < 50) return 'low';
    if (value < 75) return 'medium';
    return 'high';
  };

  return (
    <div className={`device-card card ${device.status} ${isWebcam ? 'webcam-device' : ''}`} onClick={onClick}>
      <div className="device-header">
        <div className="device-info">
          <h4 className="device-name">
            {device.name === 'This Laptop (Local)' ? t('thisLaptopLocal') : device.name}
            {isWebcam && isOnline && (
              <span className="live-badge">🔴 {t('live') || 'LIVE'}</span>
            )}
          </h4>
          <div className="device-location">
            <MapPin size={12} />
            <span>{device.location === 'Local Machine' ? t('localMachine') : device.location}</span>
          </div>
        </div>
        <div className={`status-badge ${device.status}`}>
          <span className={`status-dot ${device.status}`}></span>
          {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
          <span>{t(device.status as any) || device.status}</span>
        </div>
      </div>

      {device.metrics && isOnline && (
        <div className="device-metrics-grid">
          <div className="metric-box">
            <div className="metric-header">
              <Cpu size={14} />
              <span>{t('cpu')}</span>
            </div>
            <div className="metric-value">{device.metrics.cpuUsage.toFixed(1)}%</div>
            <div className="progress-bar">
              <div 
                className={`progress-fill ${getProgressClass(device.metrics.cpuUsage)}`}
                style={{ width: `${device.metrics.cpuUsage}%` }}
              ></div>
            </div>
          </div>

          <div className="metric-box">
            <div className="metric-header">
              <HardDrive size={14} />
              <span>{t('memory')}</span>
            </div>
            <div className="metric-value">{device.metrics.memoryUsage.toFixed(1)}%</div>
            <div className="progress-bar">
              <div 
                className={`progress-fill ${getProgressClass(device.metrics.memoryUsage)}`}
                style={{ width: `${device.metrics.memoryUsage}%` }}
              ></div>
            </div>
          </div>

          <div className="metric-box">
            <div className="metric-header">
              <Thermometer size={14} />
              <span>{t('temp')}</span>
            </div>
            <div className="metric-value">{device.metrics.temperature.toFixed(1)}°C</div>
          </div>

          <div className="metric-box">
            <div className="metric-header">
              <Timer size={14} />
              <span>{t('latency')}</span>
            </div>
            <div className="metric-value">{device.metrics.inferenceLatency.toFixed(1)}ms</div>
          </div>

          <div className="metric-box">
            <div className="metric-header">
              <Target size={14} />
              <span>{t('accuracy')}</span>
            </div>
            <div className="metric-value accuracy">{device.metrics.accuracy.toFixed(1)}%</div>
          </div>

          <div className="metric-box">
            <div className="metric-header">
              <span>📹</span>
              <span>{t('frames')}</span>
            </div>
            <div className="metric-value">{device.metrics.framesProcessed.toLocaleString()}</div>
          </div>
        </div>
      )}

      {!isOnline && (
        <div className="device-offline-message">
          <WifiOff size={24} />
          <span>{t('deviceCurrentlyOffline')}</span>
          <span className="last-seen">{t('lastSeen')}: {new Date(device.lastSeen).toLocaleString()}</span>
        </div>
      )}
    </div>
  );
};

export default DeviceCard;
