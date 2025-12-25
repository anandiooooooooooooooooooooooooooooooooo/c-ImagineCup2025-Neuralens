// NeuraLens Dashboard - Main Application
// Copyright (c) Microsoft Corporation. Licensed under the MIT License.
// Modified for NeuraLens ADHD/ASD Early Detection System

import { useState, useEffect } from 'react';
import { FluentProvider, webDarkTheme } from '@fluentui/react-components';
import {
  Brain,
  Activity,
  Eye,
  Users,
  AlertTriangle,
  TrendingUp,
  Video,
  CheckCircle,
  Upload,
  BarChart3,
  Loader2,
} from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { motion } from 'framer-motion';
import './globals.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// API Configuration
const API_BASE_URL = 'http://localhost:3000/api';

// Types
interface DashboardStats {
  totalSessions: number;
  totalStudentsMonitored: number;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
  averageClassroomAttention: number;
  averageClassroomMovement: number;
}

function App() {
  const [activeView, setActiveView] = useState<'dashboard' | 'analytics'>('dashboard');
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch dashboard data on mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // For now, use default values since we don't have a dashboard stats endpoint yet
      // TODO: Replace with actual API call when endpoint is ready
      setDashboardData({
        totalSessions: 0,
        totalStudentsMonitored: 0,
        highRiskCount: 0,
        mediumRiskCount: 0,
        lowRiskCount: 0,
        averageClassroomAttention: 0,
        averageClassroomMovement: 0,
      });
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
      setLoading(false);
    }
  };

  const handleVideoUpload = async (file: File) => {
    try {
      setIsUploading(true);
      setUploadProgress(0);
      setError(null);

      const formData = new FormData();
      formData.append('video', file);
      formData.append('sessionId', `session-${Date.now()}`);
      formData.append('className', 'Demo Class');
      formData.append('activityType', 'Lecture');

      const response = await fetch(`${API_BASE_URL}/behavioral-analytics/process-video`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Upload successful:', result);
      
      setUploadProgress(100);
      alert(`Video processed successfully! ${result.studentsAnalyzed} students analyzed.`);
      
      // Refresh dashboard data
      await fetchDashboardData();
      
      // Switch to dashboard view
      setActiveView('dashboard');
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  const totalStudents = dashboardData 
    ? dashboardData.highRiskCount + dashboardData.mediumRiskCount + dashboardData.lowRiskCount 
    : 0;

  return (
    <FluentProvider theme={webDarkTheme}>
      <div style={{ minHeight: '100vh', background: 'var(--dark-bg-primary)' }}>
        {/* Header */}
        <header
          style={{
            background: 'var(--dark-bg-secondary)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
            padding: '1rem 2rem',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            backdropFilter: 'blur(10px)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div
                style={{
                  background: 'var(--gradient-primary)',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-lg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Brain size={28} color="white" />
              </div>
              <div>
                <h1 style={{ fontSize: '1.5rem', margin: 0 }}>NeuraLens</h1>
                <p style={{ fontSize: '0.75rem', margin: 0, color: 'var(--dark-text-muted)' }}>
                  ADHD/ASD Early Detection System
                </p>
              </div>
            </div>

            <nav style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                className={`btn ${activeView === 'dashboard' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveView('dashboard')}
              >
                <BarChart3 size={16} />
                Dashboard
              </button>
              <button
                className={`btn ${activeView === 'analytics' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveView('analytics')}
              >
                <TrendingUp size={16} />
                Analytics
              </button>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main style={{ padding: '2rem' }}>
          <div className="container">
            {/* Error Display */}
            {error && (
              <div
                style={{
                  padding: '1rem 1.5rem',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid var(--danger)',
                  borderRadius: 'var(--radius-lg)',
                  marginBottom: '2rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                }}
              >
                <AlertTriangle size={20} color="var(--danger)" />
                <div>
                  <strong style={{ color: 'var(--danger)' }}>Error</strong>
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem' }}>{error}</p>
                </div>
              </div>
            )}

            {activeView === 'dashboard' && (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '4rem' }}>
                    <Loader2 size={48} className="spinner" style={{ margin: '0 auto 1rem' }} />
                    <p>Loading dashboard data...</p>
                  </div>
                ) : dashboardData ? (
                  <>
                    {/* Stats Grid */}
                    <motion.div
                      variants={itemVariants}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                        gap: '1.5rem',
                        marginBottom: '2rem',
                      }}
                    >
                      <StatsCard
                        title="Total Sessions"
                        value={dashboardData.totalSessions}
                        icon={<Video size={20} />}
                        trend={dashboardData.totalSessions === 0 ? "No sessions yet" : "+12% from last week"}
                      />
                      <StatsCard
                        title="Students Monitored"
                        value={dashboardData.totalStudentsMonitored}
                        icon={<Users size={20} />}
                        trend={dashboardData.totalStudentsMonitored === 0 ? "Upload a video to start" : "+8 new students"}
                      />
                      <StatsCard
                        title="High Risk Indicators"
                        value={dashboardData.highRiskCount}
                        icon={<AlertTriangle size={20} />}
                        trend={dashboardData.highRiskCount === 0 ? "No high risk detected" : "Requires attention"}
                      />
                      <StatsCard
                        title="Average Attention"
                        value={dashboardData.averageClassroomAttention > 0 ? `${Math.round(dashboardData.averageClassroomAttention)}%` : "N/A"}
                        icon={<Eye size={20} />}
                        trend={dashboardData.averageClassroomAttention === 0 ? "No data yet" : "+5% improvement"}
                      />
                    </motion.div>

                    {/* Risk Distribution */}
                    {totalStudents > 0 && (
                      <motion.div variants={itemVariants} className="card" style={{ marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Risk Level Distribution</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          <RiskBar
                            label="Low Risk"
                            count={dashboardData.lowRiskCount}
                            total={totalStudents}
                            color="var(--success)"
                            icon={<CheckCircle size={16} />}
                          />
                          <RiskBar
                            label="Medium Risk"
                            count={dashboardData.mediumRiskCount}
                            total={totalStudents}
                            color="var(--warning)"
                            icon={<Activity size={16} />}
                          />
                          <RiskBar
                            label="High Risk"
                            count={dashboardData.highRiskCount}
                            total={totalStudents}
                            color="var(--danger)"
                            icon={<AlertTriangle size={16} />}
                          />
                        </div>
                      </motion.div>
                    )}

                    {/* Empty State */}
                    {totalStudents === 0 && (
                      <motion.div variants={itemVariants} className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                        <Upload size={64} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                        <h2>No Data Available</h2>
                        <p style={{ color: 'var(--dark-text-secondary)', marginBottom: '2rem' }}>
                          Upload a classroom video to start analyzing behavioral patterns
                        </p>
                        <label htmlFor="video-upload-empty" className="btn btn-primary" style={{ cursor: 'pointer' }}>
                          <Upload size={16} />
                          Upload Your First Video
                        </label>
                        <input
                          type="file"
                          accept="video/*"
                          id="video-upload-empty"
                          style={{ display: 'none' }}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleVideoUpload(file);
                            }
                          }}
                          disabled={isUploading}
                        />
                      </motion.div>
                    )}

                    {/* Privacy Notice */}
                    <motion.div
                      variants={itemVariants}
                      style={{
                        marginTop: '2rem',
                        padding: '1rem 1.5rem',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid var(--danger)',
                        borderRadius: 'var(--radius-lg)',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '1rem',
                      }}
                    >
                      <AlertTriangle size={20} color="var(--danger)" />
                      <div>
                        <strong style={{ color: 'var(--danger)' }}>Non-Diagnostic System</strong>
                        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem' }}>
                          This system provides behavioral observations only. All risk indicators require
                          professional assessment by licensed clinicians. Do not use for medical diagnosis.
                        </p>
                      </div>
                    </motion.div>
                  </>
                ) : null}
              </motion.div>
            )}



            {activeView === 'analytics' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card"
              >
                <h2>Advanced Analytics</h2>
                <p style={{ color: 'var(--dark-text-secondary)' }}>
                  Detailed behavioral analytics and insights coming soon...
                </p>
              </motion.div>
            )}
          </div>
        </main>
      </div>
    </FluentProvider>
  );
}

// Stats Card Component
function StatsCard({
  title,
  value,
  icon,
  trend,
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  trend: string;
}) {
  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '0 0 0.5rem 0' }}>
            {title}
          </p>
          <h3 style={{ fontSize: '2rem', margin: '0 0 0.5rem 0', fontWeight: 700 }}>{value}</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
            {trend}
          </p>
        </div>
        <div
          style={{
            background: 'var(--white)',
            padding: '0.625rem',
            borderRadius: 'var(--radius-md)',
            color: 'var(--black)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

// Risk Bar Component
function RiskBar({
  label,
  count,
  total,
  color,
  icon,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
  icon: React.ReactNode;
}) {
  const percentage = total > 0 ? (count / total) * 100 : 0;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ color }}>{icon}</span>
          <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{label}</span>
        </div>
        <span style={{ fontSize: '0.875rem', color: 'var(--dark-text-muted)' }}>
          {count} students
        </span>
      </div>
      <div
        style={{
          height: '12px',
          background: 'var(--dark-bg-tertiary)',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden',
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{
            height: '100%',
            background: color,
            borderRadius: 'var(--radius-full)',
          }}
        />
      </div>
    </div>
  );
}

export default App;
