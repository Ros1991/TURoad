import React, { useState, useEffect } from 'react';
import { ScrollView, Image, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import LinearGradient from 'react-native-linear-gradient';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { Box, Text, Button, AudioStoriesPlayer } from '../components';
import { getCityById } from '../services/CityService';
import { City } from '../types';

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
  const [city, setCity] = useState<City | null>(null);
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    loadCity();
  }, []);



  const loadCity = async () => {
    try {
      const cityData = await getCityById(route.params.cityId);
      setCity(cityData);
    } catch (error) {
      console.error('Error loading city:', error);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (!city) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center">
        <Text>{t('common.loading')}</Text>
      </Box>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: 'white' }}>
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
        
        {/* City Description Card overlapping image */}
        <Box position="absolute" top={160} left={16} right={16}>
          <Box
            style={{ 
              backgroundColor: 'white',
              borderRadius: 16,
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 4,
              },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 8,
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
                      A {city.totalDistance} de distância
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
                  <TouchableOpacity>
                    <Box
                      width={40}
                      height={40}
                      borderRadius={20}
                      justifyContent="center"
                      alignItems="center"
                      style={{ backgroundColor: '#F5F5F5' }}
                    >
                      <Icon name="heart-outline" as any size={20} color="white" />
                    </Box>
                  </TouchableOpacity>
                </Box>
              </Box>
              
              {/* Audio Player Component */}
              {city.stories.length > 0 && (
                <AudioStoriesPlayer 
                  title="Histórias" 
                  stories={city.stories}
                />
              )}
              
              {/* Navigation Buttons at bottom of card */}
              <Box flexDirection="row" justifyContent="space-between" alignItems="center" marginTop="l" paddingTop="m" style={{ borderTopWidth: 1, borderTopColor: '#F0F0F0' }}>
                <TouchableOpacity style={{ flex: 1, marginRight: 8 }}>
                  <Box
                    flexDirection="row"
                    alignItems="center"
                    justifyContent="center"
                    paddingVertical="m"
                    borderRadius={8}
                    style={{ backgroundColor: '#F8F9FA', borderWidth: 1, borderColor: '#E9ECEF' }}
                  >
                    <Icon name="map-outline" size={16} color="#666666" />
                    <Text style={{ fontSize: 14, color: '#666666', marginLeft: 8, fontWeight: '500' }}>Ver no mapa</Text>
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
                    <Text style={{ fontSize: 14, color: 'white', marginLeft: 8, fontWeight: '500' }}>Rota</Text>
                  </Box>
                </TouchableOpacity>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </ScrollView>
  );
};

export default CityScreen;

