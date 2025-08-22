import React, { useState, useEffect } from 'react';
import { ScrollView, TouchableOpacity, Switch, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { Box, Text } from '../components';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/ApiService';

const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [notifications, setNotifications] = useState({
    activeRoute: true,
    travelTips: true,
    nearbyEvents: true,
    narratives: true,
    localOffers: true,
  });

  useEffect(() => {
    fetchNotificationSettings();
  }, [user]);

  const fetchNotificationSettings = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const response = await apiService.get(`/api/users/${user.id}/push-settings`);

      if (response.success && response.data) {
        const settings = response.data as any;
        setNotifications({
          activeRoute: settings.activeRouteNotifications ?? true,
          travelTips: settings.travelTipsNotifications ?? true,
          nearbyEvents: settings.nearbyEventsNotifications ?? true,
          narratives: settings.availableNarrativesNotifications ?? true,
          localOffers: settings.localOffersNotifications ?? true,
        });
      }
    } catch (error: any) {
      console.error('Error fetching notification settings:', error);
      // If settings don't exist, create default ones
      if (error.response?.status === 404) {
        await createDefaultSettings();
      }
    } finally {
      setLoading(false);
    }
  };

  const createDefaultSettings = async () => {
    if (!user) return;

    try {
      const backendFormat = {
        activeRouteNotifications: notifications.activeRoute,
        travelTipsNotifications: notifications.travelTips,
        nearbyEventsNotifications: notifications.nearbyEvents,
        availableNarrativesNotifications: notifications.narratives,
        localOffersNotifications: notifications.localOffers,
      };
      await apiService.post(`/api/users/${user.id}/push-settings`, backendFormat);
    } catch (error) {
      console.error('Error creating default settings:', error);
    }
  };

  const toggleNotification = async (key: keyof typeof notifications) => {
    if (!user) return;

    const newValue = !notifications[key];
    const updatedNotifications = {
      ...notifications,
      [key]: newValue
    };
    
    setNotifications(updatedNotifications);
    setSaving(true);

    try {
      // Map frontend field names to backend field names
      const backendFormat = {
        activeRouteNotifications: updatedNotifications.activeRoute,
        travelTipsNotifications: updatedNotifications.travelTips,
        nearbyEventsNotifications: updatedNotifications.nearbyEvents,
        availableNarrativesNotifications: updatedNotifications.narratives,
        localOffersNotifications: updatedNotifications.localOffers,
      };

      const response = await apiService.put(`/api/users/${user.id}/push-settings`, backendFormat);

      if (!response.success) {
        // Revert on failure
        setNotifications(notifications);
        Alert.alert(
          t('notifications.error'),
          t('notifications.errorMessage')
        );
      }
    } catch (error) {
      console.error('Error updating notification settings:', error);
      // Revert on error
      setNotifications(notifications);
      Alert.alert(
        t('notifications.error'),
        t('notifications.errorMessage')
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box flex={1} backgroundColor="light" justifyContent="center" alignItems="center">
        <ActivityIndicator size="large" color="#035A6E" />
      </Box>
    );
  }

  const NotificationItem = ({ 
    title, 
    description, 
    value, 
    onToggle 
  }: {
    title: string;
    description: string;
    value: boolean;
    onToggle: () => void;
  }) => (
    <Box
      backgroundColor="white"
      paddingHorizontal="m"
      paddingVertical="m"
      marginBottom="s"
      flexDirection="row"
      alignItems="center"
      justifyContent="space-between"
    >
      <Box flex={1} marginRight="m">
        <Text style={{
          fontSize: 16,
          fontWeight: '600',
          color: '#1A1A1A',
          marginBottom: 4,
        }}>
          {title}
        </Text>
        <Text style={{
          fontSize: 14,
          color: '#666666',
          lineHeight: 18,
        }}>
          {description}
        </Text>
      </Box>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#E5E5E5', true: '#035A6E' }}
        thumbColor={value ? '#FFFFFF' : '#FFFFFF'}
        disabled={saving}
      />
    </Box>
  );

  return (
      <Box flex={1} backgroundColor="light">
        {/* Header */}
        <Box
          backgroundColor="white"
          paddingBottom="m"
          paddingHorizontal="m"
          flexDirection="row"
          alignItems="center"
          style={{
            paddingTop: 80,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
            elevation: 3,
          }}
        >
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="chevron-left" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={{
            fontSize: 18,
            fontWeight: '600',
            color: '#1A1A1A',
            marginLeft: 16,
          }}>
            {t('notifications.title')}
          </Text>
        </Box>

        {/* Content */}
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <Box paddingTop="m">
            {/* Section Header */}
            <Text style={{
              fontSize: 13,
              fontWeight: '600',
              color: '#666666',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              marginBottom: 12,
              marginHorizontal: 16,
            }}>
              NOTIFICAÇÕES NO APP
            </Text>

            <Box 
              backgroundColor="white" 
              marginHorizontal="m"
              marginBottom="s"
              borderRadius={12}
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
              }}
            >
              <NotificationItem
                title={t('notifications.activeRouteTitle')}
                description={t('notifications.activeRouteDescription')}
                value={notifications.activeRoute}
                onToggle={() => toggleNotification('activeRoute')}
              />
            </Box>

            <Box 
              backgroundColor="white" 
              marginHorizontal="m"
              marginBottom="s"
              borderRadius={12}
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
              }}
            >
              <NotificationItem
                title={t('notifications.travelTipsTitle')}
                description={t('notifications.travelTipsDescription')}
                value={notifications.travelTips}
                onToggle={() => toggleNotification('travelTips')}
              />
            </Box>

            <Box 
              backgroundColor="white" 
              marginHorizontal="m"
              marginBottom="s"
              borderRadius={12}
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
              }}
            >
              <NotificationItem
                title={t('notifications.nearbyEventsTitle')}
                description={t('notifications.nearbyEventsDescription')}
                value={notifications.nearbyEvents}
                onToggle={() => toggleNotification('nearbyEvents')}
              />
            </Box>

            <Box 
              backgroundColor="white" 
              marginHorizontal="m"
              marginBottom="s"
              borderRadius={12}
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
              }}
            >
              <NotificationItem
                title={t('notifications.narrativesTitle')}
                description={t('notifications.narrativesDescription')}
                value={notifications.narratives}
                onToggle={() => toggleNotification('narratives')}
              />
            </Box>

            <Box 
              backgroundColor="white" 
              marginHorizontal="m"
              marginBottom="s"
              borderRadius={12}
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
              }}
            >
              <NotificationItem
                title={t('notifications.localOffersTitle')}
                description={t('notifications.localOffersDescription')}
                value={notifications.localOffers}
                onToggle={() => toggleNotification('localOffers')}
              />
            </Box>
          </Box>
          <Box height={20} />
        </ScrollView>
      </Box>
  );
};

export default NotificationsScreen;
