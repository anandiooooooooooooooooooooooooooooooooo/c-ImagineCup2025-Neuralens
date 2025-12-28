import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import DevicesPage from './pages/DevicesPage';
import DetectionsPage from './pages/DetectionsPage';
import AlertsPage from './pages/AlertsPage';
import SettingsPage from './pages/SettingsPage';
import LiveCameraPage from './pages/LiveCameraPage';
import { alertsApi } from './services/api';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [alertCount, setAlertCount] = useState(0);

  useEffect(() => {
    const fetchAlertCount = async () => {
      try {
        const result = await alertsApi.getUnreadCount();
        setAlertCount(result.count);
      } catch {
        // Use mock count
        // Use local storage count
        const localAlertsStr = localStorage.getItem('localAlerts');
        if (localAlertsStr) {
          const alerts = JSON.parse(localAlertsStr);
          const unreadCount = alerts.filter((a: any) => !a.isRead).length;
          setAlertCount(unreadCount);
        } else {
          setAlertCount(0);
        }
      }
    };

    fetchAlertCount();
    const interval = setInterval(fetchAlertCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'devices':
        return <DevicesPage />;
      case 'detections':
        return <DetectionsPage />;
      case 'alerts':
        return <AlertsPage />;
      case 'camera':
        return <LiveCameraPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app-layout">
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        alertCount={alertCount}
      />
      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
