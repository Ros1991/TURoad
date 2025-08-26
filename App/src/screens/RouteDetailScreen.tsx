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
import DashLine from '../components/DashLine';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Box, Text, Card, BusinessCard } from '../components';
import { useTheme } from '@shopify/restyle';
import { Theme } from '../themes/theme';
import { Ionicons, MaterialIcons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import LinearGradient from 'react-native-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { getRouteById, getRouteBusinesses, getRouteHosting } from '../services/RouteService';
import { FavoriteService } from '../services/FavoriteService';
import AudioStoriesPlayer, { AudioStoriesPlayerRef } from '../components/AudioStoriesPlayer';
import { Story } from '../types';

type RootStackParamList = {
  RouteDetail: { routeId: string };
  City: { cityId: string };
  Others: { type: 'event' | 'location'; itemId: string };
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
  const [isFavorite, setIsFavorite] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const audioPlayerRefs = useRef<{ [key: string]: AudioStoriesPlayerRef | null }>({});
  const { isAuthenticated, user } = useAuth();
  const { currentLanguage, changeLanguage, availableLanguages } = useLanguage();

  const languageOptions = [
    { code: 'pt' as const, flag: '🇧🇷', name: 'Português' },
    { code: 'en' as const, flag: '🇺🇸', name: 'English' },
    { code: 'es' as const, flag: '🇪🇸', name: 'Español' }
  ];

  const currentLanguageOption = languageOptions.find(lang => lang.code === currentLanguage) || languageOptions[0];

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
        const routeData = routeResponse.data || routeResponse;
        setRouteData(routeData);
        
        // Set all city expanders as open by default
        if (routeData.cities && routeData.cities.length > 0) {
          const cityIds = routeData.cities.map((city: any, index: number) => `city-${city.id || index}`);
          setExpandedCities(new Set(cityIds));
        }
        
        // Set initial favorite status from API response
        if (routeResponse.isFavorite !== undefined) {
          console.log('🤍 Setting initial favorite status:', routeResponse.isFavorite);
          setIsFavorite(routeResponse.isFavorite || false);
        } else {
          console.log('🤍 No isFavorite found in routeResponse, setting to false');
          console.log('🔍 DEBUG - Available keys:', Object.keys(routeResponse));
          setIsFavorite(false);
        }
      }
      setBusinesses(businessesResponse);
      console.log(businessesResponse);
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
      // Pause audio if this city is playing when collapsed
      const cityPlayer = audioPlayerRefs.current[cityId];
      if (cityPlayer) {
        cityPlayer.pause();
      }
    } else {
      newExpanded.add(cityId);
    }
    setExpandedCities(newExpanded);
  };

  const handleAudioPlay = (cityId: string) => {
    // Pause any currently playing audio
    if (currentPlayingCityId && currentPlayingCityId !== cityId) {
      const currentPlayer = audioPlayerRefs.current[currentPlayingCityId];
      if (currentPlayer?.pause) {
        currentPlayer.pause();
      }
    }
    setCurrentPlayingCityId(cityId);
  };

  const toggleFavorite = async () => {
    if (!user?.id || !routeData) return;
    
    try {
      console.log('🤍 Toggling favorite for route:', route.params?.routeId);
      
      // Optimistically update UI
      const newFavoriteState = !isFavorite;
      setIsFavorite(newFavoriteState);
      
      // Call backend API
      const result = await FavoriteService.toggleFavoriteRoute(
        parseInt(user.id), 
        parseInt(route.params?.routeId || '0')
      );
      
      // Update state based on API response
      setIsFavorite(result.isFavorited);
      
      console.log('🤍 Favorite toggled successfully:', result.isFavorited);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      
      // Revert optimistic update on error
      setIsFavorite(prev => !prev);
    }
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
  <ScrollView style={{ flex: 1, backgroundColor: 'white' }}>
    {/* Header with background image */}
    <Box height={300} position="relative">
      <Image
        source={{ uri: routeData?.image_url || routeData?.image }}
        style={{ width: '100%', height: '100%' }}
        resizeMode="cover"
      />
      
      {/* Back button */}
      <Box position="absolute" top={40} left={16}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Box
            width={50}
            height={50}
            borderRadius={25}
            marginTop="m"
            backgroundColor="white"
            justifyContent="center"
            alignItems="center"
          >
            <MaterialCommunityIcons name="keyboard-backspace" size={30} color="#000" />
          </Box>
        </TouchableOpacity>
      </Box>
      
    </Box>

    {/* Content */}
    <Box 
      backgroundColor="white" 
      borderTopLeftRadius={20} 
      borderTopRightRadius={20} 
      style={{ marginTop: -100 }}
      flex={1}
      paddingTop="l"
      paddingBottom="xl"
      paddingHorizontal="l"
    >
      {/* Route Info */}
      <Box flexDirection="row" justifyContent="space-between" alignItems="flex-start" marginBottom="m">
        <Box flex={1}>
          <Text variant="routeTitle" color="textPrimary" marginBottom="s">
            {routeData.name || routeData.title || 'Nome da Rota'}
          </Text>
          <Box flexDirection="row" alignItems="center">
            <MaterialCommunityIcons name="map-marker-path" size={20} color="#666666" />
            <Text variant="body" color="secondary" marginLeft="s" marginRight="m">
              {t('route.totalDistance', {distance: routeData.total_distance || routeData.totalDistance || 'N/A'})}
            </Text>
          </Box>
          <Box flexDirection="row" alignItems="center">
            <MaterialCommunityIcons name="pin-outline" size={20} color="#666666" />
            <Text variant="body" color="secondary" marginLeft="s" marginRight="m">
              {routeData.stops || routeData.cities?.length || 0} {t('route.stops')}
            </Text>
          </Box>
          <Box flexDirection="row" alignItems="center">
            <MaterialCommunityIcons name="timer-outline" size={20} color="#666666" />
            <Text variant="body" color="secondary" marginLeft="s">
              {t('route.estimatedDuration', {duration: routeData.estimatedDuration || routeData.estimated_duration || 'N/A'})}
            </Text>
          </Box>
        </Box>
        <Box flexDirection="row">
          {/* Share Button */}  
          <TouchableOpacity style={{ marginRight: 16 }}>
            <Box
              width={50}
              height={ 50}
              borderRadius={25}
              justifyContent="center"
              alignItems="center"
              style={{ backgroundColor: '#F5F5F5' }}
            >
              <MaterialCommunityIcons name="share-variant" size={20} color="#666666" />
            </Box>
          </TouchableOpacity>
          
          {/* Favorite Button */}
          {isAuthenticated && (
            <TouchableOpacity onPress={toggleFavorite}>
              <Box
                width={50}
                height={50}
                borderRadius={25}
                justifyContent="center"
                alignItems="center"
                style={{ 
                  backgroundColor: isFavorite ? '#FF0000' : '#F5F5F5'
                }}
              >
                <MaterialCommunityIcons 
                  name={isFavorite ? "heart" : "heart-outline"} 
                  size={20} 
                  color={isFavorite ? "#FFFFFF" : "#FF0000"} 
                />
              </Box>
            </TouchableOpacity>
          )}
        </Box>
      </Box>

      {/* Language Selector */}
      <Box flexDirection="row" alignItems="center" marginBottom="m">
        <MaterialCommunityIcons name="web" size={20} color="#666666" />
        <Box position="relative" width={130} marginLeft="s">
          <TouchableOpacity onPress={() => setShowLanguageDropdown(!showLanguageDropdown)}>
            <Box flexDirection="row" alignItems="center" paddingHorizontal="s" paddingVertical="s" borderRadius={8} style={{ backgroundColor: '#F5F5F5' }}>
              <Text style={{ fontSize: 14, color: '#666666', marginRight: 4 }}>{currentLanguageOption.flag}</Text>
              <Text style={{ fontSize: 14, color: '#666666', marginRight: 4 }}>{currentLanguageOption.name}</Text>
              <MaterialCommunityIcons name={showLanguageDropdown ? 'chevron-up' : 'chevron-down'} size={14} color="#666666" />
            </Box>
          </TouchableOpacity>
          
          {/* Dropdown Menu */}
          {showLanguageDropdown && (
            <Box 
              position="absolute" 
              top="100%" 
              right={0} 
              marginTop="s" 
              backgroundColor="white" 
              borderRadius={8} 
              style={{ 
                shadowColor: '#000000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 4,
                zIndex: 1000,
                minWidth: 140
              }}
            >
              {languageOptions.map((option) => (
                <TouchableOpacity 
                  key={option.code} 
                  onPress={async () => {
                    await changeLanguage(option.code);
                    setShowLanguageDropdown(false);
                    // Reload route data with new language
                    await loadRouteDetails();
                  }}
                >
                  <Box 
                    flexDirection="row" 
                    alignItems="center" 
                    paddingHorizontal="m" 
                    paddingVertical="s"
                    style={{ 
                      backgroundColor: option.code === currentLanguage ? '#F0F8FF' : 'transparent' 
                    }}
                  >
                    <Text style={{ fontSize: 14, marginRight: 8 }}>{option.flag}</Text>
                    <Text style={{ fontSize: 14, color: '#1A1A1A' }}>{option.name}</Text>
                  </Box>
                </TouchableOpacity>
              ))}
            </Box>
          )}
        </Box>
      </Box>

      <Box flexDirection="row" alignItems="flex-start" marginBottom="l">
        <MaterialCommunityIcons name="book-open-page-variant-outline" size={16} color="#666666" style={{ marginTop: 2 }} />
        <Text variant="body" color="textGray" marginLeft="s" flex={1}>
          {routeData.description || 'Descrição da rota não disponível'}
        </Text>
      </Box>

      
      {/* Route Stories */}
      {routeData.stories && routeData.stories.length > 0 && (
        <Box marginBottom="l">
          {/* Route stories header */}
          <Box flexDirection="row" alignItems="center" marginBottom="m">
            <MaterialCommunityIcons name="book-open" size={16} color="#035A6E" />
            <Text 
              variant="subheader" 
              color="primary" 
              marginLeft="s"
              style={{ fontWeight: '600' }}
            >
              {t('route.stories')}
            </Text>
          </Box>
          
          <AudioStoriesPlayer 
            ref={(ref) => { audioPlayerRefs.current['route'] = ref; }}
            stories={routeData.stories as Story[]}
            currentStoryIndex={0}
            onStoryChange={(newIndex) => {
              // Story change logic if needed
            }}
            onDurationUpdate={(storyIndex, realDuration) => {
              // Update story duration when real audio duration is discovered
              if (routeData.stories[storyIndex]) {
                routeData.stories[storyIndex].durationSeconds = realDuration;
              }
            }}
            onPlayStart={() => {
              // Pause all other players when this one starts
              Object.keys(audioPlayerRefs.current).forEach(otherPlayerId => {
                if (otherPlayerId !== 'route' && audioPlayerRefs.current[otherPlayerId]) {
                  audioPlayerRefs.current[otherPlayerId]?.pause();
                }
              });
            }}
            hideLanguageSelector={true}
          />
        </Box>
      )}
      
      {/* Expandable Cities with Stories */}
      {routeData.cities.map((city: any, cityIndex: number) => {
        if (!city.stories || city.stories.length === 0) return null;
        
        const cityId = `city-${city.id || cityIndex}`;
        const isExpanded = expandedCities.has(cityId);
        const isLastCity = cityIndex === routeData.cities.length - 1;

        return (
          <Box key={cityId}>
            {/* Route path component - only show if not first city */}
            {cityIndex > 0 && (
              <Box 
                alignItems="center" 
                
                style={{ marginHorizontal: -24 }}
              >
                {/* Blue dot */}
                <Box 
                  width={16} 
                  height={16} 
                  borderRadius={8} 
                  backgroundColor="success"
                  borderWidth={2}
                  borderColor="white"
                  style={{
                    shadowColor: '#000000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.15,
                    shadowRadius: 3,
                    elevation: 3,
                    marginBottom: 4,
                    zIndex: 999999
                  }}
                />
                
                {/* Dashed line */}
                <DashLine 
                  style={{
                    width: 1,
                    height: 25,
                    flexDirection: 'column',
                    marginBottom: 4
                  }}
                  dashGap={3}
                  totalDashUnit={20}
                  dashLength={4}
                  dashThickness={5}
                  dashColor="#999999"
                />
                
                {/* Gray dot */}
                <Box 
                  width={16} 
                  height={16} 
                  borderRadius={8}  
                  backgroundColor="secondary"
                  borderWidth={2}
                  borderColor="white"
                  style={{
                    shadowColor: '#000000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.15,
                    shadowRadius: 3,
                    elevation: 3
                  }}
                />
              </Box>
            )}
            
            {/* City header - clickable to expand/collapse */}
            <TouchableOpacity onPress={() => toggleCityExpansion(cityId)}>
              <Box 
                flexDirection="row" 
                alignItems="center" 
                justifyContent="space-between" 
                paddingVertical="m"
                paddingHorizontal="l"
                style={{ 
                  borderTopWidth: 1,
                  borderTopColor: '#E0E0E0',
                  marginHorizontal: -24 // Negative margin to extend to screen edges
                }}
              >
                <Text 
                  variant="routeTitle" 
                  color="dark" 
                >
                  {city.name}
                </Text>
                <MaterialCommunityIcons 
                  name={isExpanded ? 'chevron-up' : 'chevron-down'} 
                  size={20} 
                  color="#666666" 
                />
              </Box>
            </TouchableOpacity>
            
            {/* Expanded content */}
            {isExpanded && (
              <Box 
                paddingTop="m" 
                paddingHorizontal="l" 
                paddingBottom="m"
                style={{ 
                  marginHorizontal: -24
                }}
              >
                {/* City description */}
                {city.description && (
                  <Box marginBottom="m">
                    <Text variant="body" color="textDark" lineHeight={22}>
                      {city.description}
                    </Text>
                  </Box>
                )}
                
                {/* Stories section */}
                <Box>
                  <Text 
                    variant="sectionTitle" 
                    color="dark" 
                    marginBottom="m"
                  >
                    {t('city.storiesOf', { cityName: city.name })}
                  </Text>
                  
                  <AudioStoriesPlayer 
                    ref={(ref) => { audioPlayerRefs.current[cityId] = ref; }}
                    stories={city.stories as Story[]}
                    currentStoryIndex={0}
                    onStoryChange={(newIndex) => {
                      // Story change logic if needed
                    }}
                    onDurationUpdate={(storyIndex, realDuration) => {
                      // Update story duration when real audio duration is discovered
                      const updatedStories = [...(city.stories as Story[])];
                      if (updatedStories[storyIndex]) {
                        updatedStories[storyIndex].durationSeconds = realDuration;
                      }
                    }}
                    onPlayStart={() => {
                      // Pause all other players when this one starts
                      Object.keys(audioPlayerRefs.current).forEach(otherPlayerId => {
                        if (otherPlayerId !== cityId && audioPlayerRefs.current[otherPlayerId]) {
                          audioPlayerRefs.current[otherPlayerId]?.pause();
                        }
                      });
                    }}
                    hideLanguageSelector={true}
                  />
                </Box>
                <Box marginTop="l">
                  <Text 
                    variant="sectionTitle" 
                    color="dark" 
                    marginBottom="m"
                  >
                    {t('route.WhatToObserve')}
                  </Text>
                </Box>
                <Box marginBottom="m">
                  <Text variant="body" color="textDark" lineHeight={22}>
                    {city.what_to_observe}
                  </Text>
                </Box>
              </Box>
            )}
            
            {/* Bottom border - always visible */}
            <Box 
              style={{
                borderBottomWidth: 1,
                borderBottomColor: '#E0E0E0',
                marginHorizontal: -24
              }}
            />
          </Box>
        );
      })}

      {/* Commerce and Services Section */}
      {businesses.length > 0 && (
          <>
            <Box marginTop="m" marginBottom="m">
              <Text style={{ fontSize: 20, fontWeight: '600', color: '#002043' }}>
                {t('home.businessesAndServices')}
              </Text>
            </Box>
            
            {/* Businesses Carousel */}
            <FlatList
              data={businesses}
              renderItem={({ item }) => (
                <BusinessCard 
                  item={item} 
                  showStories={true}
                  onPress={() => navigation.navigate('Others', { type: 'location', itemId: item.id.toString() })}
                />
              )}
              keyExtractor={(item, index) => `business-${index}-${item.id}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingLeft: 0, paddingRight: 16 }}
              style={{ marginBottom: 0 }}
            />
          </>
        )}

        {/* Commerce and Services Section */}
        {hosting.length > 0 && (
          <>
            <Box marginTop="s" marginBottom="m">
              <Text style={{ fontSize: 20, fontWeight: '600', color: '#002043' }}>
                {t('common.hosting')}
              </Text>
            </Box>
            
            {/* Businesses Carousel */}
            <FlatList
              data={hosting}
              renderItem={({ item }) => (
                <BusinessCard 
                  item={item} 
                  showStories={true}
                  onPress={() => navigation.navigate('Others', { type: 'location', itemId: item.id.toString() })}
                />
              )}
              keyExtractor={(item, index) => `hosting-${index}-${item.id}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingLeft: 0, paddingRight: 16 }}
              style={{ marginBottom: 0 }}
            />
          </>
        )}
    </Box>
  </ScrollView>
  );
};

export default RouteDetailScreen;

