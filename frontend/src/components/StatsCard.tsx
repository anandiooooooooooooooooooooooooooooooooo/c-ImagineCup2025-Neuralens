import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import './StatsCard.css';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  change?: number;
  changeLabel?: string;
  color?: 'primary' | 'success' | 'warning' | 'danger';
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  change,
  changeLabel,
  color = 'primary'
}) => {
  const isPositive = change && change >= 0;

  return (
    <div className={`stats-card card ${color}`}>
      <div className="stats-card-header">
        <div className="stats-card-icon-wrapper">
          <Icon size={24} />
        </div>
        <span className="stats-card-title">{title}</span>
      </div>
      
      <div className="stats-card-body">
        <span className="stats-card-value">{value}</span>
        
        {change !== undefined && (
          <div className={`stats-card-change ${isPositive ? 'positive' : 'negative'}`}>
            {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span>{Math.abs(change)}%</span>
            {changeLabel && <span className="change-label">{changeLabel}</span>}
          </div>
        )}
      </div>
      
      <div className="stats-card-glow"></div>
    </div>
  );
};

export default StatsCard;
