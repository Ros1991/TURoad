import React, { useState, useEffect } from 'react';
import { ScrollView, Image, TouchableOpacity, Linking, Platform, Alert, FlatList } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import LinearGradient from 'react-native-linear-gradient';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { Box, Text, AudioStoriesPlayer, BusinessCard } from '../components';
import { useLanguageRefresh } from '../hooks/useDataRefresh';
import { getCityById } from '../services/CityService';
import { FavoriteService } from '../services/FavoriteService';
import { getBusinesses } from '../services/BusinessService';
import { City, Story, Business } from '../types';

type RootStackParamList = {
  City: { cityId: string };
  RouteDetail: { routeId: string };
};

type CityScreenNavigationProp = StackNavigationProp<RootStackParamList, 'City'>;
type CityScreenRouteProp = RouteProp<RootStackParamList, 'City'>;

const CityScreen: React.FC = () => {
  const navigation = useNavigation<CityScreenNavigationProp>();
  const route = useRoute<CityScreenRouteProp>();
  const { t } = useTranslation();
  const { isAuthenticated, user } = useAuth();
  const [city, setCity] = useState<City | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isWhatToObserveExpanded, setIsWhatToObserveExpanded] = useState(false);
  const [isAboutLocationExpanded, setIsAboutLocationExpanded] = useState(false);

  useEffect(() => {
    loadCity();
  }, []);

  // Refresh city data when language changes
  useLanguageRefresh(() => {
    console.log('🌐 CityScreen: Refreshing city data due to language change');
    loadCity();
  });



  const loadCity = async () => {
    try {
      const cityData = await getCityById(route.params.cityId);
      setCity(cityData);
      
      // Set initial favorite status from API response
      if (cityData && 'isFavorite' in cityData) {
        console.log('🤍 Setting initial favorite status:', cityData.isFavorite);
        setIsFavorite(cityData.isFavorite || false);
      } else {
        console.log('🤍 No isFavorite found in cityData, setting to false');
        setIsFavorite(false);
      }
      
      // Load businesses for this city
      await loadBusinesses();
    } catch (error) {
      console.error('Error loading city:', error);
    }
  };

  const loadBusinesses = async () => {
    try {
      const businessData = await getBusinesses();
      // For now, show all businesses (same as HomeScreen)
      // In the future, this could be filtered by city location/region
      setBusinesses(businessData);
    } catch (error) {
      console.error('Error loading businesses:', error);
    }
  };


  const toggleFavorite = async () => {
    if (!user?.id || !city) return;
    
    try {
      console.log('🤍 Toggling favorite for city:', city.id);
      
      // Optimistically update UI
      const newFavoriteState = !isFavorite;
      setIsFavorite(newFavoriteState);
      
      // Call backend API
      const result = await FavoriteService.toggleFavoriteCity(
        parseInt(user.id), 
        parseInt(city.id)
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

  const openInMaps = () => {
    if (!city) return;

    const { latitude, longitude } = city;
    
    // Check if coordinates are available
    if (!latitude || !longitude) {
      Alert.alert(
        t('common.error'),
        t('city.noCoordinatesAvailable', 'Coordenadas não disponíveis para esta cidade.'),
        [{ text: t('common.ok') }]
      );
      return;
    }

    // Create Google Maps URL
    const scheme = Platform.select({
      ios: 'maps:0,0?q=',
      android: 'geo:0,0?q='
    });
    
    const latLng = `${latitude},${longitude}`;
    const label = encodeURIComponent(city.name);
    const url = Platform.select({
      ios: `${scheme}${latLng}(${label})`,
      android: `${scheme}${latLng}(${label})`
    });

    if (!url) return;

    // Try to open in Google Maps app, fallback to browser
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          // Fallback to Google Maps web
          const webUrl = `https://www.google.com/maps/search/?api=1&query=${latLng}&query_place_id=${label}`;
          return Linking.openURL(webUrl);
        }
      })
      .catch((err) => {
        console.error('Error opening maps:', err);
        Alert.alert(
          t('common.error'),
          t('city.errorOpeningMaps', 'Não foi possível abrir o mapa.'),
          [{ text: t('common.ok') }]
        );
      });
  };

  if (!city) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center">
        <Text>{t('common.loading')}</Text>
      </Box>
    );
  }

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: 'white' }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      {/* Header with background image */}
      <Box height={300} position="relative">
        <Image
          source={{ uri: city.image }}
          style={{ width: '100%', height: '100%' }}
        />
        <Box position="absolute" top={40} left={16}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Box
              width={40}
              height={40}
              borderRadius={20}
              marginTop="m"
              backgroundColor="white"
              justifyContent="center"
              alignItems="center"
            >
              <Icon name="keyboard-backspace" size={20} color="#000" />
            </Box>
          </TouchableOpacity>
        </Box>
        
        {/* Gradient overlay for smooth transition */}
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.3)', 'rgba(255,255,255,0.8)', 'white']}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 120,
          }}
        />
      </Box>
      
      {/* City Description Card overlapping image */}
      <Box style={{ marginTop: -140 }} paddingHorizontal="m" marginBottom="l">
        <Box
          style={{ 
            backgroundColor: 'white',
            borderRadius: 16,
            borderWidth: 1,
            borderColor: '#E0E0E0',
          }}
        >
          <Box padding="m">
            <Box flexDirection="row" justifyContent="space-between" alignItems="flex-start" marginBottom="m">
              <Box flex={1}>
                <Text 
                  style={{ 
                    fontSize: 28, 
                    fontWeight: '700', 
                    color: '#1A1A1A',
                    marginBottom: 4
                  }}
                >
                  {city.name}
                </Text>
                <Text style={{ fontSize: 16, color: '#666666', marginBottom: 12 }}>
                  {city.state}
                </Text>
                <Box flexDirection="row" alignItems="center">
                  <Icon name="map-marker-outline" size={14} color="#666666" />
                  <Text style={{ fontSize: 14, color: '#666666', marginLeft: 4 }}>
                    {(parseFloat(city.distance) || 0).toFixed(1)}km {t('common.distanceAway')}
                  </Text>
                </Box>
              </Box>
              <Box flexDirection="row" alignItems="center">
                <TouchableOpacity style={{ marginRight: 16 }}>
                  <Box
                    width={40}
                    height={40}
                    borderRadius={20}
                    justifyContent="center"
                    alignItems="center"
                    style={{ backgroundColor: '#F5F5F5' }}
                  >
                    <Icon name="share-variant" size={18} color="#666666" />
                  </Box>
                </TouchableOpacity>
                {isAuthenticated && (
                  <TouchableOpacity onPress={toggleFavorite}>
                    <Box
                      width={40}
                      height={40}
                      borderRadius={20}
                      justifyContent="center"
                      alignItems="center"
                      style={{ 
                        backgroundColor: isFavorite ? '#FF0000' : '#F5F5F5'
                      }}
                    >
                      <Icon 
                        name={isFavorite ? "heart" : "heart-outline"} 
                        as any 
                        size={20} 
                        color={isFavorite ? "#FFFFFF" : "#FF0000"} 
                      />
                    </Box>
                  </TouchableOpacity>
                )}
              </Box>
            </Box>
            
            {/* Audio Player Component */}
            {(city.stories as Story[]).length > 0 && (
              <AudioStoriesPlayer 
                stories={city.stories as Story[]}
                currentStoryIndex={currentStoryIndex}
                onStoryChange={setCurrentStoryIndex}
                onDurationUpdate={(storyIndex, realDuration) => {
                  // Update story duration when real audio duration is discovered
                  const updatedStories = [...(city.stories as Story[])];
                  if (updatedStories[storyIndex]) {
                    updatedStories[storyIndex].durationSeconds = realDuration;
                  }
                }}
              />
            )}
            
            {/* Navigation Buttons at bottom of card */}
            <Box flexDirection="row" justifyContent="space-between" alignItems="center" marginTop="l" paddingTop="m" style={{ borderTopWidth: 1, borderTopColor: '#F0F0F0' }}>
              <TouchableOpacity style={{ flex: 1, marginRight: 8 }} onPress={openInMaps}>
                <Box
                  flexDirection="row"
                  alignItems="center"
                  justifyContent="center"
                  paddingVertical="m"
                  borderRadius={8}
                  style={{ backgroundColor: '#F8F9FA', borderWidth: 1, borderColor: '#E9ECEF' }}
                >
                  <Icon name="map-outline" size={16} color="#666666" />
                  <Text style={{ fontSize: 14, color: '#666666', marginLeft: 8, fontWeight: '500' }}>{t('city.viewOnMap')}</Text>
                </Box>
              </TouchableOpacity>
              <TouchableOpacity style={{ flex: 1, marginLeft: 8 }}>
                <Box
                  flexDirection="row"
                  alignItems="center"
                  justifyContent="center"
                  paddingVertical="m"
                  borderRadius={8}
                  style={{ backgroundColor: '#035A6E' }}
                >
                  <Icon name="arrow-left" as any size={24} color="white" />
                  <Text style={{ fontSize: 14, color: 'white', marginLeft: 8, fontWeight: '500' }}>{t('city.route')}</Text>
                </Box>
              </TouchableOpacity>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Expander Cards Below Main Card */}
      <Box paddingHorizontal="m">        
        {/* O que há para observar? Card */}
        {city.whattoobserve && (
          <Box
          style={{ 
            backgroundColor: 'white',
            borderRadius: 16,
            borderWidth: 1,
            borderColor: '#E0E0E0',
            marginBottom: 16
          }}
        >
          <TouchableOpacity 
            onPress={() => setIsWhatToObserveExpanded(!isWhatToObserveExpanded)}
            style={{ padding: 16 }}
          >
            <Box flexDirection="row" justifyContent="space-between" alignItems="center">
              <Text style={{ fontSize: 18, fontWeight: '600', color: '#1A1A1A', flex: 1 }}>
                {t('city.whatToObserve')}
              </Text>
              <Icon 
                name={isWhatToObserveExpanded ? "chevron-up" : "chevron-down"} 
                size={24} 
                color="#666666" 
              />
            </Box>
          </TouchableOpacity>
          {isWhatToObserveExpanded && (
            <Box paddingHorizontal="m" paddingBottom="m">
              <Box style={{ borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 12 }}>
                <Text style={{ fontSize: 16, color: '#333333', lineHeight: 24 }}>
                  {city.whattoobserve || "Dados não disponíveis"}
                </Text>
              </Box>
            </Box>
          )}
        </Box>
        )}

        {/* Sobre o local Card */}
        {city.description && city.description.trim() && (
          <Box
            style={{ 
              backgroundColor: 'white',
              borderRadius: 16,
              borderWidth: 1,
              borderColor: '#E0E0E0',
              marginBottom: 16
            }}
          >
            <TouchableOpacity 
              onPress={() => setIsAboutLocationExpanded(!isAboutLocationExpanded)}
              style={{ padding: 16 }}
            >
              <Box flexDirection="row" justifyContent="space-between" alignItems="center">
                <Text style={{ fontSize: 18, fontWeight: '600', color: '#1A1A1A', flex: 1 }}>
                  {t('city.aboutLocation')}
                </Text>
                <Icon 
                  name={isAboutLocationExpanded ? "chevron-up" : "chevron-down"} 
                  size={24} 
                  color="#666666" 
                />
              </Box>
            </TouchableOpacity>
            {isAboutLocationExpanded && (
              <Box paddingHorizontal="m" paddingBottom="m">
                <Box style={{ borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 12 }}>
                  <Text style={{ fontSize: 16, color: '#333333', lineHeight: 24 }}>
                    {city.description}
                  </Text>
                </Box>
              </Box>
            )}
          </Box>
        )}

        {/* Commerce and Services Section */}
        {businesses.length > 0 && (
          <>
            <Box marginTop="l" marginBottom="m">
              <Text style={{ fontSize: 20, fontWeight: '600', color: '#002043' }}>
                {t('home.businessesAndServices')}
              </Text>
            </Box>
            
            {/* Businesses Carousel */}
            <FlatList
              data={businesses}
              renderItem={({ item }) => <BusinessCard item={item} showStories={true}/>}
              keyExtractor={(item, index) => `business-${index}-${item.id}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingLeft: 0, paddingRight: 16 }}
              style={{ marginBottom: 24 }}
            />
          </>
        )}
      </Box>

      {/* Extra padding at bottom for better scrolling */}
      <Box paddingBottom="xl" />
    </ScrollView>
  );
};

export default CityScreen;

