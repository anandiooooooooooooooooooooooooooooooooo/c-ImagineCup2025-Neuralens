import React, { useState } from 'react';
import { 
  Cloud, 
  Bell, 
  Brain, 
  Users, 
  Settings as SettingsIcon,
  Save,
  AlertCircle,
  CheckCircle,
  Database,
  Lock,
  Globe,
  Moon,
  Sun
} from 'lucide-react';
import './SettingsPage.css';

type TabType = 'azure' | 'notifications' | 'model' | 'system' | 'users';

interface AzureConfig {
  iotHubConnectionString: string;
  blobStorageConnectionString: string;
  cosmosDbConnectionString: string;
  cosmosDbDatabaseName: string;
  cosmosDbContainerName: string;
}

interface NotificationSettings {
  emailEnabled: boolean;
  emailAddress: string;
  smsEnabled: boolean;
  phoneNumber: string;
  alertThreshold: number;
  highRiskBehaviorAlert: boolean;
  deviceOfflineAlert: boolean;
  lowAccuracyAlert: boolean;
}

interface ModelSettings {
  detectionConfidenceThreshold: number;
  autoUpdateModel: boolean;
  modelVersion: string;
  inferenceMode: 'fast' | 'balanced' | 'accurate';
  enableADHDDetection: boolean;
  enableASDDetection: boolean;
}

interface SystemSettings {
  language: string;
  timezone: string;
  theme: 'light' | 'dark' | 'auto';
  dataRetentionDays: number;
  enableAnalytics: boolean;
  autoRefreshInterval: number;
}

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('azure');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  
  const [azureConfig, setAzureConfig] = useState<AzureConfig>({
    iotHubConnectionString: '',
    blobStorageConnectionString: '',
    cosmosDbConnectionString: '',
    cosmosDbDatabaseName: 'neuralens',
    cosmosDbContainerName: 'detections'
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailEnabled: true,
    emailAddress: 'admin@school.edu',
    smsEnabled: false,
    phoneNumber: '',
    alertThreshold: 75,
    highRiskBehaviorAlert: true,
    deviceOfflineAlert: true,
    lowAccuracyAlert: false
  });

  const [modelSettings, setModelSettings] = useState<ModelSettings>({
    detectionConfidenceThreshold: 85,
    autoUpdateModel: false,
    modelVersion: 'v2.3.1',
    inferenceMode: 'balanced',
    enableADHDDetection: true,
    enableASDDetection: true
  });

  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    language: 'en',
    timezone: 'Asia/Jakarta',
    theme: 'dark',
    dataRetentionDays: 90,
    enableAnalytics: true,
    autoRefreshInterval: 30
  });

  const handleSave = async () => {
    setSaveStatus('saving');
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      // Here you would make actual API calls to save settings
      console.log('Saving settings:', {
        azure: azureConfig,
        notifications,
        model: modelSettings,
        system: systemSettings
      });
      
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const renderAzureConfig = () => (
    <div className="settings-section">
      <div className="section-header">
        <Cloud size={24} />
        <div>
          <h2>Azure Configuration</h2>
          <p>Configure your Azure IoT Hub, Blob Storage, and Cosmos DB connections</p>
        </div>
      </div>

      <div className="form-grid">
        <div className="form-group full-width">
          <label>
            <Database size={18} />
            IoT Hub Connection String
          </label>
          <input
            type="password"
            value={azureConfig.iotHubConnectionString}
            onChange={(e) => setAzureConfig({...azureConfig, iotHubConnectionString: e.target.value})}
            placeholder="HostName=your-hub.azure-devices.net;SharedAccessKeyName=..."
          />
          <span className="helper-text">Connection string for Azure IoT Hub</span>
        </div>

        <div className="form-group full-width">
          <label>
            <Database size={18} />
            Blob Storage Connection String
          </label>
          <input
            type="password"
            value={azureConfig.blobStorageConnectionString}
            onChange={(e) => setAzureConfig({...azureConfig, blobStorageConnectionString: e.target.value})}
            placeholder="DefaultEndpointsProtocol=https;AccountName=..."
          />
          <span className="helper-text">Connection string for Azure Blob Storage (video/image storage)</span>
        </div>

        <div className="form-group full-width">
          <label>
            <Database size={18} />
            Cosmos DB Connection String
          </label>
          <input
            type="password"
            value={azureConfig.cosmosDbConnectionString}
            onChange={(e) => setAzureConfig({...azureConfig, cosmosDbConnectionString: e.target.value})}
            placeholder="AccountEndpoint=https://...;AccountKey=..."
          />
          <span className="helper-text">Connection string for Azure Cosmos DB (detection data storage)</span>
        </div>

        <div className="form-group">
          <label>Database Name</label>
          <input
            type="text"
            value={azureConfig.cosmosDbDatabaseName}
            onChange={(e) => setAzureConfig({...azureConfig, cosmosDbDatabaseName: e.target.value})}
          />
        </div>

        <div className="form-group">
          <label>Container Name</label>
          <input
            type="text"
            value={azureConfig.cosmosDbContainerName}
            onChange={(e) => setAzureConfig({...azureConfig, cosmosDbContainerName: e.target.value})}
          />
        </div>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="settings-section">
      <div className="section-header">
        <Bell size={24} />
        <div>
          <h2>Notification Preferences</h2>
          <p>Configure alert thresholds and notification channels</p>
        </div>
      </div>

      <div className="form-grid">
        <div className="form-group full-width">
          <div className="toggle-group">
            <div className="toggle-item">
              <div>
                <label>Email Notifications</label>
                <span className="helper-text">Receive alerts via email</span>
              </div>
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={notifications.emailEnabled}
                  onChange={(e) => setNotifications({...notifications, emailEnabled: e.target.checked})}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        {notifications.emailEnabled && (
          <div className="form-group full-width">
            <label>Email Address</label>
            <input
              type="email"
              value={notifications.emailAddress}
              onChange={(e) => setNotifications({...notifications, emailAddress: e.target.value})}
              placeholder="admin@school.edu"
            />
          </div>
        )}

        <div className="form-group full-width">
          <div className="toggle-group">
            <div className="toggle-item">
              <div>
                <label>SMS Notifications</label>
                <span className="helper-text">Receive critical alerts via SMS</span>
              </div>
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={notifications.smsEnabled}
                  onChange={(e) => setNotifications({...notifications, smsEnabled: e.target.checked})}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        {notifications.smsEnabled && (
          <div className="form-group full-width">
            <label>Phone Number</label>
            <input
              type="tel"
              value={notifications.phoneNumber}
              onChange={(e) => setNotifications({...notifications, phoneNumber: e.target.value})}
              placeholder="+62 812-3456-7890"
            />
          </div>
        )}

        <div className="form-group full-width">
          <label>Alert Threshold (%)</label>
          <div className="slider-container">
            <input
              type="range"
              min="50"
              max="100"
              value={notifications.alertThreshold}
              onChange={(e) => setNotifications({...notifications, alertThreshold: parseInt(e.target.value)})}
            />
            <span className="slider-value">{notifications.alertThreshold}%</span>
          </div>
          <span className="helper-text">Minimum confidence level to trigger alerts</span>
        </div>

        <div className="form-group full-width">
          <label>Alert Types</label>
          <div className="checkbox-group">
            <label className="checkbox-item">
              <input
                type="checkbox"
                checked={notifications.highRiskBehaviorAlert}
                onChange={(e) => setNotifications({...notifications, highRiskBehaviorAlert: e.target.checked})}
              />
              <span>High Risk Behavior Detected</span>
            </label>
            <label className="checkbox-item">
              <input
                type="checkbox"
                checked={notifications.deviceOfflineAlert}
                onChange={(e) => setNotifications({...notifications, deviceOfflineAlert: e.target.checked})}
              />
              <span>Device Offline</span>
            </label>
            <label className="checkbox-item">
              <input
                type="checkbox"
                checked={notifications.lowAccuracyAlert}
                onChange={(e) => setNotifications({...notifications, lowAccuracyAlert: e.target.checked})}
              />
              <span>Low Detection Accuracy</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderModelSettings = () => (
    <div className="settings-section">
      <div className="section-header">
        <Brain size={24} />
        <div>
          <h2>Detection Model Settings</h2>
          <p>Configure AI model behavior and detection parameters</p>
        </div>
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label>Model Version</label>
          <select
            value={modelSettings.modelVersion}
            onChange={(e) => setModelSettings({...modelSettings, modelVersion: e.target.value})}
          >
            <option value="v2.3.1">v2.3.1 (Latest)</option>
            <option value="v2.3.0">v2.3.0</option>
            <option value="v2.2.5">v2.2.5</option>
          </select>
        </div>

        <div className="form-group">
          <label>Inference Mode</label>
          <select
            value={modelSettings.inferenceMode}
            onChange={(e) => setModelSettings({...modelSettings, inferenceMode: e.target.value as any})}
          >
            <option value="fast">Fast (Lower accuracy, faster processing)</option>
            <option value="balanced">Balanced (Recommended)</option>
            <option value="accurate">Accurate (Higher accuracy, slower processing)</option>
          </select>
        </div>

        <div className="form-group full-width">
          <label>Detection Confidence Threshold (%)</label>
          <div className="slider-container">
            <input
              type="range"
              min="60"
              max="99"
              value={modelSettings.detectionConfidenceThreshold}
              onChange={(e) => setModelSettings({...modelSettings, detectionConfidenceThreshold: parseInt(e.target.value)})}
            />
            <span className="slider-value">{modelSettings.detectionConfidenceThreshold}%</span>
          </div>
          <span className="helper-text">Minimum confidence level for valid detections</span>
        </div>

        <div className="form-group full-width">
          <div className="toggle-group">
            <div className="toggle-item">
              <div>
                <label>Auto-Update Model</label>
                <span className="helper-text">Automatically deploy new model versions</span>
              </div>
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={modelSettings.autoUpdateModel}
                  onChange={(e) => setModelSettings({...modelSettings, autoUpdateModel: e.target.checked})}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        <div className="form-group full-width">
          <label>Detection Types</label>
          <div className="checkbox-group">
            <label className="checkbox-item">
              <input
                type="checkbox"
                checked={modelSettings.enableADHDDetection}
                onChange={(e) => setModelSettings({...modelSettings, enableADHDDetection: e.target.checked})}
              />
              <span>ADHD Detection (Attention Deficit/Hyperactivity)</span>
            </label>
            <label className="checkbox-item">
              <input
                type="checkbox"
                checked={modelSettings.enableASDDetection}
                onChange={(e) => setModelSettings({...modelSettings, enableASDDetection: e.target.checked})}
              />
              <span>ASD Detection (Autism Spectrum Disorder)</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSystemSettings = () => (
    <div className="settings-section">
      <div className="section-header">
        <SettingsIcon size={24} />
        <div>
          <h2>System Preferences</h2>
          <p>Configure general system settings and preferences</p>
        </div>
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label>
            <Globe size={18} />
            Language
          </label>
          <select
            value={systemSettings.language}
            onChange={(e) => setSystemSettings({...systemSettings, language: e.target.value})}
          >
            <option value="en">English</option>
            <option value="id">Bahasa Indonesia</option>
          </select>
        </div>

        <div className="form-group">
          <label>Timezone</label>
          <select
            value={systemSettings.timezone}
            onChange={(e) => setSystemSettings({...systemSettings, timezone: e.target.value})}
          >
            <option value="Asia/Jakarta">Asia/Jakarta (WIB)</option>
            <option value="Asia/Makassar">Asia/Makassar (WITA)</option>
            <option value="Asia/Jayapura">Asia/Jayapura (WIT)</option>
            <option value="UTC">UTC</option>
          </select>
        </div>

        <div className="form-group">
          <label>
            {systemSettings.theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
            Theme
          </label>
          <select
            value={systemSettings.theme}
            onChange={(e) => setSystemSettings({...systemSettings, theme: e.target.value as any})}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="auto">Auto (System)</option>
          </select>
        </div>

        <div className="form-group">
          <label>Auto Refresh Interval (seconds)</label>
          <input
            type="number"
            min="10"
            max="300"
            value={systemSettings.autoRefreshInterval}
            onChange={(e) => setSystemSettings({...systemSettings, autoRefreshInterval: parseInt(e.target.value)})}
          />
        </div>

        <div className="form-group">
          <label>Data Retention (days)</label>
          <input
            type="number"
            min="30"
            max="365"
            value={systemSettings.dataRetentionDays}
            onChange={(e) => setSystemSettings({...systemSettings, dataRetentionDays: parseInt(e.target.value)})}
          />
          <span className="helper-text">How long to keep detection records</span>
        </div>

        <div className="form-group full-width">
          <div className="toggle-group">
            <div className="toggle-item">
              <div>
                <label>Enable Analytics</label>
                <span className="helper-text">Collect anonymous usage data to improve the system</span>
              </div>
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={systemSettings.enableAnalytics}
                  onChange={(e) => setSystemSettings({...systemSettings, enableAnalytics: e.target.checked})}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUserManagement = () => (
    <div className="settings-section">
      <div className="section-header">
        <Users size={24} />
        <div>
          <h2>User Management</h2>
          <p>Manage user accounts and access permissions</p>
        </div>
      </div>

      <div className="info-banner">
        <AlertCircle size={20} />
        <div>
          <strong>Coming Soon</strong>
          <p>User management features will be available in the next update. You'll be able to manage user accounts, roles, and permissions.</p>
        </div>
      </div>

      <div className="user-list-placeholder">
        <Lock size={48} />
        <h3>User Management</h3>
        <p>Add and manage users with different access levels</p>
        <button className="btn btn-secondary" disabled>
          <Users size={16} />
          Add New User
        </button>
      </div>
    </div>
  );

  return (
    <div className="settings-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Settings</h1>
          <p className="header-subtitle">Configure system preferences and integrations</p>
        </div>
        <button 
          className={`btn btn-primary ${saveStatus === 'saving' ? 'loading' : ''}`}
          onClick={handleSave}
          disabled={saveStatus === 'saving'}
        >
          <Save size={16} />
          {saveStatus === 'saving' ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {saveStatus === 'success' && (
        <div className="alert alert-success">
          <CheckCircle size={20} />
          <span>Settings saved successfully!</span>
        </div>
      )}

      {saveStatus === 'error' && (
        <div className="alert alert-error">
          <AlertCircle size={20} />
          <span>Failed to save settings. Please try again.</span>
        </div>
      )}

      <div className="settings-tabs">
        <button 
          className={`tab-button ${activeTab === 'azure' ? 'active' : ''}`}
          onClick={() => setActiveTab('azure')}
        >
          <Cloud size={18} />
          Azure Config
        </button>
        <button 
          className={`tab-button ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          <Bell size={18} />
          Notifications
        </button>
        <button 
          className={`tab-button ${activeTab === 'model' ? 'active' : ''}`}
          onClick={() => setActiveTab('model')}
        >
          <Brain size={18} />
          Detection Model
        </button>
        <button 
          className={`tab-button ${activeTab === 'system' ? 'active' : ''}`}
          onClick={() => setActiveTab('system')}
        >
          <SettingsIcon size={18} />
          System
        </button>
        <button 
          className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <Users size={18} />
          Users
        </button>
      </div>

      <div className="settings-content">
        {activeTab === 'azure' && renderAzureConfig()}
        {activeTab === 'notifications' && renderNotifications()}
        {activeTab === 'model' && renderModelSettings()}
        {activeTab === 'system' && renderSystemSettings()}
        {activeTab === 'users' && renderUserManagement()}
      </div>
    </div>
  );
};

export default SettingsPage;
