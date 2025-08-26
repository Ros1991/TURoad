import React, { useEffect, useState, useRef } from 'react';
import {
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  View,
  Image,
  Dimensions,
  FlatList,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Box, Text, Card } from '../components';
import { useTheme } from '@shopify/restyle';
import { Theme } from '../themes/theme';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { getRouteById, getRouteBusinesses, getRouteHosting } from '../services/RouteService';
import AudioStoriesPlayer from '../components/AudioStoriesPlayer';

type RootStackParamList = {
  RouteDetail: { routeId: string };
  City: { cityId: string };
};

type RouteDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'RouteDetail'>;
type RouteDetailScreenRouteProp = RouteProp<RootStackParamList, 'RouteDetail'>;

const RouteDetailScreen = () => {
  const route = useRoute<RouteDetailScreenRouteProp>();
  const navigation = useNavigation<RouteDetailScreenNavigationProp>();
  const theme = useTheme<Theme>();
  const { t, i18n } = useTranslation();
  const { width: screenWidth } = Dimensions.get('window');
  const [loading, setLoading] = useState(true);
  const [routeData, setRouteData] = useState<any>(null);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [hosting, setHosting] = useState<any[]>([]);
  const [expandedCities, setExpandedCities] = useState<Set<string>>(new Set());
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [currentPlayingCityId, setCurrentPlayingCityId] = useState<string | null>(null);
  const audioPlayerRefs = useRef<{ [key: string]: any }>({});

  useEffect(() => {
    loadRouteDetails();
  }, [route.params?.routeId]);

  const loadRouteDetails = async () => {
    try {
      setLoading(true);
      const routeId = route.params?.routeId || '';
      
      // Load route details and related data in parallel
      const [routeResponse, businessesResponse, hostingResponse] = await Promise.all([
        getRouteById(routeId),
        getRouteBusinesses(routeId),
        getRouteHosting(routeId)
      ]);
      
      if (routeResponse) {
        setRouteData(routeResponse);
      }
      setBusinesses(businessesResponse);
      setHosting(hostingResponse);
    } catch (error) {
      console.error('Error loading route details:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCityExpansion = (cityId: string) => {
    const newExpanded = new Set(expandedCities);
    if (newExpanded.has(cityId)) {
      newExpanded.delete(cityId);
      // Stop audio if this city is playing
      if (currentPlayingCityId === cityId) {
        stopCurrentAudio();
      }
    } else {
      newExpanded.add(cityId);
    }
    setExpandedCities(newExpanded);
  };

  const handleAudioPlay = (cityId: string) => {
    // Stop any currently playing audio
    if (currentPlayingCityId && currentPlayingCityId !== cityId) {
      const currentPlayer = audioPlayerRefs.current[currentPlayingCityId];
      if (currentPlayer?.stop) {
        currentPlayer.stop();
      }
    }
    setCurrentPlayingCityId(cityId);
  };

  const stopCurrentAudio = () => {
    if (currentPlayingCityId) {
      const currentPlayer = audioPlayerRefs.current[currentPlayingCityId];
      if (currentPlayer?.stop) {
        currentPlayer.stop();
      }
      setCurrentPlayingCityId(null);
    }
  };

  const toggleSectionExpansion = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const renderBusinessCard = ({ item }: { item: any }) => (
    <Card
      marginRight="m"
      padding="m"
      width={280}
      backgroundColor="white"
    >
      {item.imageUrl && (
        <Box height={120} marginBottom="s" borderRadius={8} overflow="hidden">
          <Image
            source={{ uri: item.imageUrl }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
        </Box>
      )}
      <Text variant="subheader" numberOfLines={1}>
        {item.name}
      </Text>
      <Text variant="body" color="secondary" numberOfLines={2} marginTop="s">
        {item.description}
      </Text>
      {item.distance && (
        <Box flexDirection="row" alignItems="center" marginTop="s">
          <Ionicons name="location-outline" size={14} color={theme.colors.secondary} />
          <Text variant="body" color="secondary" marginLeft="s">
            {item.distance < 1 ? `${(item.distance * 1000).toFixed(0)}m` : `${item.distance.toFixed(1)}km`}
          </Text>
        </Box>
      )}
      {item.rating && (
        <Box flexDirection="row" alignItems="center" marginTop="s">
          <Ionicons name="star" size={14} color="#FFD700" />
          <Text variant="body" marginLeft="s">
            {item.rating.toFixed(1)}
          </Text>
        </Box>
      )}
    </Card>
  );

  const renderHostingCard = ({ item }: { item: any }) => (
    <Card
      marginRight="m"
      padding="m"
      width={280}
      backgroundColor="white"
    >
      {item.imageUrl && (
        <Box height={120} marginBottom="s" borderRadius={8} overflow="hidden">
          <Image
            source={{ uri: item.imageUrl }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
        </Box>
      )}
      <Text variant="subheader" numberOfLines={1}>
        {item.name}
      </Text>
      <Text variant="body" color="secondary" numberOfLines={2} marginTop="s">
        {item.description}
      </Text>
      {item.priceRange && (
        <Box flexDirection="row" alignItems="center" marginTop="s">
          <FontAwesome5 name="star" size={10} color={theme.colors.secondary} />
          <Text variant="body" color="success" marginTop="s">
            {item.priceRange}
          </Text>
        </Box>
      )}
      {item.distance && (
        <Box flexDirection="row" alignItems="center" marginTop="s">
          <Ionicons name="location-outline" size={14} color={theme.colors.secondary} />
          <Text variant="body" color="secondary" marginLeft="s">
            {item.distance < 1 ? `${(item.distance * 1000).toFixed(0)}m` : `${item.distance.toFixed(1)}km`}
          </Text>
        </Box>
      )}
      {item.rating && (
        <Box flexDirection="row" alignItems="center" marginTop="s">
          <Ionicons name="star" size={14} color="#FFD700" />
          <Text variant="body" marginLeft="s">
            {item.rating.toFixed(1)}
          </Text>
        </Box>
      )}
    </Card>
  );

  const renderCityCarousel = () => {
    if (!routeData?.cities || routeData.cities.length === 0) return null;

    return (
      <Box marginVertical="m">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        >
          {routeData.cities.map((city: any, index: number) => (
            <TouchableOpacity
              key={city.cityId}
              onPress={() => toggleCityExpansion(city.cityId)}
              style={{ marginRight: 12 }}
            >
              <Box
                backgroundColor={expandedCities.has(city.cityId) ? 'primary' : 'white'}
                borderWidth={1}
                borderColor={expandedCities.has(city.cityId) ? 'primary' : 'secondary'}
                borderRadius={20}
                paddingHorizontal="m"
                paddingVertical="s"
                flexDirection="row"
                alignItems="center"
              >
                <Box
                  width={24}
                  height={24}
                  borderRadius={12}
                  backgroundColor={expandedCities.has(city.cityId) ? 'white' : 'primary'}
                  justifyContent="center"
                  alignItems="center"
                  marginRight="s"
                >
                  <Text
                    variant="body"
                    color={expandedCities.has(city.cityId) ? 'primary' : 'white'}
                    fontWeight="bold"
                  >
                    {index + 1}
                  </Text>
                </Box>
                <Text
                  variant="body"
                  color={expandedCities.has(city.cityId) ? 'white' : 'black'}
                  marginLeft="s"
                >
                  {city.name}
                </Text>
              </Box>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Box>
    );
  };

  if (loading) {
    return (
    <Box flex={1} justifyContent="center" alignItems="center" backgroundColor="mainBackground">
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text variant="body" marginTop="m">{t('common.loading')}</Text>
    </Box>
    );
  }

  if (!routeData) {
    return (
    <Box flex={1} justifyContent="center" alignItems="center">
      <Text>{t('routes.notFound')}</Text>
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
        <TouchableOpacity onPress={() => toggleCityExpansion('saoCristovao')}>
          <Box flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom="m">
            <Text variant="subheader" color="textPrimary">
              São Cristóvão, SE
            </Text>
            <Text>{expandedCities.has('saoCristovao') ? t('routes.hideStories') : t('routes.showStories')}</Text>
          </Box>
        </TouchableOpacity>
        
        {expandedCities.has('saoCristovao') && (
          <Box>
            <Text variant="body" color="textPrimary" marginBottom="m">
              Primeira capital de Sergipe e quarta cidade mais antiga do Brasil, é um tesouro colonial reconhecido pela UNESCO.
            </Text>

            {routeData.stories.length > 0 && (
              <Box marginBottom="m">
                <Text variant="body" color="secondary" marginTop="s">
                  🎵 Histórias de São Cristóvão, SE
                </Text>
                
                <Box flexDirection="row" alignItems="center" marginBottom="s">
                  <TouchableOpacity onPress={() => {}}>
                    <Box
                      width={40}
                      height={40}
                      borderRadius={20}
                      backgroundColor="primary"
                      justifyContent="center"
                      alignItems="center"
                      marginRight="m"
                    >
                      <Text color="white">▶️</Text>
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
        <TouchableOpacity onPress={() => toggleSectionExpansion('observe')}>
          <Box flexDirection="row" justifyContent="space-between" alignItems="center" padding="m">
            <Text variant="subheader" color="textPrimary">
              {t('city.whatToObserve')}
            </Text>
            <Text>{expandedSections.has('about') ? t('routes.hideAbout') : t('routes.showAbout')}</Text>
          </Box>
        </TouchableOpacity>
        {expandedSections.has('observe') && (
          <Box padding="m">
            <Text variant="body" color="textPrimary">
              Feira Central vibrante, arte urbana nos muros, poesia nas praças, e a icônica Casa do Cantador — um centro vivo da cultura nordestina no coração do DF.
            </Text>
          </Box>
        )}
      </Card>

      <Card variant="elevated" marginBottom="m">
        <TouchableOpacity onPress={() => toggleSectionExpansion('about')}>
          <Box flexDirection="row" justifyContent="space-between" alignItems="center" padding="m">
            <Text variant="subheader" color="textPrimary">
              {t('city.aboutLocation')}
            </Text>
            <Text>{expandedSections.has('about') ? '🔼' : '🔽'}</Text>
          </Box>
        </TouchableOpacity>
        {expandedSections.has('about') && (
          <Box padding="m">
            <Text variant="body" color="textPrimary">
              {routeData.description}
            </Text>
          </Box>
        )}
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

