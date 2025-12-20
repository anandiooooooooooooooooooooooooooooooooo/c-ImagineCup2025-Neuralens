import React, { useState, useEffect } from 'react';
import { RefreshCw, Search, Filter } from 'lucide-react';
import DeviceCard from '../components/DeviceCard';
import { devicesApi } from '../services/api';
import type { IoTDevice } from '../types';
import './DevicesPage.css';

const DevicesPage: React.FC = () => {
  const [devices, setDevices] = useState<IoTDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const data = await devicesApi.getAll();
      setDevices(data);
    } catch (error) {
      console.error('Failed to fetch devices:', error);
      // Use mock data
      setDevices(getMockDevices());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
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
          <h1>Edge Devices</h1>
          <p className="header-subtitle">Manage and monitor your IoT Edge devices</p>
        </div>
        <button className="btn btn-primary" onClick={fetchDevices}>
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className="devices-summary">
        <div className="summary-card">
          <span className="summary-value">{devices.length}</span>
          <span className="summary-label">Total Devices</span>
        </div>
        <div className="summary-card online">
          <span className="summary-value">{onlineCount}</span>
          <span className="summary-label">Online</span>
        </div>
        <div className="summary-card offline">
          <span className="summary-value">{offlineCount}</span>
          <span className="summary-label">Offline</span>
        </div>
      </div>

      <div className="devices-filters">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search devices..."
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
            All
          </button>
          <button 
            className={`filter-btn ${statusFilter === 'online' ? 'active' : ''}`}
            onClick={() => setStatusFilter('online')}
          >
            Online
          </button>
          <button 
            className={`filter-btn ${statusFilter === 'offline' ? 'active' : ''}`}
            onClick={() => setStatusFilter('offline')}
          >
            Offline
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading devices...</p>
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
          <p>No devices found matching your criteria</p>
        </div>
      )}
    </div>
  );
};

function getMockDevices(): IoTDevice[] {
  return [
    { id: 'edge-device-001', name: 'Factory Floor Camera 1', deviceType: 'Azure IoT Edge', status: 'online', lastSeen: new Date().toISOString(), location: 'Building A - Section 1', metrics: { cpuUsage: 45.5, memoryUsage: 62.3, temperature: 42.1, framesProcessed: 28450, inferenceLatency: 23.5, accuracy: 97.8 } },
    { id: 'edge-device-002', name: 'Warehouse Entrance', deviceType: 'Azure IoT Edge', status: 'online', lastSeen: new Date().toISOString(), location: 'Warehouse - Main Entrance', metrics: { cpuUsage: 38.2, memoryUsage: 55.8, temperature: 38.7, framesProcessed: 21340, inferenceLatency: 19.8, accuracy: 98.2 } },
    { id: 'edge-device-003', name: 'Quality Control Station', deviceType: 'Azure IoT Edge', status: 'online', lastSeen: new Date().toISOString(), location: 'Building B - QC Area', metrics: { cpuUsage: 78.9, memoryUsage: 71.2, temperature: 48.3, framesProcessed: 45670, inferenceLatency: 31.2, accuracy: 99.1 } },
    { id: 'edge-device-004', name: 'Parking Lot Monitor', deviceType: 'Azure IoT Edge', status: 'offline', lastSeen: new Date(Date.now() - 7200000).toISOString(), location: 'Outdoor - Parking Area', metrics: { cpuUsage: 0, memoryUsage: 0, temperature: 0, framesProcessed: 12890, inferenceLatency: 0, accuracy: 95.6 } },
    { id: 'edge-device-005', name: 'Assembly Line Camera', deviceType: 'Azure IoT Edge', status: 'online', lastSeen: new Date().toISOString(), location: 'Building A - Assembly Line', metrics: { cpuUsage: 52.1, memoryUsage: 58.9, temperature: 44.2, framesProcessed: 38920, inferenceLatency: 25.6, accuracy: 97.4 } },
  ];
}

export default DevicesPage;
