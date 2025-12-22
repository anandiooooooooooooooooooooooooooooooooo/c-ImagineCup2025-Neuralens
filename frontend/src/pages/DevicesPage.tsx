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
      
      // Check for local webcam device
      const webcamDevice = localStorage.getItem('webcamDevice');
      const webcamActive = localStorage.getItem('webcamActive') === 'true';
      
      let allDevices = [...data];
      
      if (webcamDevice && webcamActive) {
        const webcamData = JSON.parse(webcamDevice);
        // Add webcam device to the list
        allDevices = [webcamData, ...data];
      }
      
      setDevices(allDevices);
    } catch (error) {
      console.error('Failed to fetch devices:', error);
      
      // Even on error, check for webcam device
      const webcamDevice = localStorage.getItem('webcamDevice');
      const webcamActive = localStorage.getItem('webcamActive') === 'true';
      
      if (webcamDevice && webcamActive) {
        const webcamData = JSON.parse(webcamDevice);
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


export default DevicesPage;

