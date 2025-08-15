import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, StatusBar, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Box, Text } from '../components';

const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  
  const [notifications, setNotifications] = useState({
    activeRoute: true,
    travelTips: true,
    nearbyEvents: true,
    narratives: true,
    localOffers: true,
  });

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

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
      />
    </Box>
  );

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <Box flex={1} backgroundColor="light">
        {/* Header */}
        <Box
          backgroundColor="white"
          paddingBottom="m"
          paddingHorizontal="m"
          flexDirection="row"
          alignItems="center"
          style={{
            paddingTop: 60,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
            elevation: 3,
          }}
        >
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="close" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={{
            fontSize: 18,
            fontWeight: '600',
            color: '#1A1A1A',
            marginLeft: 16,
          }}>
            Configurações de notificação
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
                title="Notificações de rota ativa"
                description="Receba atualizações enquanto percorre uma rota, como alertas de paradas, dicas locais e pontos de interesse próximos."
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
                title="Dicas de viagem"
                description="Sugestões personalizadas com base nas suas rotas anteriores, interesses e localização atual."
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
                title="Eventos e atividades próximas"
                description="Avisos sobre eventos culturais, feiras e atrações que estão acontecendo perto de você."
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
                title="Narrativas disponíveis"
                description="Notificações quando um novo conteúdo narrativo ou histórico estiver disponível na sua rota."
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
                title="Ofertas e comércio local"
                description="Promoções de estabelecimentos e parceiros nas cidades ou pontos que você visitar."
                value={notifications.localOffers}
                onToggle={() => toggleNotification('localOffers')}
              />
            </Box>
          </Box>
          <Box height={20} />
        </ScrollView>
      </Box>
    </>
  );
};

export default NotificationsScreen;
