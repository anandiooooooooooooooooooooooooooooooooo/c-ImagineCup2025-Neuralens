import React, { useState, useEffect } from 'react';
import { RefreshCw, Search, Filter } from 'lucide-react';
import { useApp } from '../i18n/AppContext';
import DeviceCard from '../components/DeviceCard';
import { devicesApi } from '../services/api';
import type { IoTDevice } from '../types';
import './DevicesPage.css';

const DevicesPage: React.FC = () => {
  const { t } = useApp();
  const [devices, setDevices] = useState<IoTDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const data = await devicesApi.getAll();
      
      // Always ensure local device exists for the user
      let webcamDeviceStr = localStorage.getItem('webcamDevice');
      
      if (!webcamDeviceStr) {
        // Initialize default local device
        const defaultDevice = {
          id: 'webcam-local-001',
          name: 'This Laptop (Local)',
          deviceType: 'Browser WebRTC',
          status: 'offline', // Default offline until camera starts
          lastSeen: new Date().toISOString(),
          location: 'Local Machine',
          metrics: {
            cpuUsage: 0,
            memoryUsage: 0,
            temperature: 0,
            framesProcessed: 0,
            inferenceLatency: 0,
            accuracy: 0
          }
        };
        webcamDeviceStr = JSON.stringify(defaultDevice);
        localStorage.setItem('webcamDevice', webcamDeviceStr);
      }

      const webcamData = JSON.parse(webcamDeviceStr);
      
      // Update status based on active flag from LiveCamera
      const webcamActive = localStorage.getItem('webcamActive') === 'true';
      webcamData.status = webcamActive ? 'online' : 'offline';
      
      // Merge unique devices
      const allDevices = [webcamData, ...data.filter(d => d.id !== webcamData.id)];
      
      setDevices(allDevices);
    } catch (error) {
      console.error('Failed to fetch devices:', error);
      
      // Fallback to local device
      const webcamDeviceStr = localStorage.getItem('webcamDevice');
      if (webcamDeviceStr) {
        const webcamData = JSON.parse(webcamDeviceStr);
        const webcamActive = localStorage.getItem('webcamActive') === 'true';
        webcamData.status = webcamActive ? 'online' : 'offline';
        setDevices([webcamData]);
      } else {
        setDevices([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
    
    // Poll every 3 seconds to update webcam device status
    const interval = setInterval(() => {
      fetchDevices();
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  const filteredDevices = devices.filter(device => {
    const matchesSearch = device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         device.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || device.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const onlineCount = devices.filter(d => d.status === 'online').length;
  const offlineCount = devices.filter(d => d.status !== 'online').length;

  return (
    <div className="devices-page">
      <div className="page-header">
        <div className="header-content">
          <h1>{t('edgeDevices')}</h1>
          <p className="header-subtitle">{t('manageAndMonitorDevices')}</p>
        </div>
        <button className="btn btn-primary" onClick={fetchDevices}>
          <RefreshCw size={16} />
          {t('refresh')}
        </button>
      </div>

      <div className="devices-summary">
        <div className="summary-card">
          <span className="summary-value">{devices.length}</span>
          <span className="summary-label">{t('totalDevices')}</span>
        </div>
        <div className="summary-card online">
          <span className="summary-value">{onlineCount}</span>
          <span className="summary-label">{t('online')}</span>
        </div>
        <div className="summary-card offline">
          <span className="summary-value">{offlineCount}</span>
          <span className="summary-label">{t('offline')}</span>
        </div>
      </div>

      <div className="devices-filters">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder={t('searchDevices')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="filter-buttons">
          <Filter size={18} />
          <button 
            className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            {t('all')}
          </button>
          <button 
            className={`filter-btn ${statusFilter === 'online' ? 'active' : ''}`}
            onClick={() => setStatusFilter('online')}
          >
            {t('online')}
          </button>
          <button 
            className={`filter-btn ${statusFilter === 'offline' ? 'active' : ''}`}
            onClick={() => setStatusFilter('offline')}
          >
            {t('offline')}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>{t('loadingDevices')}</p>
        </div>
      ) : (
        <div className="devices-grid grid grid-cols-3">
          {filteredDevices.map(device => (
            <DeviceCard key={device.id} device={device} />
          ))}
        </div>
      )}

      {!loading && filteredDevices.length === 0 && (
        <div className="empty-state">
          <p>{t('noDevicesFound')}</p>
        </div>
      )}
    </div>
  );
};


export default DevicesPage;

