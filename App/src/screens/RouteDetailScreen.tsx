import React, { useState, useEffect } from 'react';
import { ScrollView, Image, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Box, Text, Button, Card } from '../components';
import { getRouteById } from '../services/RouteService';
import { Route } from '../types';

type RootStackParamList = {
  RouteDetail: { routeId: string };
  City: { cityId: string };
};

type RouteDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'RouteDetail'>;
type RouteDetailScreenRouteProp = RouteProp<RootStackParamList, 'RouteDetail'>;

const RouteDetailScreen: React.FC = () => {
  const navigation = useNavigation<RouteDetailScreenNavigationProp>();
  const route = useRoute<RouteDetailScreenRouteProp>();
  const { t } = useTranslation();
  const [routeData, setRouteData] = useState<Route | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    loadRoute();
  }, []);

  const loadRoute = async () => {
    try {
      const data = await getRouteById(route.params.routeId);
      setRouteData(data);
    } catch (error) {
      console.error('Error loading route:', error);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (!routeData) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center">
        <Text>{t('common.loading')}</Text>
      </Box>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#B8860B' }}>
      {/* Header */}
      <Box padding="l" paddingTop="xl">
        <Box flexDirection="row" alignItems="center" marginBottom="l">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Box
              width={40}
              height={40}
              borderRadius={20}
              backgroundColor="white"
              justifyContent="center"
              alignItems="center"
              marginRight="m"
            >
              <Text>←</Text>
            </Box>
          </TouchableOpacity>
          <Text variant="header" color="white" flex={1}>
            ROTA HISTÓRICA
          </Text>
        </Box>

        {/* Route illustration */}
        <Image
          source={{ uri: routeData.image }}
          style={{ width: '100%', height: 200, borderRadius: 12, marginBottom: 16 }}
        />
      </Box>

      {/* Content */}
      <Box backgroundColor="white" borderTopLeftRadius={20} borderTopRightRadius={20} padding="l">
        <Card variant="elevated" marginBottom="l">
          <Box flexDirection="row" justifyContent="space-between" alignItems="flex-start" marginBottom="m">
            <Box flex={1}>
              <Text variant="subheader" color="textPrimary" marginBottom="s">
                {routeData.title}
              </Text>
              <Box flexDirection="row" alignItems="center" marginBottom="s">
                <Text variant="body" color="secondary" marginRight="m">
                  🗺️ {routeData.totalDistance}
                </Text>
                <Text variant="body" color="secondary" marginRight="m">
                  📍 {routeData.stops} {t('route.stops')}
                </Text>
              </Box>
              <Text variant="body" color="secondary">
                ⏱️ {routeData.estimatedDuration}
              </Text>
            </Box>
            <Box flexDirection="row">
              <TouchableOpacity style={{ marginRight: 12 }}>
                <Text>📤</Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text>❤️</Text>
              </TouchableOpacity>
            </Box>
          </Box>

          <Box flexDirection="row" alignItems="center" marginBottom="m">
            <Text variant="body" color="secondary">
              🌐 {t('route.language')}
            </Text>
          </Box>

          <Text variant="body" color="textPrimary" marginBottom="l">
            {routeData.description}
          </Text>

          {/* Route stops */}
          <Box marginBottom="l">
            <Box flexDirection="row" alignItems="center" marginBottom="m">
              <Box
                width={60}
                height={60}
                borderRadius={30}
                backgroundColor="primary"
                justifyContent="center"
                alignItems="center"
                marginRight="m"
              >
                <Text color="white">📍</Text>
              </Box>
              <Box flex={1}>
                <Text variant="body" color="primary" fontWeight="bold">
                  Aracaju em 3km
                </Text>
              </Box>
              <Box width={20} height={2} backgroundColor="primary" />
            </Box>

            <Box flexDirection="row" alignItems="center" marginBottom="m">
              <Box
                width={60}
                height={60}
                borderRadius={30}
                backgroundColor="secondary"
                justifyContent="center"
                alignItems="center"
                marginRight="m"
              >
                <Text color="white">📍</Text>
              </Box>
              <Box flex={1}>
                <Text variant="body" color="textPrimary" fontWeight="bold">
                  São Cristóvão em 11km
                </Text>
              </Box>
              <Box width={20} height={2} backgroundColor="secondary" />
            </Box>
          </Box>
        </Card>

        {/* São Cristóvão Details */}
        <Card variant="elevated" marginBottom="l">
          <TouchableOpacity onPress={() => toggleSection('saoCristovao')}>
            <Box flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom="m">
              <Text variant="subheader" color="textPrimary">
                São Cristóvão, SE
              </Text>
              <Text>{expandedSections.saoCristovao ? '🔼' : '🔽'}</Text>
            </Box>
          </TouchableOpacity>
          
          {expandedSections.saoCristovao && (
            <Box>
              <Text variant="body" color="textPrimary" marginBottom="m">
                Primeira capital de Sergipe e quarta cidade mais antiga do Brasil, é um tesouro colonial reconhecido pela UNESCO.
              </Text>

              {routeData.stories.length > 0 && (
                <Box marginBottom="m">
                  <Text variant="body" color="primary" marginBottom="s">
                    🎵 Histórias de São Cristóvão, SE
                  </Text>
                  
                  <Box flexDirection="row" alignItems="center" marginBottom="s">
                    <TouchableOpacity onPress={() => setIsPlaying(!isPlaying)}>
                      <Box
                        width={40}
                        height={40}
                        borderRadius={20}
                        backgroundColor="primary"
                        justifyContent="center"
                        alignItems="center"
                        marginRight="m"
                      >
                        <Text color="white">{isPlaying ? '⏸️' : '▶️'}</Text>
                      </Box>
                    </TouchableOpacity>
                    
                    <Box flex={1} height={4} backgroundColor="light" borderRadius={2}>
                      <Box width="30%" height="100%" backgroundColor="primary" borderRadius={2} />
                    </Box>
                  </Box>
                  
                  <Box flexDirection="row" justifyContent="space-between">
                    <Text variant="body" color="secondary">1:46</Text>
                    <Text variant="body" color="secondary">3:40</Text>
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </Card>

        {/* Expandable sections */}
        <Card variant="elevated" marginBottom="m">
          <TouchableOpacity onPress={() => toggleSection('observe')}>
            <Box flexDirection="row" justifyContent="space-between" alignItems="center" padding="m">
              <Text variant="subheader" color="textPrimary">
                {t('city.whatToObserve')}
              </Text>
              <Text>{expandedSections.observe ? '🔼' : '🔽'}</Text>
            </Box>
          </TouchableOpacity>
          {expandedSections.observe && (
            <Box padding="m">
              <Text variant="body" color="textPrimary">
                Feira Central vibrante, arte urbana nos muros, poesia nas praças, e a icônica Casa do Cantador — um centro vivo da cultura nordestina no coração do DF.
              </Text>
            </Box>
          )}
        </Card>

        <Card variant="elevated" marginBottom="m">
          <TouchableOpacity onPress={() => toggleSection('about')}>
            <Box flexDirection="row" justifyContent="space-between" alignItems="center" padding="m">
              <Text variant="subheader" color="textPrimary">
                {t('city.aboutLocation')}
              </Text>
              <Text>{expandedSections.about ? '🔼' : '🔽'}</Text>
            </Box>
          </TouchableOpacity>
        </Card>

        <Text variant="subheader" color="textPrimary" marginBottom="m">
          {t('city.nearbyServices')}
        </Text>

        <Box flexDirection="row" marginBottom="l">
          <Image
            source={{ uri: 'https://via.placeholder.com/150x100/FF6B6B/FFFFFF?text=Service+1' }}
            style={{ width: 150, height: 100, borderRadius: 8, marginRight: 12 }}
          />
          <Image
            source={{ uri: 'https://via.placeholder.com/150x100/4ECDC4/FFFFFF?text=Service+2' }}
            style={{ width: 150, height: 100, borderRadius: 8 }}
          />
        </Box>
      </Box>
    </ScrollView>
  );
};

export default RouteDetailScreen;

