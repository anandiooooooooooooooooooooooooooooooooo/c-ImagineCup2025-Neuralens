import React, { useRef, useEffect, useState } from 'react';
import { Camera, StopCircle, PlayCircle, AlertCircle, Video, Activity } from 'lucide-react';
import './LiveCameraPage.css';

import type { DetectionResult, Alert } from '../types';

interface Detection extends DetectionResult {}

import { useApp } from '../i18n/AppContext';

const LiveCameraPage: React.FC = () => {
  const { t } = useApp();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string>('');
  const [detections, setDetections] = useState<Detection[]>([]);
  const [stats, setStats] = useState({
    fps: 0,
    totalDetections: 0,
    currentFaces: 0
  });
  const streamRef = useRef<MediaStream | null>(null);
  const detectionIntervalRef = useRef<any>(null);

  useEffect(() => {
    // Load stored detections on mount
    const storedDetectionsStr = localStorage.getItem('localDetections');
    if (storedDetectionsStr) {
      const stored = JSON.parse(storedDetectionsStr);
      setDetections(stored.slice(0, 10)); // Show last 10
      setStats(prev => ({
        ...prev,
        totalDetections: stored.length
      }));
    }

    return () => {
      stopCamera();
    };
  }, []);

  const registerWebcamDevice = () => {
    // Register webcam as an active IoT device
    const deviceInfo = {
      id: 'webcam-local-001',
      name: 'Local Webcam Device',
      deviceType: 'Browser WebRTC',
      status: 'online',
      lastSeen: new Date().toISOString(),
      location: 'Local Machine - Browser',
      metrics: {
        cpuUsage: 0,
        memoryUsage: 0,
        temperature: 0,
        framesProcessed: 0,
        inferenceLatency: 0,
        accuracy: 0
      }
    };

    // Store in localStorage to be picked up by DevicesPage
    localStorage.setItem('webcamDevice', JSON.stringify(deviceInfo));
    localStorage.setItem('webcamActive', 'true');
    
    // Start updating metrics
    updateDeviceMetrics();
  };

  const unregisterWebcamDevice = () => {
    localStorage.removeItem('webcamDevice');
    localStorage.setItem('webcamActive', 'false');
  };

  const updateDeviceMetrics = () => {
    const updateInterval = setInterval(() => {
      const isActive = localStorage.getItem('webcamActive') === 'true';
      if (!isActive) {
        clearInterval(updateInterval);
        return;
      }

      // Get current stats
      const memoryInfo = (performance as any).memory;
      const cpuUsage = 20 + Math.random() * 30; // Simulate CPU usage 20-50%
      const memoryUsage = memoryInfo 
        ? (memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit) * 100 
        : 30 + Math.random() * 20;

      const deviceInfo = {
        id: 'webcam-local-001',
        name: 'Local Webcam Device',
        deviceType: 'Browser WebRTC',
        status: 'online',
        lastSeen: new Date().toISOString(),
        location: 'Local Machine - Browser',
        metrics: {
          cpuUsage: cpuUsage,
          memoryUsage: memoryUsage,
          temperature: 35 + Math.random() * 10, // 35-45°C
          framesProcessed: stats.totalDetections,
          inferenceLatency: 15 + Math.random() * 10, // 15-25ms
          accuracy: stats.totalDetections > 0 
            ? 85 + Math.random() * 10 
            : 0
        }
      };

      localStorage.setItem('webcamDevice', JSON.stringify(deviceInfo));
    }, 2000); // Update every 2 seconds
  };

  const startCamera = async () => {
    try {
      setError('');
      
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: false
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsStreaming(true);

        // Register as IoT device
        registerWebcamDevice();

        // Start detection simulation
        startDetection();
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Unable to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
    }

    // Unregister IoT device
    unregisterWebcamDevice();

    setIsStreaming(false);
    setDetections([]);
  };

  const startDetection = () => {
    // Simulate detection every 2 seconds
    detectionIntervalRef.current = setInterval(() => {
      // Simulate face detection
      const detectionTypes = [
        'Attention-Focus',
        'Eye-Contact',
        'Facial-Expression',
        'Head-Movement',
        'Hand-Stim',
        'Social-Interaction'
      ];

      const newDetection: Detection = {
        id: `det-${Date.now()}`,
        deviceId: 'webcam-local-001',
        objectType: detectionTypes[Math.floor(Math.random() * detectionTypes.length)],
        confidence: 75 + Math.random() * 20, // 75-95%
        timestamp: new Date().toISOString(),
        boundingBox: {
          x: 150 + Math.random() * 100,
          y: 100 + Math.random() * 100,
          width: 200,
          height: 250
        },
        imageUrl: '/placeholder-detection.jpg' // Placeholder as we don't store real images yet
      };

      setDetections(prev => [newDetection, ...prev.slice(0, 9)]); // Keep last 10
      setStats(prev => ({
        ...prev,
        totalDetections: prev.totalDetections + 1,
        currentFaces: Math.floor(Math.random() * 2) + 1 // 1-2 faces
      }));

      // SAVE TO LOCAL STORAGE for Detections Page
      const storedDetections = JSON.parse(localStorage.getItem('localDetections') || '[]');
      const updatedStoredDetections = [newDetection, ...storedDetections].slice(0, 50); // Keep last 50 globally
      localStorage.setItem('localDetections', JSON.stringify(updatedStoredDetections));

      // SIMULATE ALERTS based on detection
      // 30% chance to generate an alert for demo purposes
      if (Math.random() > 0.7) {
        const severity = newDetection.confidence < 80 ? 'warning' : 'info';
        const newAlert: Alert = {
          id: `alert-${Date.now()}`,
          deviceId: 'webcam-local-001',
          severity: severity,
          title: `Detected ${newDetection.objectType}`,
          message: `Local camera detected ${newDetection.objectType} with ${newDetection.confidence.toFixed(1)}% confidence`,
          timestamp: new Date().toISOString(),
          isRead: false,
          isResolved: false
        };

        const storedAlerts = JSON.parse(localStorage.getItem('localAlerts') || '[]');
        const updatedStoredAlerts = [newAlert, ...storedAlerts].slice(0, 20); // Keep last 20
        localStorage.setItem('localAlerts', JSON.stringify(updatedStoredAlerts));
      }

      // Draw detection on canvas
      drawDetection(newDetection);
    }, 2000);
  };

  const drawDetection = (detection: Detection) => {
    if (!canvasRef.current || !videoRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw bounding box if available
    if (detection.boundingBox) {
      const { x, y, width, height } = detection.boundingBox;
      
      // Draw rectangle
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, width, height);

      // Draw label background
      const label = `${detection.objectType}: ${detection.confidence.toFixed(1)}%`;
      ctx.font = '16px Inter';
      const textWidth = ctx.measureText(label).width;
      
      ctx.fillStyle = 'rgba(16, 185, 129, 0.9)';
      ctx.fillRect(x, y - 30, textWidth + 20, 30);

      // Draw label text
      ctx.fillStyle = '#ffffff';
      ctx.fillText(label, x + 10, y - 10);
    }
  };

  useEffect(() => {
    // Calculate FPS
    let frameCount = 0;
    let lastTime = Date.now();

    const calculateFPS = () => {
      frameCount++;
      const currentTime = Date.now();
      const elapsed = currentTime - lastTime;

      if (elapsed >= 1000) {
        setStats(prev => ({ ...prev, fps: frameCount }));
        frameCount = 0;
        lastTime = currentTime;
      }

      if (isStreaming) {
        requestAnimationFrame(calculateFPS);
      }
    };

    if (isStreaming) {
      calculateFPS();
    }
  }, [isStreaming]);

  return (
    <div className="live-camera-page">
      <div className="page-header">
        <div className="header-content">
          <h1>
            <Video size={28} style={{ display: 'inline', marginRight: '12px' }} />
            {t('liveCameraFeed')}
          </h1>
          <p className="header-subtitle">{t('realtimeBehaviorDetection')}</p>
        </div>
        <div className="header-actions">
          {!isStreaming ? (
              <button className="btn btn-primary" onClick={startCamera}>
                <PlayCircle size={16} />
                {t('startCamera')}
              </button>
          ) : (
            <button className="btn btn-secondary" onClick={stopCamera}>
              <StopCircle size={16} />
              {t('stopCamera')}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <div className="camera-container">
        <div className="video-section">
          <div className="video-wrapper">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="video-feed"
            />
            <canvas
              ref={canvasRef}
              className="detection-overlay"
            />
            
            {!isStreaming && (
              <div className="video-placeholder">
                <Camera size={64} />
                <p>{t('clickStartCamera')}</p>
              </div>
            )}

            {isStreaming && (
              <div className="video-stats">
                <div className="stat-item">
                  <Activity size={16} />
                  <span>{stats.fps} FPS</span>
                </div>
                <div className="stat-item">
                  <Camera size={16} />
                  <span>{stats.currentFaces} Face(s)</span>
                </div>
                <div className="stat-item">
                  <span className="status-dot online"></span>
                  <span>Live</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="detection-panel">
          <div className="panel-header">
            <h3>{t('recentDetections')}</h3>
            <span className="badge">{stats.totalDetections} {t('total')}</span>
          </div>

          <div className="detections-list">
            {detections.length === 0 ? (
              <div className="empty-detections">
                <AlertCircle size={32} />
                <p>{t('noDetectionsYet')}</p>
                <span>{t('detectionsWillAppear')}</span>
              </div>
            ) : (
              detections.map((detection, index) => (
                <div 
                  key={detection.id} 
                  className="detection-item"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="detection-header">
                    <span className="detection-type">{t(detection.objectType as any) || detection.objectType}</span>
                    <span className={`confidence ${detection.confidence >= 90 ? 'high' : detection.confidence >= 80 ? 'medium' : 'low'}`}>
                      {detection.confidence.toFixed(1)}%
                    </span>
                  </div>
                  <div className="detection-time">
                    {new Date(detection.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="info-cards">
        <div className="info-card">
          <div className="info-icon">
            <Camera size={24} />
          </div>
          <div className="info-content">
            <h4>{t('cameraAccess')}</h4>
            <p>{t('cameraAccessDesc')}</p>
          </div>
        </div>
        <div className="info-card">
          <div className="info-icon">
            <Activity size={24} />
          </div>
          <div className="info-content">
            <h4>{t('realtimeDetection')}</h4>
            <p>{t('realtimeDetectionDesc')}</p>
          </div>
        </div>
        <div className="info-card">
          <div className="info-icon">
            <AlertCircle size={24} />
          </div>
          <div className="info-content">
            <h4>{t('privacyNotice')}</h4>
            <p>{t('privacyNoticeDesc')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveCameraPage;
