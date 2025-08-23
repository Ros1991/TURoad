import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ScrollView, Image, TouchableOpacity, FlatList, Modal, TextInput, RefreshControl, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Box, Text, Card, Input } from '../components';
import { useLanguageRefresh } from '../hooks/useDataRefresh';
import { getCategories, getRoutes } from '../services/RouteService';
import { getCities } from '../services/CityService';
import { getEvents } from '../services/EventService';
import { getBusinesses } from '../services/BusinessService';
import { getHistoricalPlaces } from '../services/HistoricalPlaceService';
import { Category, Route, City, Event, Business, HistoricalPlace } from '../types';

type RootStackParamList = {
  Home: undefined;
  SelectCity: undefined;
  RouteDetail: { routeId: string };
  City: { cityId: string };
};

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

// Generate instance ID outside component to detect true re-creation
const generateInstanceId = () => Math.random().toString(36).substr(2, 9);

const HomeScreen: React.FC = () => {
  const instanceId = useRef(generateInstanceId());
  
  // Only log if it's a NEW instance (not just re-render)
  const hasLogged = useRef(false);
  if (!hasLogged.current) {
    hasLogged.current = true;
  }
  
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { t, i18n } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [historicalPlaces, setHistoricalPlaces] = useState<HistoricalPlace[]>([]);
  
  // Estados para o modal de busca de cidades
  const [isCitySearchModalVisible, setIsCitySearchModalVisible] = useState(false);
  const [citySearchText, setCitySearchText] = useState('');
  const [citySearchResults, setCitySearchResults] = useState<City[]>([]);
  const [allCities, setAllCities] = useState<City[]>([]);
  const [recentSearches, setRecentSearches] = useState<Array<{text: string, cityId: string, cityName: string}>>([]);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadData();
    loadRecentSearches();
    // Cleanup function para detectar quando instância é destruída
    return () => {
    };
  }, []);

  // Refresh data when language changes
  useLanguageRefresh(() => {
    loadData();
  });

  const loadData = async () => {
    try {
      // Obter idioma atual da aplicação
      const currentLanguage = i18n.language || 'pt';
      
      // Load categories first
      try {
        const categoriesData = await getCategories();
        setCategories(categoriesData || []);
      } catch (error) {
        console.error('❌ Error loading categories:', error);
      }

      // Load routes
      try {
        const routesData = await getRoutes();
        setRoutes(routesData || []);
      } catch (error) {
        console.error('❌ Error loading routes:', error);
      }

      // Load cities
      try {
        const citiesData = await getCities();
        setCities(citiesData || []);
        setAllCities(citiesData || []);
      } catch (error) {
        console.error('❌ Error loading cities:', error);
      }

      // Load events
      try {
        const eventsData = await getEvents();
        setEvents(eventsData || []);
      } catch (error) {
        console.error('❌ Error loading events:', error);
      }

      // Load businesses
      try {
        const businessesData = await getBusinesses();
        setBusinesses(businessesData || []);
      } catch (error) {
        console.error('❌ Error loading businesses:', error);
      }

      // Load historical places
      try {
        const historicalPlacesData = await getHistoricalPlaces();
        setHistoricalPlaces(historicalPlacesData || []);
      } catch (error) {
        console.error('❌ Error loading historical places:', error);
      }

    } catch (error) {
      console.error('❌ Error loading data:', error);
    }
  };

  const renderCategory = ({ item }: { item: Category }) => {
    if (!item) return null;
    
    return (
      <TouchableOpacity style={{ marginRight: 16 }}>
        <Box alignItems="center">
          <Image
            source={{ uri: item.image }}
            style={{ width: 80, height: 80, borderRadius: 40, marginBottom: 8 }}
          />
          <Text style={{ fontSize: 12, color: 'black', textAlign: 'center' }}>
            {item.name || 'Categoria'}
          </Text>
        </Box>
      </TouchableOpacity>
    );
  };

  const renderRoute = ({ item }: { item: Route }) => {
    if (!item) return null;
    
    // Aplicar tradução baseada no idioma atual
    const currentLanguage = i18n.language || 'pt';
    const routeTitle = item.titleTranslations?.[currentLanguage as keyof typeof item.titleTranslations] || item.title || 'Rota sem nome';
    const routeDescription = item.descriptionTranslations?.[currentLanguage as keyof typeof item.descriptionTranslations] || item.description || 'Descrição não disponível';
    
    // Buscar categorias traduzidas
    const routeCategories = (item.categories || []).map(categoryId => {
      const category = categories.find(cat => cat.id === categoryId);
      return category ? (category.nameTranslations?.[currentLanguage as keyof typeof category.nameTranslations] || category.name) : '';
    }).filter(Boolean);

    return (
      <TouchableOpacity 
        style={{
          width: 300,
          marginRight: 20,
          backgroundColor: 'white',
          borderRadius: 12,
          overflow: 'hidden'
        }}
        onPress={() => navigation.navigate('RouteDetail', { routeId: item.id })}
      >
        {/* Imagem ocupando todo o topo */}
        <Image
          source={{ uri: item.image }}
          style={{ 
            width: 300, 
            height: 285, 
            borderTopLeftRadius: 12, 
            borderTopRightRadius: 12,
            borderBottomLeftRadius: 12, 
            borderBottomRightRadius: 12 ,
            marginBottom: 12
          }}
        />
        
        {/* Conteúdo com padding */}
        <Box>
          {/* Título */}
          <Text 
            style={{
              fontFamily: 'Asap',
              fontSize: 21,
              color: 'black',
              fontWeight: 'bold',
              marginBottom: 8
            }}
          >
            {routeTitle}
          </Text>
          
          {/* Badges de categorias */}
          <Box flexDirection="row" flexWrap="wrap" marginBottom="s">
            {routeCategories.map((categoryName, index) => (
              <Box
                key={index}
                style={{
                  backgroundColor: '#E6E6E6',
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 12,
                  marginRight: 6,
                  marginBottom: 6
                }}
              >
                <Text
                  style={{
                    fontFamily: 'Asap',
                    fontSize: 16,
                    color: '#444444'
                  }}
                >
                  {categoryName}
                </Text>
              </Box>
            ))}
          </Box>
          
          {/* Descrição */}
          <Text 
            style={{
              fontFamily: 'Asap',
              fontSize: 16,
              color: '#1E1E1E',
              marginBottom: 12,
              lineHeight: 22
            }}
          >
            {routeDescription}
          </Text>
          
          {/* Quantitativos - cada um em uma linha */}
          <Box>
            {/* Cidades */}
            <Box flexDirection="row" alignItems="center" marginBottom="s">
              <Icon name="map-marker-outline" as any size={16} color="#5A5A5A"/>
              <Text
                style={{
                  fontFamily: 'Asap',
                  fontSize: 16,
                  color: '#5A5A5A',
                  marginLeft: 4
                }}
              >
                {item.stops || 0} {t('home.cities')}
              </Text>
            </Box>
            
            {/* Distância */}
            <Box flexDirection="row" alignItems="center" marginBottom="s">
              <Icon name="map-marker-path" as any size={16} color="#5A5A5A"/>
              <Text
                style={{
                  fontFamily: 'Asap',
                  fontSize: 16,
                  color: '#5A5A5A',
                  marginLeft: 4
                }}
              >
                {item.totalDistance}
              </Text>
            </Box>
            
            {/* Histórias em áudio */}
            <Box flexDirection="row" alignItems="center">
              <Icon name="headphones" as any size={16} color="#5A5A5A"/>
              <Text
                style={{
                  fontFamily: 'Asap',
                  fontSize: 16,
                  color: '#5A5A5A',
                  marginLeft: 4
                }}
              >
                {item.stories || 0} {t('home.audioStories')}
              </Text>
            </Box>
          </Box>
        </Box>
      </TouchableOpacity>
    );
  };

  const renderCity = ({ item }: { item: City }) => {
    if (!item) return null;
    
    // Aplicar tradução baseada no idioma atual
    const currentLanguage = i18n.language || 'pt';
    const cityDescription = item.descriptionTranslations?.[currentLanguage as keyof typeof item.descriptionTranslations] || 'Descrição não disponível';

    return (
      <TouchableOpacity 
        style={{
          width: 300,
          marginRight: 20,
          backgroundColor: 'white',
          borderRadius: 12,
          overflow: 'hidden'
        }}
        onPress={() => navigation.navigate('City', { cityId: item.id })}
      >
        {/* Imagem ocupando todo o topo */}
        <Image
          source={{ uri: item.image }}
          style={{ 
            width: 300, 
            height: 285, 
            borderTopLeftRadius: 12, 
            borderTopRightRadius: 12,
            borderBottomLeftRadius: 12, 
            borderBottomRightRadius: 12,
            marginBottom: 12
          }}
        />
        
        {/* Conteúdo */}
        <Box>
          {/* Título */}
          <Text 
            style={{
              fontFamily: 'Asap',
              fontSize: 21,
              color: 'black',
              fontWeight: 'bold',
              marginBottom: 8
            }}
          >
            {item.name || 'Cidade'}, {item.state || 'Estado'}
          </Text>
          
          {/* Descrição */}
          <Text 
            style={{
              fontFamily: 'Asap',
              fontSize: 16,
              color: '#1E1E1E',
              marginBottom: 12,
              lineHeight: 22
            }}
          >
            {cityDescription}
          </Text>
          
          {/* Quantitativos - cada um em uma linha */}
          <Box>
            {/* Distância */}
            <Box flexDirection="row" alignItems="center" marginBottom="s">
              <Icon name="map-marker-outline" as any size={16} color="#5A5A5A"/>
              <Text
                style={{
                  fontFamily: 'Asap',
                  fontSize: 16,
                  color: '#5A5A5A',
                  marginLeft: 4
                }}
              >
                {item.totalDistance}
              </Text>
            </Box>
            
            {/* Histórias em áudio */}
            <Box flexDirection="row" alignItems="center">
              <Icon name="headphones" as any size={16} color="#5A5A5A"/>
              <Text
                style={{
                  fontFamily: 'Asap',
                  fontSize: 16,
                  color: '#5A5A5A',
                  marginLeft: 4
                }}
              >
                {(item.stories || []).length} {t('home.audioStories')}
              </Text>
            </Box>
          </Box>
        </Box>
      </TouchableOpacity>
    );
  };

  // Funções para gerenciar buscas recentes
  const loadRecentSearches = async () => {
    try {
      // Verificar se AsyncStorage está disponível
      if (AsyncStorage && typeof AsyncStorage.getItem === 'function') {
        const saved = await AsyncStorage.getItem('recentCitySearches');
        if (saved) {
          setRecentSearches(JSON.parse(saved));
        }
      } else {
        console.log('AsyncStorage not available, using session storage only');
      }
    } catch (error) {
      console.error('Error loading recent searches:', error);
    }
  };

  const saveRecentSearch = async (text: string, cityId: string, cityName: string) => {
    try {
      const newSearch = { text, cityId, cityName };
      const updatedSearches = [newSearch, ...recentSearches.filter(s => s.cityId !== cityId)].slice(0, 5); // Máximo 5 buscas recentes
      setRecentSearches(updatedSearches);
      
      // Tentar salvar no AsyncStorage se disponível
      if (AsyncStorage && typeof AsyncStorage.setItem === 'function') {
        await AsyncStorage.setItem('recentCitySearches', JSON.stringify(updatedSearches));
      } else {
        console.log('AsyncStorage not available, storing in session only');
      }
    } catch (error) {
      console.error('Error saving recent search:', error);
    }
  };

  // Função de busca de cidades com debounce
  const searchCities = useCallback((searchText: string) => {
    const currentLanguage = i18n.language || 'pt';
    
    if (!searchText.trim()) {
      setCitySearchResults([]);
      return;
    }

    const filteredCities = allCities.filter(city => {
      const cityName = city.name.toLowerCase();
      const cityState = city.state.toLowerCase();
      const searchLower = searchText.toLowerCase();
      
      // Buscar também na descrição traduzida
      const cityDescription = city.descriptionTranslations?.[currentLanguage as keyof typeof city.descriptionTranslations]?.toLowerCase() || '';
      
      return cityName.includes(searchLower) || 
             cityState.includes(searchLower) || 
             cityDescription.includes(searchLower);
    });

    setCitySearchResults(filteredCities.slice(0, 8)); // Limitar a 8 resultados
  }, [allCities, i18n.language]);

  // Função para lidar com a mudança no texto de busca com debounce
  const handleCitySearchTextChange = useCallback((text: string) => {
    setCitySearchText(text);
    
    // Limpar o timer anterior
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    // Configurar novo timer de debounce (1 segundo)
    debounceTimer.current = setTimeout(() => {
      searchCities(text);
    }, 1000);
  }, [searchCities]);

  // Função para abrir o modal de busca
  const openCitySearchModal = () => {
    setIsCitySearchModalVisible(true);
    setCitySearchText('');
    setCitySearchResults([]);
  };

  // Função para fechar o modal de busca
  const closeCitySearchModal = () => {
    setIsCitySearchModalVisible(false);
    setCitySearchText('');
    setCitySearchResults([]);
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
  };

  // Função para lidar com a seleção de uma cidade
  const handleCitySelection = (city: City) => {
    // Salvar busca recente
    if (citySearchText.trim()) {
      saveRecentSearch(citySearchText, city.id, `${city.name}, ${city.state}`);
    }
    closeCitySearchModal();
    // TODO: Navegar para a tela da cidade quando implementada
    console.log('Selected city:', city.name, city.state);
  };

  // Renderizar categorias (tamanho 150px)
  const renderCategoryByRoute = ({ item }: { item: Category }) => {
    if (!item) return null;
    
    const currentLanguage = i18n.language || 'pt';
    const categoryName = item.nameTranslations?.[currentLanguage as keyof typeof item.nameTranslations] || item.name || 'Categoria';
    const categoryDescription = item.descriptionTranslations?.[currentLanguage as keyof typeof item.descriptionTranslations] || 'Descrição não disponível';

    return (
      <TouchableOpacity 
        style={{
          width: 150,
          marginRight: 20,
          backgroundColor: 'white',
          borderRadius: 12,
          overflow: 'hidden'
        }}
        onPress={() => console.log('Navigate to CategoryRoutes:', item.id)}
      >
        <Image
          source={{ uri: item.image }}
          style={{ 
            width: 150, 
            height: 150, 
            borderRadius: 12,
            marginBottom: 12
          }}
        />
        <Box padding="s">
          <Text 
            style={{
              fontFamily: 'Asap',
              fontSize: 16,
              color: 'black',
              fontWeight: 'bold',
              marginBottom: 8
            }}
          >
            {categoryName}
          </Text>
          <Text 
            style={{
              fontFamily: 'Asap',
              fontSize: 14,
              color: '#1E1E1E',
              marginBottom: 12,
              lineHeight: 18
            }}
          >
            {categoryDescription}
          </Text>
          <Box flexDirection="row" alignItems="center">
            <Icon name="map-marker-path" size={16} color="#5A5A5A"/>
            <Text
              style={{
                fontFamily: 'Asap',
                fontSize: 14,
                color: '#5A5A5A',
                marginLeft: 4
              }}
            >
              {item.routeCount || 0} {t('home.routes')}
            </Text>
          </Box>
        </Box>
      </TouchableOpacity>
    );
  };

  // Renderizar eventos
  const renderEvent = ({ item }: { item: Event }) => {
    if (!item) return null;
    
    const currentLanguage = i18n.language || 'pt';
    const eventName = item.nameTranslations?.[currentLanguage as keyof typeof item.nameTranslations] || 'Evento';
    const eventType = item.typeTranslations?.[currentLanguage as keyof typeof item.typeTranslations] || 'Tipo';
    const eventLocation = item.locationTranslations?.[currentLanguage as keyof typeof item.locationTranslations] || 'Local';

    return (
      <TouchableOpacity 
        style={{
          width: 300,
          marginRight: 20,
          backgroundColor: 'white',
          borderRadius: 12,
          overflow: 'hidden'
        }}
        onPress={() => console.log('Navigate to EventDetail:', item.id)}
      >
        <Image
          source={{ uri: item.image }}
          style={{ 
            width: 300, 
            height: 200, 
            borderRadius: 12
          }}
        />
        <Box padding="m">
          <Text 
            style={{
              fontFamily: 'Asap',
              fontSize: 21,
              color: 'black',
              fontWeight: 'bold',
              marginBottom: 8
            }}
          >
            {eventName}
          </Text>
          <Box
            style={{
              backgroundColor: '#E6E6E6',
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 12,
              alignSelf: 'flex-start',
              marginBottom: 8
            }}
          >
            <Text
              style={{
                fontFamily: 'Asap',
                fontSize: 16,
                color: '#444444'
              }}
            >
              {eventType}
            </Text>
          </Box>
          <Box marginBottom="s">
            <Box flexDirection="row" alignItems="center" marginBottom="s">
              <Icon name="map-marker-outline" as any size={16} color="#5A5A5A"/>
              <Text
                style={{
                  fontFamily: 'Asap',
                  fontSize: 16,
                  color: '#5A5A5A',
                  marginLeft: 4
                }}
              >
                {eventLocation}
              </Text>
            </Box>
            <Box flexDirection="row" alignItems="center" marginBottom="s">
              <Icon name="calendar-month-outline" as any size={16} color="#5A5A5A"/>
              <Text
                style={{
                  fontFamily: 'Asap',
                  fontSize: 16,
                  color: '#5A5A5A',
                  marginLeft: 4
                }}
              >
                {item.date || 'Data não informada'}
              </Text>
            </Box>
            <Box flexDirection="row" alignItems="center">
              <Icon name="clock-outline" as any size={16} color="#5A5A5A"/>
              <Text
                style={{
                  fontFamily: 'Asap',
                  fontSize: 16,
                  color: '#5A5A5A',
                  marginLeft: 4
                }}
              >
                {item.time || 'Horário não informado'}
              </Text>
            </Box>
          </Box>
        </Box>
      </TouchableOpacity>
    );
  };

  // Renderizar comércios
  const renderBusiness = ({ item }: { item: Business }) => {
    if (!item) return null;
    
    const currentLanguage = i18n.language || 'pt';
    const businessName = item.nameTranslations?.[currentLanguage as keyof typeof item.nameTranslations] || 'Negócio';
    const businessDescription = item.descriptionTranslations?.[currentLanguage as keyof typeof item.descriptionTranslations] || 'Descrição não disponível';

    return (
      <TouchableOpacity 
        style={{
          width: 200,
          marginRight: 20,
          backgroundColor: 'white',
          borderRadius: 12,
          overflow: 'hidden'
        }}
        onPress={() => console.log('Navigate to BusinessDetail:', item.id)}
      >
        <Image
          source={{ uri: item.image }}
          style={{ 
            width: 200, 
            height: 150, 
            borderRadius: 12
          }}
        />
        <Box padding="m">
          <Text 
            style={{
              fontFamily: 'Asap',
              fontSize: 16,
              color: 'black',
              fontWeight: 'bold',
              marginBottom: 8
            }}
          >
            {businessName}
          </Text>
          <Text 
            style={{
              fontFamily: 'Asap',
              fontSize: 14,
              color: '#1E1E1E',
              marginBottom: 12,
              lineHeight: 18
            }}
          >
            {businessDescription}
          </Text>
          <Box flexDirection="row" alignItems="center">
            <Icon name="map-marker-outline" size={16} color="#5A5A5A"/>
            <Text
              style={{
                fontFamily: 'Asap',
                fontSize: 14,
                color: '#5A5A5A',
                marginLeft: 4
              }}
            >
              {item.distance || 'N/A'}
            </Text>
          </Box>
        </Box>
      </TouchableOpacity>
    );
  };

  // Renderizar locais históricos
  const renderHistoricalPlace = ({ item }: { item: HistoricalPlace }) => {
    if (!item) return null;
    
    const currentLanguage = i18n.language || 'pt';
    const placeName = item.nameTranslations?.[currentLanguage as keyof typeof item.nameTranslations] || 'Local Histórico';
    const placeDescription = item.descriptionTranslations?.[currentLanguage as keyof typeof item.descriptionTranslations] || 'Descrição não disponível';
    const placeLocation = item.locationTranslations?.[currentLanguage as keyof typeof item.locationTranslations] || 'Local não informado';

    return (
      <TouchableOpacity 
        style={{
          width: 300,
          marginRight: 20,
          backgroundColor: 'white',
          borderRadius: 12,
          overflow: 'hidden'
        }}
        onPress={() => console.log('Navigate to HistoricalPlaceDetail:', item.id)}
      >
        <Image
          source={{ uri: item.image }}
          style={{ 
            width: 300, 
            height: 200, 
            borderRadius: 12
          }}
        />
        <Box padding="m">
          <Text 
            style={{
              fontFamily: 'Asap',
              fontSize: 21,
              color: 'black',
              fontWeight: 'bold',
              marginBottom: 8
            }}
          >
            {placeName}
          </Text>
          <Text 
            style={{
              fontFamily: 'Asap',
              fontSize: 16,
              color: '#1E1E1E',
              marginBottom: 12,
              lineHeight: 22
            }}
          >
            {placeDescription}
          </Text>
          <Box>
            <Box flexDirection="row" alignItems="center" marginBottom="s">
              <Icon name="map-marker-outline" as any size={16} color="#5A5A5A"/>
              <Text
                style={{
                  fontFamily: 'Asap',
                  fontSize: 16,
                  color: '#5A5A5A',
                  marginLeft: 4
                }}
              >
                {placeLocation}
              </Text>
            </Box>
            <Box flexDirection="row" alignItems="center">
              <Icon name="headphones" as any size={16} color="#5A5A5A"/>
              <Text
                style={{
                  fontFamily: 'Asap',
                  fontSize: 16,
                  color: '#5A5A5A',
                  marginLeft: 4
                }}
              >
                {item.storiesCount || 0} {t('home.storiesAvailable')}
              </Text>
            </Box>
          </Box>
        </Box>
      </TouchableOpacity>
    );
  };

  return (
    <>
    <ScrollView style={{ flex: 1, backgroundColor: '#035A6E' }}>
      {/* Header integrado */}
      <Box style={{ backgroundColor: '#035A6E', paddingTop: 50, paddingHorizontal: 20, paddingBottom: 20 }}>
        <Box flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom="m">
          <Text 
            style={{
              fontSize: 28,
              fontWeight: 'bold',
              color: 'white',
              fontFamily: 'ASAP'
            }}
          >
            {t('home.title')}
          </Text>
          <TouchableOpacity onPress={openCitySearchModal}>
            <Text style={{ fontSize: 14, color: 'white' }}>
              {t('home.location')} <Icon name="chevron-right" size={14} color="white" />
            </Text>
          </TouchableOpacity>
        </Box>

        <Input
          placeholder={t('home.searchPlaceholder')}
          style={{ backgroundColor: 'white', borderRadius: 12 }}
          marginBottom="l"
          leftIcon={<Icon name="magnify" size={18} color="#035A6E" />}
        />
      </Box>

      {/* Content with White Background */}
      <Box backgroundColor="white" borderTopLeftRadius={20} borderTopRightRadius={20} style={{ marginTop: -20, flex: 1 }}>
        {/* Categories */}
        <Box paddingHorizontal="l" paddingTop="l">
          <Box flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom="m">
            <Text variant="sectionTitle">
              {t('home.exploreByCategory')}
            </Text>
            <TouchableOpacity style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 12, color: 'black' }}>
                {t('home.seeAll')}
              </Text>
            </TouchableOpacity>
          </Box>
        </Box>
        
        {/* Categories Carousel - Full Width */}
        <FlatList
          data={categories}
          renderItem={renderCategory}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingLeft: 20 }}
          style={{ marginBottom: 24 }}
        />

        {/* Featured Routes */}
        <Box paddingHorizontal="l" marginBottom="m">
          <Text variant="sectionTitle">
            {t('home.discoverPaths')}
          </Text>
        </Box>
        
        {/* Routes Carousel - Full Width */}
        <FlatList
          data={routes}
          renderItem={renderRoute}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingLeft: 20 }}
          style={{ marginBottom: 24 }}
        />

        {/* Popular Cities */}
        <Box paddingHorizontal="l" marginBottom="m">
          <Text variant="sectionTitle">
            {t('home.popularCities')}
          </Text>
        </Box>
        
        {/* Cities Carousel - Full Width */}
        <FlatList
          data={cities}
          renderItem={renderCity}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingLeft: 20 }}
          style={{ marginBottom: 24 }}
        />

        {/* Routes by Category */}
        <Box paddingHorizontal="l" marginBottom="m">
          <Text variant="sectionTitle">
            {t('home.routesByCategory')}
          </Text>
        </Box>
        
        {/* Categories Carousel - 150px */}
        <FlatList
          data={categories}
          renderItem={renderCategoryByRoute}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingLeft: 20 }}
          style={{ marginBottom: 24 }}
        />

        {/* Events */}
        <Box paddingHorizontal="l" marginBottom="m">
          <Text variant="sectionTitle">
            {t('home.events')}
          </Text>
        </Box>
        
        {/* Events Carousel */}
        <FlatList
          data={events}
          renderItem={renderEvent}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingLeft: 20 }}
          style={{ marginBottom: 24 }}
        />

        {/* Businesses and Services */}
        <Box paddingHorizontal="l" marginBottom="m">
          <Text variant="sectionTitle">
            {t('home.businessesAndServices')}
          </Text>
        </Box>
        
        {/* Businesses Carousel */}
        <FlatList
          data={businesses}
          renderItem={renderBusiness}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingLeft: 20 }}
          style={{ marginBottom: 24 }}
        />

        {/* Historical Places */}
        <Box paddingHorizontal="l" marginBottom="m">
          <Text variant="sectionTitle">
            {t('home.historicalPlaces')}
          </Text>
        </Box>
        
        {/* Historical Places Carousel */}
        <FlatList
          data={historicalPlaces}
          renderItem={renderHistoricalPlace}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingLeft: 20 }}
          style={{ marginBottom: 24 }}
        />
      </Box>
    </ScrollView>

    {/* Modal de Busca de Cidades */}
    <Modal
      visible={isCitySearchModalVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={closeCitySearchModal}
    >
      <Box
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 20,
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%'
        }}
      >
        <Box
          style={{
            backgroundColor: 'white',
            borderRadius: 12,
            width: '100%',
            maxHeight: '80%',
            padding: 20
          }}
        >
          {/* Botão X para fechar no canto superior direito */}
          <TouchableOpacity 
            onPress={closeCitySearchModal}
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              zIndex: 1
            }}
          >
            <Text style={{ fontSize: 24, color: '#002043' }}>×</Text>
          </TouchableOpacity>

          {/* Campo de Busca com ícone de lupa */}
          <Box 
            style={{
              backgroundColor: '#F5F5F5',
              borderRadius: 8,
              paddingHorizontal: 16,
              paddingVertical: 12,
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 16,
              marginTop: 35
            }}
          >
            <Text style={{ fontSize: 18, color: '#035A6E', marginRight: 8 }}>⌕</Text>
            <TextInput
              style={{
                flex: 1,
                fontSize: 16,
                fontFamily: 'Asap',
                color: '#000',
                height: 20,
                paddingVertical: 0,
                textAlignVertical: 'center'
              }}
              placeholder={t('home.searchCityPlaceholder')}
              placeholderTextColor="#999"
              value={citySearchText}
              onChangeText={handleCitySearchTextChange}
              autoFocus={true}
              multiline={false}
              numberOfLines={1}
            />
          </Box>

          {/* Busca Recente ou Texto de Ajuda */}
          {!citySearchText && recentSearches.length > 0 && (
            <Box marginBottom="m">
              <Text
                style={{
                  fontFamily: 'Asap',
                  fontSize: 14,
                  fontWeight: 'bold',
                  color: '#444444',
                  marginBottom: 8
                }}
              >
                {t('home.recentSearches')}
              </Text>
              {/* Lista de buscas recentes */}
              {recentSearches.map((search, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    // Encontrar a cidade pelo ID e selecioná-la
                    const city = allCities.find(c => c.id === search.cityId);
                    if (city) {
                      handleCitySelection(city);
                    }
                  }}
                  style={{ marginBottom: 12 }}
                >
                  <Box flexDirection="row" alignItems="center">
                    <Text style={{ fontSize: 16, marginRight: 8, color: '#666' }}>○</Text>
                    <Text
                      style={{
                        fontFamily: 'Asap',
                        fontSize: 14,
                        color: '#444444'
                      }}
                    >
                      {search.cityName}
                    </Text>
                  </Box>
                </TouchableOpacity>
              ))}
            </Box>
          )}

          {/* Resultados da Busca */}
          {citySearchText && citySearchResults.length > 0 && (
            <ScrollView style={{ maxHeight: 300 }}>
              {citySearchResults.map((city) => (
                <TouchableOpacity
                  key={city.id}
                  onPress={() => handleCitySelection(city)}
                  style={{
                    paddingVertical: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: '#E5E5E5'
                  }}
                >
                  <Text
                    style={{
                      fontFamily: 'Asap',
                      fontSize: 16,
                      color: '#002043',
                      fontWeight: 'bold'
                    }}
                  >
                    {city.name}, {city.state}
                  </Text>
                  <Text
                    style={{
                      fontFamily: 'Asap',
                      fontSize: 14,
                      color: '#666',
                      marginTop: 4
                    }}
                  >
                    {city.descriptionTranslations[i18n.language as keyof typeof city.descriptionTranslations] || ''}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* Mensagem quando não há resultados */}
          {citySearchText && citySearchResults.length === 0 && (
            <Box style={{ alignItems: 'center', paddingVertical: 20 }}>
              <Text
                style={{
                  fontFamily: 'Asap',
                  fontSize: 16,
                  color: '#666',
                  textAlign: 'center'
                }}
              >
                {t('home.noCitiesFound')}
              </Text>
            </Box>
          )}
        </Box>
      </Box>
    </Modal>
    </>
  );
};

export default HomeScreen;

