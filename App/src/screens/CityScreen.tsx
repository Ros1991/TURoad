import React, { useState, useEffect } from 'react';
import { ScrollView, Image, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Box, Text, Button, Card } from '../components';
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
  const [isPlaying, setIsPlaying] = useState(false);
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({});
  const [selectedLanguage, setSelectedLanguage] = useState<'pt' | 'en' | 'es'>('pt');
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

  const languageOptions = [
    { code: 'pt' as const, flag: '🇧🇷', name: 'Português' },
    { code: 'en' as const, flag: '🇺🇸', name: 'English' },
    { code: 'es' as const, flag: '🇪🇸', name: 'Español' }
  ];

  const currentLanguage = languageOptions.find(lang => lang.code === selectedLanguage) || languageOptions[0];

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
                      <Icon name="heart-outline" size={18} color="#FF3B30" />
                    </Box>
                  </TouchableOpacity>
                </Box>
              </Box>
              
              {/* Audio Player */}
              {city.stories.length > 0 && (
                <Box>
                  <Box flexDirection="row" alignItems="center" justifyContent="center" marginBottom="m">
                    <TouchableOpacity>
                      <Box
                        width={40}
                        height={40}
                        borderRadius={20}
                        justifyContent="center"
                        alignItems="center"
                        marginRight="m"
                        style={{ backgroundColor: '#E0E0E0' }}
                      >
                        <Icon name="skip-previous" size={16} color="#666666" />
                      </Box>
                    </TouchableOpacity>
                    
                    <TouchableOpacity onPress={() => setIsPlaying(!isPlaying)}>
                      <Box
                        width={50}
                        height={50}
                        borderRadius={25}
                        justifyContent="center"
                        alignItems="center"
                        marginHorizontal="m"
                        style={{ backgroundColor: '#035A6E' }}
                      >
                        <Icon name={isPlaying ? 'pause' : 'play'} size={20} color="white" />
                      </Box>
                    </TouchableOpacity>
                    
                    <TouchableOpacity>
                      <Box
                        width={40}
                        height={40}
                        borderRadius={20}
                        justifyContent="center"
                        alignItems="center"
                        marginLeft="m"
                        style={{ backgroundColor: '#E0E0E0' }}
                      >
                        <Icon name="skip-next" size={16} color="#666666" />
                      </Box>
                    </TouchableOpacity>
                  </Box>
                  
                  {/* Progress Bar */}
                  <Box marginBottom="s">
                    <Box height={4} borderRadius={2} style={{ backgroundColor: '#E0E0E0' }}>
                      <Box width="40%" height="100%" borderRadius={2} style={{ backgroundColor: '#035A6E' }} />
                    </Box>
                    <Box flexDirection="row" justifyContent="space-between" style={{ marginTop: 4 }}>
                      <Text style={{ fontSize: 12, color: '#666666' }}>1:46</Text>
                      <Text style={{ fontSize: 12, color: '#666666' }}>3:40</Text>
                    </Box>
                  </Box>
                  
                  {/* Stories Section */}
                  <Box>
                    <Box flexDirection="row" alignItems="center" justifyContent="space-between" marginBottom="s">
                      <Text style={{ fontSize: 18, fontWeight: '600', color: '#1A1A1A' }}>
                        Histórias
                      </Text>
                      <Box position="relative">
                        <TouchableOpacity onPress={() => setShowLanguageDropdown(!showLanguageDropdown)}>
                          <Box flexDirection="row" alignItems="center" paddingHorizontal="s" paddingVertical="s" borderRadius={8} style={{ backgroundColor: '#F5F5F5' }}>
                            <Icon name="web" size={14} color="#666666" />
                            <Text style={{ fontSize: 14, color: '#666666', marginLeft: 4, marginRight: 4 }}>{currentLanguage.flag}</Text>
                            <Text style={{ fontSize: 14, color: '#666666', marginRight: 4 }}>{currentLanguage.name}</Text>
                            <Icon name={showLanguageDropdown ? 'chevron-up' : 'chevron-down'} size={14} color="#666666" />
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
                              shadowColor: '#000',
                              shadowOffset: { width: 0, height: 2 },
                              shadowOpacity: 0.15,
                              shadowRadius: 8,
                              elevation: 5,
                              zIndex: 1000,
                              minWidth: 140
                            }}
                          >
                            {languageOptions.map((option) => (
                              <TouchableOpacity 
                                key={option.code} 
                                onPress={() => {
                                  setSelectedLanguage(option.code);
                                  setShowLanguageDropdown(false);
                                }}
                              >
                                <Box 
                                  flexDirection="row" 
                                  alignItems="center" 
                                  paddingHorizontal="m" 
                                  paddingVertical="s"
                                  style={{ 
                                    backgroundColor: option.code === selectedLanguage ? '#F0F8FF' : 'transparent' 
                                  }}
                                >
                                  <Text style={{ fontSize: 14, marginRight: 8 }}>{option.flag}</Text>
                                  <Text style={{ 
                                    fontSize: 14, 
                                    color: option.code === selectedLanguage ? '#035A6E' : '#1A1A1A',
                                    fontWeight: option.code === selectedLanguage ? '500' : '400'
                                  }}>
                                    {option.name}
                                  </Text>
                                  {option.code === selectedLanguage && (
                                    <Icon name="check" size={14} color="#035A6E" style={{ marginLeft: 'auto' }} />
                                  )}
                                </Box>
                              </TouchableOpacity>
                            ))}
                          </Box>
                        )}
                      </Box>
                    </Box>
                    
                    {/* Story List */}
                    {city.stories.map((story, index) => (
                      <Box key={story.id} marginBottom="s">
                        <Box flexDirection="row" alignItems="center" justifyContent="space-between">
                          <Box flexDirection="row" alignItems="center" flex={1}>
                            <Box
                              width={4}
                              height={4}
                              borderRadius={2}
                              marginRight="s"
                              style={{ backgroundColor: index === 0 ? '#035A6E' : '#E0E0E0' }}
                            />
                            <Box flex={1}>
                              <Text style={{ 
                                fontSize: 14, 
                                color: index === 0 ? '#035A6E' : '#1A1A1A',
                                fontWeight: index === 0 ? '500' : '400'
                              }}>
                                {story.titleTranslations ? story.titleTranslations[selectedLanguage] : story.title}
                              </Text>
                              <Text style={{ fontSize: 12, color: '#666666' }}>
                                Contada por {story.narrator}
                              </Text>
                            </Box>
                          </Box>
                          <Text style={{ fontSize: 12, color: '#666666' }}>
                            {story.duration}
                          </Text>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
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
                    <Icon name="map-marker-path" size={16} color="white" />
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

