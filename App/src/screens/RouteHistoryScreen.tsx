import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, Image, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Box, Text } from '../components';

const RouteHistoryScreen: React.FC = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const routes = [
    {
      id: '1',
      title: 'Caminhos da Memória Sergipana',
      type: 'Rota',
      cities: 3,
      distance: '7km',
      stories: 5,
      duration: '15 dias',
      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop',
    },
    {
      id: '2', 
      title: 'Entre Quintais e Tradições',
      type: 'Rota',
      cities: 0,
      distance: '0km',
      stories: 5,
      duration: '15 dias',
      image: 'https://images.unsplash.com/photo-1520637836862-4d197d17c52a?w=400&h=300&fit=crop',
    },
    {
      id: '3',
      title: 'Cerrado Vivo',
      type: 'Rota', 
      cities: 0,
      distance: '0km',
      stories: 5,
      duration: '15 dias',
      image: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=400&h=300&fit=crop',
    },
  ];

  const RouteCard = ({ route }: { route: any }) => (
    <TouchableOpacity>
      <Box
        backgroundColor="white"
        borderRadius={12}
        marginHorizontal="m"
        marginBottom="m"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 3,
        }}
      >
        <Box flexDirection="row" padding="m">
          <Image
            source={{ uri: route.image }}
            style={{
              width: 80,
              height: 80,
              borderRadius: 8,
              marginRight: 12,
            }}
          />
          <Box flex={1}>
            <Text style={{ 
              fontSize: 16, 
              fontWeight: '600', 
              color: '#1A1A1A',
              marginBottom: 4,
            }}>
              {route.title}
            </Text>
            <Box
              backgroundColor="primary"
              paddingHorizontal="s"
              paddingVertical="s"
              borderRadius={4}
              alignSelf="flex-start"
              marginBottom="s"
            >
              <Text style={{ fontSize: 12, color: '#1976D2', fontWeight: '500' }}>
                {route.type}
              </Text>
            </Box>
            <Box flexDirection="row" alignItems="center" marginBottom="s">
              <Icon name="map-marker" size={12} color="#666666" />
              <Text style={{ fontSize: 12, color: '#666666', marginLeft: 4 }}>
                {route.cities} cidades
              </Text>
            </Box>
            <Box flexDirection="row" alignItems="center" marginBottom="s">
              <Icon name="map-marker-distance" size={12} color="#666666" />
              <Text style={{ fontSize: 12, color: '#666666', marginLeft: 4 }}>
                Distância total: {route.distance}
              </Text>
            </Box>
            <Box flexDirection="row" alignItems="center" marginBottom="s">
              <Icon name="headphones" size={12} color="#666666" />
              <Text style={{ fontSize: 12, color: '#666666', marginLeft: 4 }}>
                {route.stories} histórias em áudio
              </Text>
            </Box>
            <Box flexDirection="row" alignItems="center">
              <Icon name="clock-outline" size={12} color="#666666" />
              <Text style={{ fontSize: 12, color: '#666666', marginLeft: 4 }}>
                Há {route.duration}
              </Text>
            </Box>
          </Box>
        </Box>
      </Box>
    </TouchableOpacity>
  );

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <Box flex={1} backgroundColor="light">
        {/* Header */}
        <Box
          backgroundColor="white"
          paddingTop="l"
          paddingBottom="m"
          paddingHorizontal="m"
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
            elevation: 3,
          }}
        >
          <Box flexDirection="row" alignItems="center" flex={1}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Icon name="arrow-left" size={24} color="#1A1A1A" />
            </TouchableOpacity>
            <Text style={{
              fontSize: 18,
              fontWeight: '600',
              color: '#1A1A1A',
              marginLeft: 16,
            }}>
              Histórico de rotas
            </Text>
          </Box>
          <TouchableOpacity onPress={() => setShowFilterMenu(!showFilterMenu)}>
            <Icon name="tune" size={24} color="#1A1A1A" />
          </TouchableOpacity>
        </Box>

        {/* Content */}
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <Box paddingTop="m">
            {routes.map((route) => (
              <RouteCard key={route.id} route={route} />
            ))}
          </Box>
          <Box height={20} />
        </ScrollView>
      </Box>
    </>
  );
};

export default RouteHistoryScreen;
