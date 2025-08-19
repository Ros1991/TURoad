import React, { useState, useEffect } from 'react';
import { FiBell, FiToggleLeft, FiToggleRight, FiSave, FiRefreshCw } from 'react-icons/fi';
import { toast } from 'react-toastify';
import userPushSettingsService, { UserPushSettings, UpdateUserPushSettingsDto } from '../../services/userPushSettings.service';

interface UserPushSettingsCardProps {
  userId: number;
  title?: string;
}

const UserPushSettingsCard: React.FC<UserPushSettingsCardProps> = ({
  userId,
  title = "Configurações de Notificação"
}) => {
  const [settings, setSettings] = useState<UserPushSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [formData, setFormData] = useState<UpdateUserPushSettingsDto>({});

  useEffect(() => {
    loadSettings();
  }, [userId]);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await userPushSettingsService.getUserSettings(userId);
      setSettings(data);
      setFormData({
        activeRouteNotifications: data.activeRouteNotifications,
        travelTipsNotifications: data.travelTipsNotifications,
        nearbyEventsNotifications: data.nearbyEventsNotifications,
        availableNarrativesNotifications: data.availableNarrativesNotifications,
        localOffersNotifications: data.localOffersNotifications
      });
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to load push settings:', error);
      toast.error('Falha ao carregar configurações de notificação');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (field: keyof UpdateUserPushSettingsDto) => {
    const newValue = !formData[field];
    setFormData(prev => ({ ...prev, [field]: newValue }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!hasChanges) return;

    setSaving(true);
    try {
      const updatedSettings = await userPushSettingsService.updateUserSettings(userId, formData);
      setSettings(updatedSettings);
      setHasChanges(false);
      toast.success('Configurações atualizadas com sucesso');
    } catch (error) {
      console.error('Failed to update push settings:', error);
      toast.error('Falha ao atualizar configurações');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (settings) {
      setFormData({
        activeRouteNotifications: settings.activeRouteNotifications,
        travelTipsNotifications: settings.travelTipsNotifications,
        nearbyEventsNotifications: settings.nearbyEventsNotifications,
        availableNarrativesNotifications: settings.availableNarrativesNotifications,
        localOffersNotifications: settings.localOffersNotifications
      });
      setHasChanges(false);
    }
  };

  const settingsOptions = [
    {
      key: 'activeRouteNotifications' as keyof UpdateUserPushSettingsDto,
      label: 'Notificações de Rotas Ativas',
      description: 'Receber notificações sobre rotas em andamento'
    },
    {
      key: 'travelTipsNotifications' as keyof UpdateUserPushSettingsDto,
      label: 'Dicas de Viagem',
      description: 'Receber dicas e sugestões de viagem'
    },
    {
      key: 'nearbyEventsNotifications' as keyof UpdateUserPushSettingsDto,
      label: 'Eventos Próximos',
      description: 'Notificações sobre eventos próximos à sua localização'
    },
    {
      key: 'availableNarrativesNotifications' as keyof UpdateUserPushSettingsDto,
      label: 'Narrativas Disponíveis',
      description: 'Notificações sobre novas narrativas e histórias'
    },
    {
      key: 'localOffersNotifications' as keyof UpdateUserPushSettingsDto,
      label: 'Ofertas Locais',
      description: 'Receber ofertas e promoções de estabelecimentos locais'
    }
  ];

  if (loading) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-6">
        <div className="flex items-center justify-center h-32">
          <div className="text-gray-400">Carregando configurações...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FiBell className="text-blue-400" size={24} />
          <div>
            <h2 className="text-xl font-semibold text-white">{title}</h2>
            <p className="text-gray-400 text-sm">Gerencie as preferências de notificação push</p>
          </div>
        </div>
        
        {hasChanges && (
          <div className="flex gap-2">
            <button
              onClick={handleReset}
              disabled={saving}
              className="px-3 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2 text-sm"
            >
              <FiRefreshCw size={16} />
              Resetar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <FiSave size={16} />
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        )}
      </div>

      {/* Settings List */}
      <div className="space-y-4">
        {settingsOptions.map((option) => {
          const isEnabled = formData[option.key] ?? false;
          
          return (
            <div
              key={option.key}
              className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
            >
              <div className="flex-1">
                <h3 className="text-white font-medium mb-1">{option.label}</h3>
                <p className="text-gray-400 text-sm">{option.description}</p>
              </div>
              
              <button
                onClick={() => handleToggle(option.key)}
                disabled={saving}
                className={`ml-4 p-1 rounded-lg transition-colors ${
                  isEnabled 
                    ? 'text-green-400 hover:text-green-300' 
                    : 'text-gray-500 hover:text-gray-400'
                }`}
              >
                {isEnabled ? (
                  <FiToggleRight size={32} />
                ) : (
                  <FiToggleLeft size={32} />
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Status Info */}
      {settings && (
        <div className="mt-6 pt-4 border-t border-gray-700">
          <p className="text-gray-400 text-sm">
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </p>
        </div>
      )}
    </div>
  );
};

export default UserPushSettingsCard;
