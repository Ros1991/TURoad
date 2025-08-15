import React from 'react';
import { FiBell, FiMail, FiShield, FiDatabase, FiGlobe, FiKey } from 'react-icons/fi';

const SettingsPage: React.FC = () => {
  const settingSections = [
    {
      title: 'Notifications',
      description: 'Configure push notifications and alerts',
      icon: FiBell,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Email Settings',
      description: 'Configure email templates and SMTP',
      icon: FiMail,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Security',
      description: 'Manage authentication and access control',
      icon: FiShield,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
    },
    {
      title: 'Database',
      description: 'Database configuration and migrations',
      icon: FiDatabase,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Localization',
      description: 'Language and region settings',
      icon: FiGlobe,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
    },
    {
      title: 'API Keys',
      description: 'Manage external service integrations',
      icon: FiKey,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-gray-400">Configure system preferences and integrations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {settingSections.map((section) => {
          const Icon = section.icon;
          return (
            <div
              key={section.title}
              className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-6 hover:bg-gray-900/70 transition-all cursor-pointer group"
            >
              <div className={`w-12 h-12 ${section.bgColor} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <Icon className={section.color} size={24} />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{section.title}</h3>
              <p className="text-sm text-gray-400">{section.description}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-8 bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-6">
        <h2 className="text-xl font-semibold text-white mb-4">System Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-400">Version</p>
            <p className="text-white font-mono">1.0.0</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Environment</p>
            <p className="text-white font-mono">Production</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Database</p>
            <p className="text-white font-mono">PostgreSQL 14</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Node Version</p>
            <p className="text-white font-mono">18.17.0</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
