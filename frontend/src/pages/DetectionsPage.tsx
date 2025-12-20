import React, { useState, useEffect } from 'react';
import { RefreshCw, Search, Filter, Grid, List } from 'lucide-react';
import DetectionCard from '../components/DetectionCard';
import { ConfidenceBarChart } from '../components/Charts';
import { detectionsApi } from '../services/api';
import type { DetectionResult, DetectionSummary } from '../types';
import './DetectionsPage.css';

const DetectionsPage: React.FC = () => {
  const [detections, setDetections] = useState<DetectionResult[]>([]);
  const [summary, setSummary] = useState<DetectionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [detectionsData, summaryData] = await Promise.all([
        detectionsApi.getAll({ limit: 50 }),
        detectionsApi.getSummary(),
      ]);
      setDetections(detectionsData);
      setSummary(summaryData);
    } catch (error) {
      console.error('Failed to fetch detections:', error);
      setDetections(getMockDetections());
      setSummary(getMockSummary());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const objectTypes = ['all', ...new Set(detections.map(d => d.objectType))];

  const filteredDetections = detections.filter(detection => {
    const matchesSearch = detection.objectType.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         detection.deviceId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || detection.objectType === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="detections-page">
      <div className="page-header">
        <div className="header-content">
          <h1>AI Detections</h1>
          <p className="header-subtitle">Browse detected objects from edge devices</p>
        </div>
        <button className="btn btn-primary" onClick={fetchData}>
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className="detections-stats grid grid-cols-2">
        <ConfidenceBarChart data={summary} title="Detection Confidence by Type" />
        <div className="card stats-summary">
          <h3>Detection Summary</h3>
          <div className="summary-list">
            {summary.map((item, index) => (
              <div key={item.objectType} className="summary-item" style={{ animationDelay: `${index * 0.1}s` }}>
                <span className="summary-type">{item.objectType}</span>
                <div className="summary-bar-container">
                  <div 
                    className="summary-bar"
                    style={{ width: `${(item.count / Math.max(...summary.map(s => s.count))) * 100}%` }}
                  ></div>
                </div>
                <span className="summary-count">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="detections-controls">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search detections..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          <Filter size={18} />
          <select 
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="type-select"
          >
            {objectTypes.map(type => (
              <option key={type} value={type}>
                {type === 'all' ? 'All Types' : type}
              </option>
            ))}
          </select>
        </div>

        <div className="view-toggle">
          <button 
            className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
          >
            <Grid size={18} />
          </button>
          <button 
            className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading detections...</p>
        </div>
      ) : (
        <div className={`detections-grid ${viewMode}`}>
          {filteredDetections.map((detection, index) => (
            <div key={detection.id} style={{ animationDelay: `${index * 0.05}s` }} className="animate-fade-in">
              <DetectionCard detection={detection} />
            </div>
          ))}
        </div>
      )}

      {!loading && filteredDetections.length === 0 && (
        <div className="empty-state">
          <p>No detections found matching your criteria</p>
        </div>
      )}
    </div>
  );
};

function getMockDetections(): DetectionResult[] {
  const types = ['Person', 'Vehicle', 'Package', 'Safety Helmet', 'Forklift', 'Safety Vest', 'Face Mask'];
  const devices = ['edge-device-001', 'edge-device-002', 'edge-device-003', 'edge-device-005'];
  
  return Array.from({ length: 24 }, (_, i) => ({
    id: `det-${i}`,
    deviceId: devices[i % devices.length],
    timestamp: new Date(Date.now() - i * 300000).toISOString(),
    objectType: types[i % types.length],
    confidence: 85 + Math.random() * 15,
    imageUrl: `https://picsum.photos/seed/${i + 100}/640/480`,
  }));
}

function getMockSummary(): DetectionSummary[] {
  return [
    { objectType: 'Person', count: 245, averageConfidence: 96.5 },
    { objectType: 'Vehicle', count: 156, averageConfidence: 94.2 },
    { objectType: 'Package', count: 89, averageConfidence: 92.8 },
    { objectType: 'Safety Helmet', count: 67, averageConfidence: 97.1 },
    { objectType: 'Forklift', count: 45, averageConfidence: 95.4 },
    { objectType: 'Safety Vest', count: 34, averageConfidence: 93.7 },
    { objectType: 'Face Mask', count: 28, averageConfidence: 91.2 },
  ];
}

export default DetectionsPage;
