import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import DevicesPage from './pages/DevicesPage';
import DetectionsPage from './pages/DetectionsPage';
import AlertsPage from './pages/AlertsPage';
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
        setAlertCount(2);
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
      case 'settings':
        return <SettingsPlaceholder />;
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

const SettingsPlaceholder: React.FC = () => (
  <div className="settings-placeholder">
    <h1>Settings</h1>
    <p>Settings page coming soon...</p>
    <div className="settings-grid">
      <div className="settings-card card">
        <h3>Azure Configuration</h3>
        <p>Configure your Azure IoT Hub, Blob Storage, and Cosmos DB connections.</p>
      </div>
      <div className="settings-card card">
        <h3>Notification Preferences</h3>
        <p>Manage alert thresholds and notification settings.</p>
      </div>
      <div className="settings-card card">
        <h3>Model Management</h3>
        <p>Update and deploy AI models to edge devices.</p>
      </div>
      <div className="settings-card card">
        <h3>User Management</h3>
        <p>Manage user access and permissions.</p>
      </div>
    </div>
  </div>
);

export default App;
