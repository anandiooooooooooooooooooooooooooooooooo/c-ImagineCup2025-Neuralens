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
import { useApp } from '../i18n/AppContext';
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
  const { language, setLanguage, theme, setTheme, t } = useApp();
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
    language: language,
    timezone: 'Asia/Jakarta',
    theme: theme,
    dataRetentionDays: 90,
    enableAnalytics: true,
    autoRefreshInterval: 30
  });

  // Load settings from localStorage on mount
  React.useEffect(() => {
    const savedAzure = localStorage.getItem('neuralens_azure_config');
    const savedNotifications = localStorage.getItem('neuralens_notifications');
    const savedModel = localStorage.getItem('neuralens_model_settings');
    const savedSystem = localStorage.getItem('neuralens_system_settings');

    if (savedAzure) setAzureConfig(JSON.parse(savedAzure));
    if (savedNotifications) setNotifications(JSON.parse(savedNotifications));
    if (savedModel) setModelSettings(JSON.parse(savedModel));
    if (savedSystem) {
      const parsed = JSON.parse(savedSystem);
      setSystemSettings(parsed);
    }
  }, []);

  const handleSave = async () => {
    setSaveStatus('saving');
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      // Save to localStorage
      localStorage.setItem('neuralens_azure_config', JSON.stringify(azureConfig));
      localStorage.setItem('neuralens_notifications', JSON.stringify(notifications));
      localStorage.setItem('neuralens_model_settings', JSON.stringify(modelSettings));
      localStorage.setItem('neuralens_system_settings', JSON.stringify(systemSettings));

      // Update global context (this will also apply theme)
      setLanguage(systemSettings.language as any);
      setTheme(systemSettings.theme);

      // Here you would make actual API calls to save settings
      console.log('Settings saved:', {
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
          <h2>{t('azureConfiguration')}</h2>
          <p>{t('azureConfigDesc')}</p>
        </div>
      </div>

      <div className="form-grid">
        <div className="form-group full-width">
          <label>
            <Database size={18} />
            {t('iotHubConnectionString')}
          </label>
          <input
            type="password"
            value={azureConfig.iotHubConnectionString}
            onChange={(e) => setAzureConfig({...azureConfig, iotHubConnectionString: e.target.value})}
            placeholder={t('iotHubPlaceholder')}
          />
          <span className="helper-text">{t('iotHubDesc')}</span>
        </div>

        <div className="form-group full-width">
          <label>
            <Database size={18} />
            {t('blobStorageConnectionString')}
          </label>
          <input
            type="password"
            value={azureConfig.blobStorageConnectionString}
            onChange={(e) => setAzureConfig({...azureConfig, blobStorageConnectionString: e.target.value})}
            placeholder={t('blobStoragePlaceholder')}
          />
          <span className="helper-text">{t('blobStorageDesc')}</span>
        </div>

        <div className="form-group full-width">
          <label>
            <Database size={18} />
            {t('cosmosDbConnectionString')}
          </label>
          <input
            type="password"
            value={azureConfig.cosmosDbConnectionString}
            onChange={(e) => setAzureConfig({...azureConfig, cosmosDbConnectionString: e.target.value})}
            placeholder={t('cosmosDbPlaceholder')}
          />
          <span className="helper-text">{t('cosmosDbDesc')}</span>
        </div>

        <div className="form-group">
          <label>{t('databaseName')}</label>
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
          <h2>{t('notificationPreferences')}</h2>
          <p>{t('notificationPrefDesc')}</p>
        </div>
      </div>

      <div className="form-grid">
        <div className="form-group full-width">
          <div className="toggle-group">
            <div className="toggle-item">
              <div>
                <label>{t('emailNotifications')}</label>
                <span className="helper-text">{t('receiveAlertsViaEmail')}</span>
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
            <label>{t('emailAddress')}</label>
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
                <label>{t('smsNotifications')}</label>
                <span className="helper-text">{t('receiveCriticalAlertsSMS')}</span>
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
            <label>{t('phoneNumber')}</label>
            <input
              type="tel"
              value={notifications.phoneNumber}
              onChange={(e) => setNotifications({...notifications, phoneNumber: e.target.value})}
              placeholder="+62 812-3456-7890"
            />
          </div>
        )}

        <div className="form-group full-width">
          <label>{t('alertThreshold')}</label>
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
          <span className="helper-text">{t('minimumConfidenceAlert')}</span>
        </div>

        <div className="form-group full-width">
          <label>{t('alertTypes')}</label>
          <div className="checkbox-group">
            <label className="checkbox-item">
              <input
                type="checkbox"
                checked={notifications.highRiskBehaviorAlert}
                onChange={(e) => setNotifications({...notifications, highRiskBehaviorAlert: e.target.checked})}
              />
              <span>{t('highRiskBehaviorDetected')}</span>
            </label>
            <label className="checkbox-item">
              <input
                type="checkbox"
                checked={notifications.deviceOfflineAlert}
                onChange={(e) => setNotifications({...notifications, deviceOfflineAlert: e.target.checked})}
              />
              <span>{t('deviceOffline')}</span>
            </label>
            <label className="checkbox-item">
              <input
                type="checkbox"
                checked={notifications.lowAccuracyAlert}
                onChange={(e) => setNotifications({...notifications, lowAccuracyAlert: e.target.checked})}
              />
              <span>{t('lowDetectionAccuracy')}</span>
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
          <h2>{t('detectionModelSettings')}</h2>
          <p>{t('modelSettingsDesc')}</p>
        </div>
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label>{t('modelVersion')}</label>
          <select
            value={modelSettings.modelVersion}
            onChange={(e) => setModelSettings({...modelSettings, modelVersion: e.target.value})}
          >
            <option value="v2.3.1">v2.3.1 ({t('latestVersion')})</option>
            <option value="v2.3.0">v2.3.0</option>
            <option value="v2.2.5">v2.2.5</option>
          </select>
        </div>

        <div className="form-group">
          <label>{t('inferenceMode')}</label>
          <select
            value={modelSettings.inferenceMode}
            onChange={(e) => setModelSettings({...modelSettings, inferenceMode: e.target.value as any})}
          >
            <option value="fast">{t('fastInference')}</option>
            <option value="balanced">{t('balancedRecommended')}</option>
            <option value="accurate">{t('accurateInference')}</option>
          </select>
        </div>

        <div className="form-group full-width">
          <label>{t('detectionConfidenceThreshold')}</label>
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
          <span className="helper-text">{t('minimumConfidenceValid')}</span>
        </div>

        <div className="form-group full-width">
          <div className="toggle-group">
            <div className="toggle-item">
              <div>
                <label>{t('autoUpdateModel')}</label>
                <span className="helper-text">{t('autoDeployNewVersions')}</span>
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
          <label>{t('detectionTypes')}</label>
          <div className="checkbox-group">
            <label className="checkbox-item">
              <input
                type="checkbox"
                checked={modelSettings.enableADHDDetection}
                onChange={(e) => setModelSettings({...modelSettings, enableADHDDetection: e.target.checked})}
              />
              <span>{t('adhdDetection')}</span>
            </label>
            <label className="checkbox-item">
              <input
                type="checkbox"
                checked={modelSettings.enableASDDetection}
                onChange={(e) => setModelSettings({...modelSettings, enableASDDetection: e.target.checked})}
              />
              <span>{t('asdDetection')}</span>
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
          <h2>{t('systemPreferences')}</h2>
          <p>{t('systemPrefDesc')}</p>
        </div>
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label>
            <Globe size={18} />
            {t('language')}
          </label>
          <select
            value={systemSettings.language}
            onChange={(e) => setSystemSettings({...systemSettings, language: e.target.value})}
          >
            <option value="en">English</option>
            <option value="id">Bahasa Indonesia</option>
            <option value="zh">中文 (Chinese)</option>
            <option value="es">Español (Spanish)</option>
            <option value="hi">हिन्दी (Hindi)</option>
            <option value="ar">العربية (Arabic)</option>
            <option value="pt">Português (Portuguese)</option>
            <option value="bn">বাংলা (Bengali)</option>
            <option value="ru">Русский (Russian)</option>
            <option value="ja">日本語 (Japanese)</option>
            <option value="de">Deutsch (German)</option>
            <option value="fr">Français (French)</option>
            <option value="ko">한국어 (Korean)</option>
            <option value="vi">Tiếng Việt (Vietnamese)</option>
            <option value="th">ไทย (Thai)</option>
            <option value="tl">Tagalog (Filipino)</option>
          </select>
        </div>

        <div className="form-group">
          <label>{t('timezone')}</label>
          <select
            value={systemSettings.timezone}
            onChange={(e) => setSystemSettings({...systemSettings, timezone: e.target.value})}
          >
            <optgroup label="Asia">
              <option value="Asia/Jakarta">Jakarta (WIB, GMT+7)</option>
              <option value="Asia/Makassar">Makassar (WITA, GMT+8)</option>
              <option value="Asia/Jayapura">Jayapura (WIT, GMT+9)</option>
              <option value="Asia/Singapore">Singapore (GMT+8)</option>
              <option value="Asia/Manila">Manila (GMT+8)</option>
              <option value="Asia/Bangkok">Bangkok (GMT+7)</option>
              <option value="Asia/Tokyo">Tokyo (GMT+9)</option>
              <option value="Asia/Seoul">Seoul (GMT+9)</option>
              <option value="Asia/Shanghai">Shanghai (GMT+8)</option>
              <option value="Asia/Hong_Kong">Hong Kong (GMT+8)</option>
              <option value="Asia/Kolkata">Kolkata (GMT+5:30)</option>
              <option value="Asia/Dubai">Dubai (GMT+4)</option>
            </optgroup>
            <optgroup label="Europe">
              <option value="Europe/London">London (GMT+0)</option>
              <option value="Europe/Paris">Paris (GMT+1)</option>
              <option value="Europe/Berlin">Berlin (GMT+1)</option>
              <option value="Europe/Moscow">Moscow (GMT+3)</option>
            </optgroup>
            <optgroup label="Americas">
              <option value="America/New_York">New York (GMT-5)</option>
              <option value="America/Chicago">Chicago (GMT-6)</option>
              <option value="America/Los_Angeles">Los Angeles (GMT-8)</option>
              <option value="America/Sao_Paulo">São Paulo (GMT-3)</option>
            </optgroup>
            <optgroup label="Pacific">
              <option value="Australia/Sydney">Sydney (GMT+11)</option>
              <option value="Pacific/Auckland">Auckland (GMT+13)</option>
            </optgroup>
            <optgroup label="Other">
              <option value="UTC">UTC (GMT+0)</option>
            </optgroup>
          </select>
        </div>

        <div className="form-group">
          <label>
            {systemSettings.theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
            {t('theme')}
          </label>
          <select
            value={systemSettings.theme}
            onChange={(e) => setSystemSettings({...systemSettings, theme: e.target.value as any})}
          >
            <option value="light">{t('light')}</option>
            <option value="dark">{t('dark')}</option>
            <option value="auto">{t('auto')}</option>
          </select>
        </div>

        <div className="form-group">
          <label>{t('autoRefreshInterval')}</label>
          <input
            type="number"
            min="10"
            max="300"
            value={systemSettings.autoRefreshInterval}
            onChange={(e) => setSystemSettings({...systemSettings, autoRefreshInterval: parseInt(e.target.value)})}
          />
        </div>

        <div className="form-group">
          <label>{t('dataRetention')}</label>
          <input
            type="number"
            min="30"
            max="365"
            value={systemSettings.dataRetentionDays}
            onChange={(e) => setSystemSettings({...systemSettings, dataRetentionDays: parseInt(e.target.value)})}
          />
          <span className="helper-text">{t('dataRetentionDesc')}</span>
        </div>

        <div className="form-group full-width">
          <div className="toggle-group">
            <div className="toggle-item">
              <div>
                <label>{t('enableAnalytics')}</label>
                <span className="helper-text">{t('collectAnonymousData')}</span>
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
          <h2>{t('userManagement')}</h2>
          <p>{t('userManagementDesc')}</p>
        </div>
      </div>

      <div className="info-banner">
        <AlertCircle size={20} />
        <div>
          <strong>{t('comingSoon')}</strong>
          <p>{t('userManagementComingSoon')}</p>
        </div>
      </div>

      <div className="user-list-placeholder">
        <Lock size={48} />
        <h3>{t('userManagement')}</h3>
        <p>{t('addAndManageUsers')}</p>
        <button className="btn btn-secondary" disabled>
          <Users size={16} />
          {t('addNewUser')}
        </button>
      </div>
    </div>
  );

  return (
    <div className="settings-page">
      <div className="page-header">
        <div className="header-content">
          <h1>{t('settings')}</h1>
          <p className="header-subtitle">Configure system preferences and integrations</p>
        </div>
        <button 
          className={`btn btn-primary ${saveStatus === 'saving' ? 'loading' : ''}`}
          onClick={handleSave}
          disabled={saveStatus === 'saving'}
        >
          <Save size={16} />
          {saveStatus === 'saving' ? t('saving') : t('saveChanges')}
        </button>
      </div>

      {saveStatus === 'success' && (
        <div className="alert alert-success">
          <CheckCircle size={20} />
          <span>{t('settingsSaved')}</span>
        </div>
      )}

      {saveStatus === 'error' && (
        <div className="alert alert-error">
          <AlertCircle size={20} />
          <span>{t('settingsSaveFailed')}</span>
        </div>
      )}

      <div className="settings-tabs">
        <button 
          className={`tab-button ${activeTab === 'azure' ? 'active' : ''}`}
          onClick={() => setActiveTab('azure')}
        >
          <Cloud size={18} />
          {t('azureConfiguration')}
        </button>
        <button 
          className={`tab-button ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          <Bell size={18} />
          {t('notificationPreferences')}
        </button>
        <button 
          className={`tab-button ${activeTab === 'model' ? 'active' : ''}`}
          onClick={() => setActiveTab('model')}
        >
          <Brain size={18} />
          {t('detectionModelSettings')}
        </button>
        <button 
          className={`tab-button ${activeTab === 'system' ? 'active' : ''}`}
          onClick={() => setActiveTab('system')}
        >
          <SettingsIcon size={18} />
          {t('systemPreferences')}
        </button>
        <button 
          className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <Users size={18} />
          {t('userManagement')}
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
