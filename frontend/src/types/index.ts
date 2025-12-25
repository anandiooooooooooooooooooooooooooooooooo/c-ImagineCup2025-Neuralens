export interface IoTDevice {
  id: string;
  name: string;
  deviceType: string;
  status: 'online' | 'offline' | 'error';
  lastSeen: string;
  location: string;
  metrics?: DeviceMetrics;
}

export interface DeviceMetrics {
  cpuUsage: number;
  memoryUsage: number;
  temperature: number;
  framesProcessed: number;
  inferenceLatency: number;
  accuracy: number;
}

export interface TelemetryData {
  id: string;
  deviceId: string;
  timestamp: string;
  eventType: string;
  data: Record<string, unknown>;
}

export interface DetectionResult {
  id: string;
  deviceId: string;
  timestamp: string;
  objectType: string;
  confidence: number;
  boundingBox?: BoundingBox;
  imageUrl: string;
  metadata?: Record<string, unknown>;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Alert {
  id: string;
  deviceId: string;
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  isResolved: boolean;
}

export interface DashboardStats {
  totalDevices: number;
  onlineDevices: number;
  offlineDevices: number;
  totalDetections: number;
  activeAlerts: number;
  averageAccuracy: number;
  averageLatency: number;
  recentDetections: DetectionSummary[];
  detectionsOverTime: TimeSeriesData[];
  riskScoreTimeline: RiskScoreTrend[];
  behavioralIndicators: BehavioralIndicator[];
  classroomHeatmap: HeatmapPoint[];
}

export interface DetectionSummary {
  objectType: string;
  count: number;
  averageConfidence: number;
}

export interface TimeSeriesData {
  timestamp: string;
  value: number;
}

export interface RiskScoreTrend {
  timestamp: string;
  attentionScore: number;
  hyperactivityScore: number;
  studentId: string;
}

export interface BehavioralIndicator {
  behavior: string;
  count: number;
  percentage: number;
}

export interface HeatmapPoint {
  x: number;
  y: number;
  activity: number;
  zone: string;
}

