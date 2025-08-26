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
import { getEventById } from '../services/EventService';
import { getPlaceById } from '../services/HistoricalPlaceService';
import { Event, HistoricalPlace, Business, Story } from '@/types';
import { getBusinesses, getHosting } from '@/services/BusinessService';

type ItemType = 'event' | 'location';
type ItemData = Event | HistoricalPlace;

type RootStackParamList = {
  Others: { type: ItemType; itemId: string };
  RouteDetail: { routeId: string };
};

type OthersScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Others'>;
type OthersScreenRouteProp = RouteProp<RootStackParamList, 'Others'>;

const OthersScreen: React.FC = () => {
  const navigation = useNavigation<OthersScreenNavigationProp>();
  const route = useRoute<OthersScreenRouteProp>();
  const { t } = useTranslation();
  const [item, setItem] = useState<ItemData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [hosting, setHosting] = useState<Business[]>([]);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);


  const { type, itemId } = route.params;

  useEffect(() => {
    loadItem();
  }, []);

  // Refresh item data when language changes
  useLanguageRefresh(() => {
    console.log('🌐 OthersScreen: Refreshing item data due to language change');
    loadItem();
  });

  const loadItem = async () => {
    try {
      setLoading(true);
      let itemData: ItemData | null = null;

      if (type === 'event') {
        itemData = await getEventById(itemId);
      } else if (type === 'location') {
        itemData = await getPlaceById(itemId);
      }

      setItem(itemData);
      await loadBusinesses(itemData);
      await loadHosting(itemData);
      
    } catch (error) {
      console.error('Error loading item:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const loadBusinesses = async (itemData: ItemData | null) => {
      try {
        if (!itemData || !('cityId' in itemData)) return;
        const businessData = await getBusinesses(undefined, (itemData as HistoricalPlace).cityId.toString(), itemData.id);
        setBusinesses(businessData);
      } catch (error) {
        console.error('Error loading businesses:', error);
      }
    };
  
  const loadHosting = async (itemData: ItemData | null) => {
      try {
        if (!itemData || !('cityId' in itemData)) return;
        const hostingData = await getHosting(undefined, (itemData as HistoricalPlace).cityId.toString(), itemData.id);
        setHosting(hostingData);
      } catch (error) {
        console.error('Error loading hosting:', error);
      }
    };

  const openInMaps = () => {
    if (!item || !('location' in item)) return;

    // For events, use the location field
    // For historical places, we might need coordinates
    const locationText = item.location;
    
    if (!locationText) {
      Alert.alert(
        t('common.error'),
        t('others.noLocationAvailable', 'Localização não disponível.'),
        [{ text: t('common.ok') }]
      );
      return;
    }

    const encodedLocation = encodeURIComponent(locationText);
    const url = Platform.select({
      ios: `maps:0,0?q=${encodedLocation}`,
      android: `geo:0,0?q=${encodedLocation}`
    });

    if (!url) return;

    // Try to open in Maps app, fallback to browser
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          // Fallback to Google Maps web
          const webUrl = `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;
          return Linking.openURL(webUrl);
        }
      })
      .catch((err) => {
        console.error('Error opening maps:', err);
        Alert.alert(
          t('common.error'),
          t('others.errorOpeningMaps', 'Não foi possível abrir o mapa.'),
          [{ text: t('common.ok') }]
        );
      });
  };

  const getItemName = () => {
    if (!item) return '';
    if ('nameTranslations' in item) {
      return item.nameTranslations.pt || item.name;
    }
    return (item as any).name || '';
  };

  const getItemDescription = () => {
    if (!item) return '';
    return item.description;
  };

  const getItemLocation = () => {
    return type === 'event'? (item as Event)?.location : (parseFloat((item as HistoricalPlace).distance) || 0).toFixed(1) + 'km ' + t('common.distanceAway');
  };

  if (loading) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center">
        <Text>{t('common.loading')}</Text>
      </Box>
    );
  }

  if (error || !item) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center">
        <Text>{t('common.error')}</Text>
        <Text>{error || t('others.itemNotFound')}</Text>
      </Box>
    );
  }

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: 'white' }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 20 }}
    >
      {/* Header with background image */}
      <Box height={300} position="relative">
        <Image
          source={{ uri: item.image }}
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
      
      {/* Item Description Card overlapping image */}
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
                    fontSize: 20, 
                    fontWeight: '700', 
                    color: '#002043',
                    marginBottom: 4
                  }}
                >
                  {getItemName()}
                </Text>
                
                {/* City and State info */}
                <Text style={{ fontSize: 16, color: '#666666', marginBottom: type === 'event' ? 4 : 12 }}>
                  {(() => {
                    const city = type === 'event' ? (item as Event).city : (item as HistoricalPlace | Business).city;
                    const state = type === 'event' ? (item as Event).state : (item as HistoricalPlace | Business).state;
                    console.log('DEBUG - City:', city, 'State:', state, 'Item:', JSON.stringify(item, null, 2));
                    
                    if (city && state) {
                      return `${city}, ${state}`;
                    } else if (city) {
                      return city;
                    } else if (state) {
                      return state;
                    } else {
                      return type === 'event' ? 'Evento' : 'Local Histórico';
                    }
                  })()}
                </Text>
                

                
                <Box flexDirection="row" alignItems="center"  marginBottom="m">
                  <Icon name="map-marker-outline" size={14} color="#666666" />
                  <Text style={{ fontSize: 14, color: '#666666', marginLeft: 4 }}>
                    {getItemLocation()}
                  </Text>
                </Box>
                {type === 'event' && (
                  <Box flexDirection="row" alignItems="center" marginBottom="m">
                    <Icon name="calendar" size={14} color="#666666" />
                    <Text style={{ fontSize: 14, color: '#666666', marginLeft: 4 }}>
                      {(item as Event).time}
                    </Text>
                  </Box>
                )}
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
              </Box>
            </Box>
            
            {/* Audio Player Component - if stories exist */}
            {('stories' in item && item.stories && Array.isArray(item.stories) && item.stories.length > 0) ? (
              <AudioStoriesPlayer 
                stories={item.stories as Story[]}
                currentStoryIndex={currentStoryIndex}
                onStoryChange={setCurrentStoryIndex}
                onDurationUpdate={(storyIndex, realDuration) => {
                  // Update story duration when real audio duration is discovered
                  const updatedStories = [...(item.stories as Story[])];
                  if (updatedStories[storyIndex]) {
                    updatedStories[storyIndex].durationSeconds = realDuration;
                  }
                }}
              />
            ) : null}
            
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
                  <Text style={{ fontSize: 14, color: '#666666', marginLeft: 8, fontWeight: '500' }}>
                    {t('others.viewOnMap')}
                  </Text>
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
                  <Icon name="information-outline" size={16} color="white" />
                  <Text style={{ fontSize: 14, color: 'white', marginLeft: 8, fontWeight: '500' }}>
                    {t('others.moreInfo')}
                  </Text>
                </Box>
              </TouchableOpacity>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Expander Cards Below Main Card */}
      <Box paddingHorizontal="m">        
        {/* Description Card */}
        {getItemDescription() && (
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
              onPress={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
              style={{ padding: 16 }}
            >
              <Box flexDirection="row" justifyContent="space-between" alignItems="center">
                <Text style={{ fontSize: 18, fontWeight: '600', color: '#1A1A1A', flex: 1 }}>
                  {type === 'event' ? t('others.aboutEvent') : t('others.aboutLocation')}
                </Text>
                <Icon 
                  name={isDescriptionExpanded ? "chevron-up" : "chevron-down"} 
                  size={24} 
                  color="#666666" 
                />
              </Box>
            </TouchableOpacity>
            {isDescriptionExpanded && (
              <Box paddingHorizontal="m" paddingBottom="m">
                <Box style={{ borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 12 }}>
                  <Text style={{ fontSize: 16, color: '#333333', lineHeight: 24 }}>
                    {getItemDescription()}
                  </Text>
                </Box>
              </Box>
            )}
          </Box>
        )}
        {/* Commerce and Services Section */}
        {businesses.length > 0 && (
          <>
            <Box marginTop="m" marginBottom="m">
              <Text style={{ fontSize: 20, fontWeight: '600', color: '#002043' }}>
                {t('others.nearbyBusinesses')}
              </Text>
            </Box>
            
            {/* Businesses Carousel */}
            <FlatList
              data={businesses}
              renderItem={({ item }) => (
                <BusinessCard 
                  item={item} 
                  showStories={true}
                  onPress={() => navigation.push('Others', { type: 'location', itemId: item.id.toString() })}
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
                {t('others.nearbyHosting')}
              </Text>
            </Box>
            
            {/* Businesses Carousel */}
            <FlatList
              data={hosting}
              renderItem={({ item }) => (
                <BusinessCard 
                  item={item} 
                  showStories={true}
                  onPress={() => navigation.push('Others', { type: 'location', itemId: item.id.toString() })}
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

export default OthersScreen;
