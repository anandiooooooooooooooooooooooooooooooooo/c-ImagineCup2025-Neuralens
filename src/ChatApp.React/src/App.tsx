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

// Mock data for demonstration
const mockDashboardData = {
  totalSessions: 24,
  totalStudents: 156,
  highRiskCount: 8,
  mediumRiskCount: 23,
  lowRiskCount: 125,
  averageAttention: 72,
  averageMovement: 45,
};

const mockTimelineData = {
  labels: ['9:00', '9:30', '10:00', '10:30', '11:00', '11:30', '12:00'],
  datasets: [
    {
      label: 'Attention Level',
      data: [65, 72, 68, 75, 70, 78, 74],
      borderColor: 'rgb(37, 99, 235)',
      backgroundColor: 'rgba(37, 99, 235, 0.1)',
      fill: true,
      tension: 0.4,
    },
    {
      label: 'Movement Intensity',
      data: [45, 52, 48, 55, 50, 58, 54],
      borderColor: 'rgb(249, 115, 22)',
      backgroundColor: 'rgba(249, 115, 22, 0.1)',
      fill: true,
      tension: 0.4,
    },
  ],
};

function App() {
  const [activeView, setActiveView] = useState<'dashboard' | 'upload' | 'analytics'>('dashboard');

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
                className={`btn ${activeView === 'upload' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveView('upload')}
              >
                <Upload size={16} />
                Upload Video
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
            {activeView === 'dashboard' && (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
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
                    value={mockDashboardData.totalSessions}
                    icon={<Video size={24} />}
                    gradient="var(--gradient-primary)"
                    trend="+12% from last week"
                  />
                  <StatsCard
                    title="Students Monitored"
                    value={mockDashboardData.totalStudents}
                    icon={<Users size={24} />}
                    gradient="var(--gradient-purple)"
                    trend="+8 new students"
                  />
                  <StatsCard
                    title="High Risk Indicators"
                    value={mockDashboardData.highRiskCount}
                    icon={<AlertTriangle size={24} />}
                    gradient="var(--gradient-danger)"
                    trend="Requires attention"
                  />
                  <StatsCard
                    title="Average Attention"
                    value={`${mockDashboardData.averageAttention}%`}
                    icon={<Eye size={24} />}
                    gradient="var(--gradient-success)"
                    trend="+5% improvement"
                  />
                </motion.div>

                {/* Risk Distribution */}
                <motion.div variants={itemVariants} className="card" style={{ marginBottom: '2rem' }}>
                  <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Risk Level Distribution</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <RiskBar
                      label="Low Risk"
                      count={mockDashboardData.lowRiskCount}
                      total={mockDashboardData.totalStudents}
                      color="var(--success)"
                      icon={<CheckCircle size={16} />}
                    />
                    <RiskBar
                      label="Medium Risk"
                      count={mockDashboardData.mediumRiskCount}
                      total={mockDashboardData.totalStudents}
                      color="var(--warning)"
                      icon={<Activity size={16} />}
                    />
                    <RiskBar
                      label="High Risk"
                      count={mockDashboardData.highRiskCount}
                      total={mockDashboardData.totalStudents}
                      color="var(--danger)"
                      icon={<AlertTriangle size={16} />}
                    />
                  </div>
                </motion.div>

                {/* Timeline Chart */}
                <motion.div variants={itemVariants} className="card">
                  <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>
                    Behavioral Trends - Today
                  </h2>
                  <Line
                    data={mockTimelineData}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          position: 'top' as const,
                          labels: {
                            color: 'var(--dark-text-primary)',
                            font: {
                              family: 'var(--font-sans)',
                            },
                          },
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          max: 100,
                          grid: {
                            color: 'rgba(255, 255, 255, 0.05)',
                          },
                          ticks: {
                            color: 'var(--dark-text-secondary)',
                          },
                        },
                        x: {
                          grid: {
                            color: 'rgba(255, 255, 255, 0.05)',
                          },
                          ticks: {
                            color: 'var(--dark-text-secondary)',
                          },
                        },
                      },
                    }}
                  />
                </motion.div>

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
              </motion.div>
            )}

            {activeView === 'upload' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card"
                style={{ maxWidth: '600px', margin: '0 auto' }}
              >
                <h2>Upload Classroom Video</h2>
                <div
                  style={{
                    border: '2px dashed rgba(255, 255, 255, 0.2)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '3rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all var(--transition-base)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--primary-blue)';
                    e.currentTarget.style.background = 'rgba(37, 99, 235, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <Upload size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                  <p style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>
                    Drop your video here or click to browse
                  </p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--dark-text-muted)' }}>
                    Supported formats: MP4, AVI, MOV (Max 500MB)
                  </p>
                </div>
                <button className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem' }}>
                  <Video size={16} />
                  Start Processing
                </button>
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
  gradient,
  trend,
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  gradient: string;
  trend: string;
}) {
  return (
    <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '100px',
          height: '100px',
          background: gradient,
          opacity: 0.1,
          borderRadius: '50%',
          filter: 'blur(40px)',
        }}
      />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: '0.875rem', color: 'var(--dark-text-muted)', margin: '0 0 0.5rem 0' }}>
            {title}
          </p>
          <h3 style={{ fontSize: '2rem', margin: '0 0 0.5rem 0' }}>{value}</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--dark-text-secondary)', margin: 0 }}>
            {trend}
          </p>
        </div>
        <div
          style={{
            background: gradient,
            padding: '0.75rem',
            borderRadius: 'var(--radius-lg)',
            color: 'white',
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
  const percentage = (count / total) * 100;

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
