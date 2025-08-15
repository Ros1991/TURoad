import React, { useState, useEffect } from 'react';
import { FiSettings, FiBell, FiLock, FiGlobe, FiDatabase, FiMail, FiSave } from 'react-icons/fi';
import { toast } from 'react-toastify';

interface SystemSettings {
  appName: string;
  emailEnabled: boolean;
  notificationsEnabled: boolean;
  maintenanceMode: boolean;
  maxUsersPerPage: number;
  sessionTimeout: number;
  emailProvider: 'smtp' | 'sendgrid' | 'mailgun';
  smtpHost: string;
  smtpPort: number;
  smtpUsername: string;
  smtpPassword: string;
}

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings>({
    appName: 'TuRoad Admin System',
    emailEnabled: true,
    notificationsEnabled: true,
    maintenanceMode: false,
    maxUsersPerPage: 10,
    sessionTimeout: 3600,
    emailProvider: 'smtp',
    smtpHost: '',
    smtpPort: 587,
    smtpUsername: '',
    smtpPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await settingsService.getSettings();
      // setSettings(response.data);
      toast.info('Settings loaded from local storage');
    } catch (error) {
      toast.error('Failed to load settings');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // await settingsService.updateSettings(settings);
      localStorage.setItem('systemSettings', JSON.stringify(settings));
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (key: keyof SystemSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const tabs = [
    { id: 'general', name: 'General', icon: FiSettings },
    { id: 'email', name: 'Email', icon: FiMail },
    { id: 'notifications', name: 'Notifications', icon: FiBell },
    { id: 'security', name: 'Security', icon: FiLock },
    { id: 'system', name: 'System', icon: FiDatabase }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">System Settings</h1>
        <p className="text-gray-400">Configure system-wide settings and preferences</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-64 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4">
          <nav className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'text-gray-400 hover:bg-gray-700/30 hover:text-white'
                }`}
              >
                <tab.icon size={18} />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white mb-4">General Settings</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Application Name
                </label>
                <input
                  type="text"
                  value={settings.appName}
                  onChange={(e) => handleInputChange('appName', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Max Users Per Page
                </label>
                <select
                  value={settings.maxUsersPerPage}
                  onChange={(e) => handleInputChange('maxUsersPerPage', parseInt(e.target.value))}
                  className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-300">Maintenance Mode</h3>
                  <p className="text-sm text-gray-500">Temporarily disable access to the system</p>
                </div>
                <button
                  onClick={() => handleInputChange('maintenanceMode', !settings.maintenanceMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                    settings.maintenanceMode ? 'bg-blue-600' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      settings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {/* Email Settings */}
          {activeTab === 'email' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white mb-4">Email Configuration</h2>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-300">Email Enabled</h3>
                  <p className="text-sm text-gray-500">Enable email functionality system-wide</p>
                </div>
                <button
                  onClick={() => handleInputChange('emailEnabled', !settings.emailEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                    settings.emailEnabled ? 'bg-blue-600' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      settings.emailEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Provider
                </label>
                <select
                  value={settings.emailProvider}
                  onChange={(e) => handleInputChange('emailProvider', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="smtp">SMTP</option>
                  <option value="sendgrid">SendGrid</option>
                  <option value="mailgun">Mailgun</option>
                </select>
              </div>

              {settings.emailProvider === 'smtp' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        SMTP Host
                      </label>
                      <input
                        type="text"
                        value={settings.smtpHost}
                        onChange={(e) => handleInputChange('smtpHost', e.target.value)}
                        className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        placeholder="smtp.gmail.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        SMTP Port
                      </label>
                      <input
                        type="number"
                        value={settings.smtpPort}
                        onChange={(e) => handleInputChange('smtpPort', parseInt(e.target.value))}
                        className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Username
                      </label>
                      <input
                        type="text"
                        value={settings.smtpUsername}
                        onChange={(e) => handleInputChange('smtpUsername', e.target.value)}
                        className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Password
                      </label>
                      <input
                        type="password"
                        value={settings.smtpPassword}
                        onChange={(e) => handleInputChange('smtpPassword', e.target.value)}
                        className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Notifications Settings */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white mb-4">Notification Settings</h2>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-300">Push Notifications</h3>
                  <p className="text-sm text-gray-500">Enable push notifications system-wide</p>
                </div>
                <button
                  onClick={() => handleInputChange('notificationsEnabled', !settings.notificationsEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                    settings.notificationsEnabled ? 'bg-blue-600' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      settings.notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white mb-4">Security Settings</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Session Timeout (seconds)
                </label>
                <input
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) => handleInputChange('sessionTimeout', parseInt(e.target.value))}
                  className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  min="300"
                  max="86400"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Time in seconds before user sessions expire (300-86400)
                </p>
              </div>
            </div>
          )}

          {/* System Settings */}
          {activeTab === 'system' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white mb-4">System Information</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-700/30 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-300">Version</h3>
                  <p className="text-lg font-semibold text-white">1.0.0</p>
                </div>
                <div className="bg-gray-700/30 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-300">Environment</h3>
                  <p className="text-lg font-semibold text-white">Development</p>
                </div>
                <div className="bg-gray-700/30 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-300">Database</h3>
                  <p className="text-lg font-semibold text-white">PostgreSQL</p>
                </div>
                <div className="bg-gray-700/30 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-300">Node Version</h3>
                  <p className="text-lg font-semibold text-white">18.x</p>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end mt-8 pt-6 border-t border-gray-700">
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all transform hover:scale-105 flex items-center gap-2 disabled:opacity-50"
            >
              <FiSave size={18} />
              {loading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
