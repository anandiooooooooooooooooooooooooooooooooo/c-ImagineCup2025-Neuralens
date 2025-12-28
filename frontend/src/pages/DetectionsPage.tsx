import React, { useState, useEffect } from 'react';
import { RefreshCw, Search, Filter, Grid, List, Trash2 } from 'lucide-react';
import DetectionCard from '../components/DetectionCard';
import { ConfidenceBarChart, DetectionPieChart } from '../components/Charts';
import { detectionsApi } from '../services/api';
import type { DetectionResult, DetectionSummary } from '../types';
import './DetectionsPage.css';

import { useApp } from '../i18n/AppContext';

const DetectionsPage: React.FC = () => {
  const { t } = useApp();
  const [detections, setDetections] = useState<DetectionResult[]>([]);
  const [summary, setSummary] = useState<DetectionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const calculateAndSetSummary = (data: DetectionResult[]) => {
    const typeCounts: Record<string, { count: number; sumConfidence: number }> = {};
    
    data.forEach(d => {
      if (!typeCounts[d.objectType]) {
        typeCounts[d.objectType] = { count: 0, sumConfidence: 0 };
      }
      const conf = typeof d.confidence === 'number' ? d.confidence : 0;
      typeCounts[d.objectType].count += 1;
      typeCounts[d.objectType].sumConfidence += conf;
    });

    const mergedSummary: DetectionSummary[] = Object.entries(typeCounts).map(([type, stats]) => ({
      objectType: type,
      count: stats.count,
      averageConfidence: stats.count > 0 ? stats.sumConfidence / stats.count : 0
    }));

    mergedSummary.sort((a, b) => b.count - a.count);
    setSummary(mergedSummary);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch backend data
      const [apiDetectionsData] = await Promise.all([
        detectionsApi.getAll({ limit: 50 }),
        detectionsApi.getSummary(),
      ]);

      // 2. Fetch local storage data
      const localDetectionsStr = localStorage.getItem('localDetections');
      const localDetections: DetectionResult[] = localDetectionsStr ? JSON.parse(localDetectionsStr) : [];
      
      // 3. Merge data
      let allDetections = [...localDetections, ...apiDetectionsData];

      // MOCK SEEDING IF EMPTY
      if (allDetections.length === 0) {
        const mockDetections: DetectionResult[] = [
          {
            id: 'mock-det-1',
            deviceId: 'webcam-local-001',
            objectType: 'Attention-Focus',
            confidence: 88.5,
            timestamp: new Date().toISOString(),
            imageUrl: '/placeholder-detection.jpg',
            boundingBox: { x: 100, y: 100, width: 150, height: 150 }
          },
          {
            id: 'mock-det-2',
            deviceId: 'cam-02',
            objectType: 'Social-Interaction',
            confidence: 92.0,
            timestamp: new Date(Date.now() - 1800000).toISOString(),
            imageUrl: '/placeholder-detection.jpg',
            boundingBox: { x: 200, y: 150, width: 100, height: 200 }
          },
          {
            id: 'mock-det-3',
            deviceId: 'webcam-local-001',
            objectType: 'Head-Movement',
            confidence: 76.5,
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            imageUrl: '/placeholder-detection.jpg',
            boundingBox: { x: 50, y: 50, width: 120, height: 120 }
          }
        ];
        allDetections = mockDetections;
        localStorage.setItem('localDetections', JSON.stringify(mockDetections));
      }

      setDetections(allDetections);
      calculateAndSetSummary(allDetections);

    } catch (error) {
      console.error('Failed to fetch detections:', error);
      
      const localDetectionsStr = localStorage.getItem('localDetections');
      let localData: DetectionResult[] = [];
      
      if (localDetectionsStr) {
        localData = JSON.parse(localDetectionsStr);
      }
      
      if (localData.length === 0) {
         // Seed mocks in catch fallback
         const mockDetections: DetectionResult[] = [
          {
            id: 'mock-det-1',
            deviceId: 'webcam-local-001',
            objectType: 'Attention-Focus',
            confidence: 88.5,
            timestamp: new Date().toISOString(),
            imageUrl: '/placeholder-detection.jpg',
            boundingBox: { x: 100, y: 100, width: 150, height: 150 }
          },
          {
            id: 'mock-det-2',
            deviceId: 'cam-02',
            objectType: 'Social-Interaction',
            confidence: 92.0,
            timestamp: new Date(Date.now() - 1800000).toISOString(),
            imageUrl: '/placeholder-detection.jpg',
            boundingBox: { x: 200, y: 150, width: 100, height: 200 }
          },
          {
            id: 'mock-det-3',
            deviceId: 'webcam-local-001',
            objectType: 'Head-Movement',
            confidence: 76.5,
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            imageUrl: '/placeholder-detection.jpg',
            boundingBox: { x: 50, y: 50, width: 120, height: 120 }
          }
         ];
         localData = mockDetections;
         localStorage.setItem('localDetections', JSON.stringify(mockDetections));
      }

      setDetections(localData);
      calculateAndSetSummary(localData);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm(t('confirmClearHistory'))) {
      localStorage.removeItem('localDetections');
      localStorage.removeItem('localAlerts');
      fetchData();
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
          <h1>{t('aiDetections')}</h1>
          <p className="header-subtitle">{t('browseDetectedObjects')}</p>
        </div>
        <div className="header-actions" style={{ display: 'flex', gap: '10px' }}>
          <button 
            className="btn" 
            onClick={handleClearHistory}
            style={{ backgroundColor: '#ef4444', color: 'white', border: 'none' }}
          >
            <Trash2 size={16} />
            {t('clearHistory')}
          </button>
          <button className="btn btn-primary" onClick={fetchData}>
            <RefreshCw size={16} />
            {t('refresh')}
          </button>
        </div>
      </div>

      <div className="detections-stats grid grid-cols-1 md:grid-cols-2 gap-6">
        <ConfidenceBarChart data={summary} title={t('detectionConfidenceByType')} />
        <DetectionPieChart data={summary} title={t('detectionSummary')} />
      </div>

      <div className="detections-controls">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder={t('searchDetections')}
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
                {type === 'all' ? t('allTypes') : (t(type as any) || type)}
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
          <p>{t('loadingDevices').replace('devices', 'detections')}</p>
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
          <p>{t('noDevicesFound').replace('devices', 'detections')}</p>
        </div>
      )}
    </div>
  );
};


export default DetectionsPage;

