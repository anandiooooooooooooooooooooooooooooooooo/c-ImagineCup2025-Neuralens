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
import './Sidebar.css';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  alertCount: number;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, alertCount }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'devices', label: 'Devices', icon: Monitor },
    { id: 'detections', label: 'Detections', icon: ScanSearch },
    { id: 'camera', label: 'Live Camera', icon: Video },
    { id: 'alerts', label: 'Alerts', icon: Bell, badge: alertCount },
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
          <span className="nav-section-title">Main Menu</span>
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
          <span className="nav-section-title">System</span>
          <ul className="nav-list">
            <li>
              <button className="nav-item" onClick={() => onTabChange('settings')}>
                <Settings size={20} />
                <span>Settings</span>
              </button>
            </li>
          </ul>
        </div>
      </nav>

      <div className="sidebar-footer">
        <div className="system-status">
          <div className="status-row">
            <Cpu size={16} />
            <span>System Status</span>
            <span className="status-indicator online"></span>
          </div>
          <div className="status-row">
            <Activity size={16} />
            <span>API Health</span>
            <span className="status-indicator online"></span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
