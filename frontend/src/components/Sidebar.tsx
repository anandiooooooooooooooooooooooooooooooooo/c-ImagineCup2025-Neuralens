import React from 'react';
import { 
  LayoutDashboard, 
  Monitor, 
  ScanSearch, 
  Bell, 
  Settings, 
  Activity,
  Cpu,
  Eye,
  Video
} from 'lucide-react';
import { useApp } from '../i18n/AppContext';
import './Sidebar.css';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  alertCount: number;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, alertCount }) => {
  const { t } = useApp();
  
  const menuItems = [
    { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { id: 'devices', label: t('devices'), icon: Monitor },
    { id: 'detections', label: t('detections'), icon: ScanSearch },
    { id: 'camera', label: t('liveCamera'), icon: Video },
    { id: 'alerts', label: t('alerts'), icon: Bell, badge: alertCount },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="brand">
          <div className="brand-icon">
            <Eye size={28} />
          </div>
          <div className="brand-text">
            <span className="brand-name">NeuraLens</span>
            <span className="brand-subtitle">IoT Vision Analytics</span>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          <span className="nav-section-title">{t('mainMenu')}</span>
          <ul className="nav-list">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                  onClick={() => onTabChange(item.id)}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="nav-badge">{item.badge}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="nav-section">
          <span className="nav-section-title">{t('systemMenu')}</span>
          <ul className="nav-list">
            <li>
              <button className="nav-item" onClick={() => onTabChange('settings')}>
                <Settings size={20} />
                <span>{t('settings')}</span>
              </button>
            </li>
          </ul>
        </div>
      </nav>

      <div className="sidebar-footer">
        <div className="system-status">
          <div className="status-row">
            <Cpu size={16} />
            <span>{t('systemStatus')}</span>
            <span className="status-indicator online"></span>
          </div>
          <div className="status-row">
            <Activity size={16} />
            <span>{t('apiHealth')}</span>
            <span className="status-indicator online"></span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
