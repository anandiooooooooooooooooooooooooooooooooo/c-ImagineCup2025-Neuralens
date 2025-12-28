import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  ZAxis,
} from 'recharts';
import type { TimeSeriesData, DetectionSummary, RiskScoreTrend, BehavioralIndicator, HeatmapPoint } from '../types';
import './Charts.css';

import { useApp } from '../i18n/AppContext';

interface DetectionTrendChartProps {
  data: TimeSeriesData[];
  title?: string;
}

export const DetectionTrendChart: React.FC<DetectionTrendChartProps> = ({ data, title = 'Detection Trend' }) => {
  const { t } = useApp();

  const formattedData = data.map(item => ({
    ...item,
    time: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  }));

  return (
    <div className="chart-card card">
      <div className="chart-header">
        <h3 className="chart-title">{title}</h3>
        <span className="chart-subtitle">{t('last24Hours') || 'Last 24 hours'}</span>
      </div>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={formattedData}>
            <defs>
              <linearGradient id="colorDetections" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis 
              dataKey="time" 
              stroke="#64748b" 
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#64748b" 
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip 
              contentStyle={{
                background: 'rgba(26, 26, 36, 0.95)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                borderRadius: '8px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
              }}
              labelStyle={{ color: '#f8fafc' }}
              itemStyle={{ color: '#818cf8' }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#6366f1"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorDetections)"
              name="Detections"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

interface DetectionPieChartProps {
  data: DetectionSummary[];
  title?: string;
}

const COLORS = ['#6366f1', '#22d3ee', '#10b981', '#f59e0b', '#ef4444', '#a855f7', '#ec4899'];

export const DetectionPieChart: React.FC<DetectionPieChartProps> = ({ data, title = 'Detection Types' }) => {
  const { t } = useApp();
  const pieData = data.map(item => ({
    name: t(item.objectType as any) || item.objectType,
    value: item.count,
    confidence: item.averageConfidence,
  }));

  return (
    <div className="chart-card card">
      <div className="chart-header">
        <h3 className="chart-title">{title}</h3>
        <span className="chart-subtitle">{t('distributionByType')}</span>
      </div>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
            >
              {pieData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{
                background: 'rgba(26, 26, 36, 0.95)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                borderRadius: '8px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
              }}
              labelStyle={{ color: '#f8fafc' }}
              formatter={(value: number | undefined, name: any) => [`${value} detections`, name]}
            />
            <Legend 
              verticalAlign="bottom"
              iconType="circle"
              iconSize={8}
              formatter={(value) => <span style={{ color: '#94a3b8', fontSize: '12px' }}>{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

interface ConfidenceBarChartProps {
  data: DetectionSummary[];
  title?: string;
}

export const ConfidenceBarChart: React.FC<ConfidenceBarChartProps> = ({ data, title = 'Detection Confidence' }) => {
  const { t } = useApp();
  const barData = data.map(item => ({
    name: t(item.objectType as any) || item.objectType,
    count: item.count,
    confidence: item.averageConfidence,
  }));

  return (
    <div className="chart-card card">
      <div className="chart-header">
        <h3 className="chart-title">{title}</h3>
        <span className="chart-subtitle">{t('averageConfidenceByType')}</span>
      </div>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={barData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
            <XAxis 
              type="number" 
              domain={[0, 100]}
              stroke="#64748b" 
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              type="category" 
              dataKey="name" 
              stroke="#64748b" 
              fontSize={11}
              tickLine={false}
              axisLine={false}
              width={100}
            />
            <Tooltip 
              contentStyle={{
                background: 'rgba(26, 26, 36, 0.95)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                borderRadius: '8px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
              }}
              labelStyle={{ color: '#f8fafc' }}
              formatter={(value: number | undefined) => [`${value?.toFixed(1)}%`, 'Confidence']}
            />
            <Bar 
              dataKey="confidence" 
              fill="#6366f1"
              radius={[0, 4, 4, 0]}
              background={{ fill: 'rgba(255,255,255,0.05)' }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

interface RiskTimelineChartProps {
  data: RiskScoreTrend[];
  title?: string;
}

export const RiskTimelineChart: React.FC<RiskTimelineChartProps> = ({ data, title }) => {
  const { t } = useApp();
  const chartTitle = title || t('riskScoreTimeline');
  const formattedData = data.map(item => ({
    ...item,
    time: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  }));

  return (
    <div className="chart-card card">
      <div className="chart-header">
        <h3 className="chart-title">{chartTitle}</h3>
        <span className="chart-subtitle">{t('earlyRiskIndicators')}</span>
      </div>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis 
              dataKey="time" 
              stroke="#64748b" 
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#64748b" 
              fontSize={11}
              tickLine={false}
              axisLine={false}
              domain={[0, 100]}
            />
            <Tooltip 
              contentStyle={{
                background: 'rgba(26, 26, 36, 0.95)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                borderRadius: '8px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
              }}
              labelStyle={{ color: '#f8fafc' }}
            />
            <Legend 
              verticalAlign="top"
              iconType="line"
              iconSize={12}
              formatter={(value) => <span style={{ color: '#94a3b8', fontSize: '12px' }}>{value}</span>}
            />
            <Line
              type="monotone"
              dataKey="attentionScore"
              stroke="#ef4444"
              strokeWidth={2}
              dot={false}
              name={t('attentionRisk')}
            />
            <Line
              type="monotone"
              dataKey="hyperactivityScore"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={false}
              name={t('hyperactivityRisk')}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

interface BehavioralBarChartProps {
  data: BehavioralIndicator[];
  title?: string;
}

export const BehavioralBarChart: React.FC<BehavioralBarChartProps> = ({ data, title }) => {
  const { t } = useApp();
  const chartTitle = title || t('behavioralIndicators');
  return (
    <div className="chart-card card">
      <div className="chart-header">
        <h3 className="chart-title">{chartTitle}</h3>
        <span className="chart-subtitle">{t('detectedBehaviorsClassroom')}</span>
      </div>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
            <XAxis 
              type="number" 
              stroke="#64748b" 
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              type="category" 
              dataKey="behavior" 
              stroke="#64748b" 
              fontSize={11}
              tickLine={false}
              axisLine={false}
              width={120}
            />
            <Tooltip 
              contentStyle={{
                background: 'rgba(26, 26, 36, 0.95)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                borderRadius: '8px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
              }}
              labelStyle={{ color: '#f8fafc' }}
              formatter={(value: number | undefined, name: string | undefined) => {
                if (!value) return ['0', name || ''];
                if (name === 'count') return [`${value} ${t('events') || 'events'}`, t('count')];
                return [`${value}%`, t('percentage')];
              }}
            />
            <Bar 
              dataKey="count" 
              fill="#10b981"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

interface ActivityHeatmapProps {
  data: HeatmapPoint[];
  title?: string;
}

export const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({ data, title }) => {
  const { t } = useApp();
  const chartTitle = title || t('classroomActivityHeatmap');
  const getColor = (activity: number) => {
    if (activity < 25) return '#1e40af';
    if (activity < 50) return '#22d3ee';
    if (activity < 75) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="chart-card card">
      <div className="chart-header">
        <h3 className="chart-title">{chartTitle}</h3>
        <span className="chart-subtitle">{t('activityDistributionClassroom')}</span>
      </div>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={280}>
          <ScatterChart
            margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis 
              type="number" 
              dataKey="x" 
              domain={[0, 9]}
              stroke="#64748b" 
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              type="number" 
              dataKey="y" 
              domain={[0, 9]}
              stroke="#64748b" 
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <ZAxis 
              type="number" 
              dataKey="activity" 
              range={[50, 400]} 
            />
            <Tooltip 
              cursor={{ strokeDasharray: '3 3' }}
              contentStyle={{
                background: 'rgba(26, 26, 36, 0.95)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                borderRadius: '8px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
              }}
              labelStyle={{ color: '#f8fafc' }}
              formatter={(value: number | undefined, name: string | undefined) => {
                if (!value) return ['0', name || ''];
                if (name === 'activity') return [`${value}%`, t('activityLevel')];
                return [value || 0, name || ''];
              }}
            />
            <Scatter 
              data={data} 
              fill="#6366f1"
              shape={(props: any) => {
                const { cx, cy, payload } = props;
                const color = getColor(payload.activity);
                return (
                  <circle 
                    cx={cx} 
                    cy={cy} 
                    r={8} 
                    fill={color} 
                    opacity={0.7}
                  />
                );
              }}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
