import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ScrollView, Image, TouchableOpacity, FlatList, Modal, TextInput, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { 
  Box, 
  Text, 
  Card, 
  Input, 
  CategoryItem, 
  RouteCard, 
  CityCard, 
  EventCard, 
  CategoryDetailCard, 
  BusinessCard, 
  HistoricalPlaceCard 
} from '../components';
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
  CategoryRoutes: { categoryId: string; categoryName: string };
};

type BottomTabParamList = {
  Home: undefined;
  Explore: undefined;
  Routes: undefined;
  Profile: undefined;
};

type HomeScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<BottomTabParamList, 'Home'>,
  StackNavigationProp<RootStackParamList>
>;

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
  
  // Estados para a busca geral
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const searchDebounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Estados para o modal de busca de cidades
  const [isCitySearchModalVisible, setIsCitySearchModalVisible] = useState(false);
  const [citySearchText, setCitySearchText] = useState('');
  const [citySearchResults, setCitySearchResults] = useState<City[]>([]);
  const [allCities, setAllCities] = useState<City[]>([]);
  const [recentSearches, setRecentSearches] = useState<Array<{text: string, cityId: string, cityName: string}>>([]);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Estado para cidade selecionada
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [isCitySearchLoading, setIsCitySearchLoading] = useState(false);

  useEffect(() => {
    loadData();
    loadRecentSearches();
    loadSelectedCity();
    // Cleanup function para detectar quando instância é destruída
    return () => {
    };
  }, []);

  // Refresh data when language changes
  useLanguageRefresh(() => {
    loadData(searchTerm);
  });

  // Refresh data when selected city changes
  useEffect(() => {
    if (selectedCity) {
      loadData(searchTerm);
    }
  }, [selectedCity]);

  // Debounced search function
  const handleSearchChange = (text: string) => {
    setSearchTerm(text);
    
    // Clear existing timer
    if (searchDebounceTimer.current) {
      clearTimeout(searchDebounceTimer.current);
    }
    
    // Set new timer for debounced search
    searchDebounceTimer.current = setTimeout(() => {
      loadData(text);
    }, 500); // 500ms debounce delay
  };

  // Clear search function
  const clearSearch = () => {
    setSearchTerm('');
    if (searchDebounceTimer.current) {
      clearTimeout(searchDebounceTimer.current);
    }
    loadData(''); // Load data without filter
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (searchDebounceTimer.current) {
        clearTimeout(searchDebounceTimer.current);
      }
    };
  }, []);

  // Load selected city from AsyncStorage
  const loadSelectedCity = async () => {
    try {
      const savedCity = await AsyncStorage.getItem('selectedCity');
      if (savedCity) {
        setSelectedCity(JSON.parse(savedCity));
      }
    } catch (error) {
      console.error('Error loading selected city:', error);
    }
  };

  // Save selected city to AsyncStorage
  const saveSelectedCity = async (city: City) => {
    try {
      await AsyncStorage.setItem('selectedCity', JSON.stringify(city));
      setSelectedCity(city);
    } catch (error) {
      console.error('Error saving selected city:', error);
    }
  };

  // Clear selected city
  const clearSelectedCity = async () => {
    try {
      await AsyncStorage.removeItem('selectedCity');
      setSelectedCity(null);
      // Force reload data without city filter by passing null cityId explicitly
      await loadData(searchTerm, null);
    } catch (error) {
      console.error('Error clearing selected city:', error);
    }
  };

  // Handle city search with debounce
  const handleCitySearchChange = (text: string) => {
    setCitySearchText(text);
    
    // Clear existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    // Set new timer for debounced search
    debounceTimer.current = setTimeout(async () => {
      await searchCitiesInModal(text);
    }, 300); // 300ms debounce delay for city search
  };

  // Search cities using server endpoint
  const searchCitiesInModal = async (query: string) => {
    try {
      setIsCitySearchLoading(true);
      if (query.trim().length === 0) {
        setCitySearchResults([]);
        return;
      }
      
      const results = await getCities(query);
      setCitySearchResults(results || []);
    } catch (error) {
      console.error('Error searching cities:', error);
      setCitySearchResults([]);
    } finally {
      setIsCitySearchLoading(false);
    }
  };

  // Handle city selection
  const handleCitySelect = async (city: City) => {
    await saveSelectedCity(city);
    setIsCitySearchModalVisible(false);
    setCitySearchText('');
    setCitySearchResults([]);
  };

  // Handle category press navigation
  const handleCategoryPress = (category: Category) => {
    navigation.navigate('CategoryRoutes', { 
      categoryId: category.id, 
      categoryName: category.name 
    });
  };

  // Handle business press navigation
  const handleBusinessPress = (business: Business) => {
    (navigation as any).navigate('Others', { 
      type: 'location', 
      itemId: business.id 
    });
  };

    // Handle business press navigation
    const handleEventPress = (event: Event) => {
      (navigation as any).navigate('Others', { 
        type: 'event', 
        itemId: event.id 
      });
    };

  // Handle historical place press navigation
  const handleHistoricalPlacePress = (historicalPlace: HistoricalPlace) => {
    (navigation as any).navigate('Others', { 
      type: 'location', 
      itemId: historicalPlace.id 
    });
  };

  const loadData = async (searchQuery?: string, forceCityId?: number | null) => {
    try {
      setIsLoading(true);
      
      // Get selected city ID for filtering (use forceCityId if provided, null means no filter)
      const cityIdNum = forceCityId !== undefined ? forceCityId : selectedCity?.id;
      const cityId = cityIdNum ? String(cityIdNum) : undefined;
      
      // Execute all API calls in parallel
      const results = await Promise.allSettled([
        getCategories(false, searchQuery, cityId),
        getRoutes(undefined, searchQuery, cityId),
        getCities(searchQuery, cityId),
        getEvents(searchQuery, cityId),
        getBusinesses(searchQuery, cityId),
        getHistoricalPlaces(searchQuery, cityId)
      ]);

      // Process results and handle errors individually
      const [categoriesResult, routesResult, citiesResult, eventsResult, businessesResult, historicalPlacesResult] = results;

      // Categories
      if (categoriesResult.status === 'fulfilled') {
        setCategories(categoriesResult.value || []);
      } else {
        console.error('❌ Error loading categories:', categoriesResult.reason);
        setCategories([]);
      }

      // Routes
      if (routesResult.status === 'fulfilled') {
        setRoutes(routesResult.value || []);
      } else {
        console.error('❌ Error loading routes:', routesResult.reason);
        setRoutes([]);
      }

      // Cities
      if (citiesResult.status === 'fulfilled') {
        const citiesData = citiesResult.value || [];
        setCities(citiesData);
        // Keep all cities for city search modal only if no search is active
        if (!searchQuery) {
          setAllCities(citiesData);
        }
      } else {
        console.error('❌ Error loading cities:', citiesResult.reason);
        setCities([]);
      }

      // Events
      if (eventsResult.status === 'fulfilled') {
        setEvents(eventsResult.value || []);
      } else {
        console.error('❌ Error loading events:', eventsResult.reason);
        setEvents([]);
      }

      // Businesses
      if (businessesResult.status === 'fulfilled') {
        setBusinesses(businessesResult.value || []);
      } else {
        console.error('❌ Error loading businesses:', businessesResult.reason);
        setBusinesses([]);
      }

      // Historical Places
      if (historicalPlacesResult.status === 'fulfilled') {
        setHistoricalPlaces(historicalPlacesResult.value || []);
      } else {
        console.error('❌ Error loading historical places:', historicalPlacesResult.reason);
        setHistoricalPlaces([]);
      }

    } catch (error) {
      console.error('❌ Error loading data:', error);
      // Reset all states on general error
      setCategories([]);
      setRoutes([]);
      setCities([]);
      setEvents([]);
      setBusinesses([]);
      setHistoricalPlaces([]);
    } finally {
      setIsLoading(false);
    }
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
  const handleCitySelection = async (city: City) => {
    // Salvar busca recente
    if (citySearchText.trim()) {
      saveRecentSearch(citySearchText, city.id, `${city.name}, ${city.state}`);
    }
    
    // Salvar cidade selecionada
    await saveSelectedCity(city);
    
    // Fechar modal e limpar busca
    setCitySearchText('');
    setCitySearchResults([]);
    closeCitySearchModal();
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
              {selectedCity ? `${selectedCity.name}, ${selectedCity.state}` : t('home.location')} <Icon name="chevron-right" size={14} color="white" />
            </Text>
          </TouchableOpacity>
        </Box>

        <Box marginBottom="l">
          <Box 
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: 'white',
              borderRadius: 12,
              borderWidth: 1,
              borderColor: '#E0E0E0',
              paddingHorizontal: 16,
              paddingVertical: 12
            }}
          >
            <Icon name="magnify" size={18} color="#035A6E" style={{ marginRight: 8 }} />
            <TextInput
              style={{
                flex: 1,
                fontSize: 16,
                color: 'black',
                fontWeight: 'bold'
              }}
              placeholder={t('home.searchPlaceholder')}
              placeholderTextColor="#999"
              value={searchTerm}
              onChangeText={handleSearchChange}
            />
            {isLoading && (
              <ActivityIndicator size="small" color="#035A6E" style={{ marginLeft: 8 }} />
            )}
            {searchTerm && !isLoading && (
              <TouchableOpacity onPress={clearSearch} style={{ marginLeft: 8 }}>
                <Icon name="close-circle" size={18} color="#999" />
              </TouchableOpacity>
            )}
          </Box>
        </Box>
      </Box>

      {/* Content with White Background */}
      <Box backgroundColor="white" borderTopLeftRadius={20} borderTopRightRadius={20} style={{ marginTop: -20, flex: 1, minHeight: '100%', paddingTop: 24}}>
        {/* Check if no data found */}
        {categories.length === 0 && routes.length === 0 && cities.length === 0 && events.length === 0 && businesses.length === 0 && historicalPlaces.length === 0 && !isLoading && searchTerm && (
          <Box 
            padding="xl" 
            alignItems="center" 
            justifyContent="flex-start" 
            style={{ 
              flex: 1,
              minHeight: 300,
              paddingTop: 100,
              paddingBottom: 0
            }}
          >
            <Icon name="magnify" size={48} color="#ccc" style={{ marginBottom: 16 }} />
            <Text style={{ 
              fontSize: 18, 
              color: '#666', 
              textAlign: 'center', 
              marginBottom: 8,
              fontFamily: 'Asap',
              fontWeight: 'bold'
            }}>
              {t('home.noResultsFound')}
            </Text>
            <Text style={{ 
              fontSize: 14, 
              color: '#999', 
              textAlign: 'center',
              fontFamily: 'Asap'
            }}>
              {t('home.tryDifferentSearch')}
            </Text>
          </Box>
        )}

        {/* Categories */}
        {categories.length > 0 && (
          <>
            <Box paddingHorizontal="l">
              <Box flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom="m">
                <Text variant="sectionTitle">
                  {t('home.exploreByCategory')}
                </Text>
                <TouchableOpacity 
                  style={{ alignItems: 'center', justifyContent: 'center' }}
                  onPress={() => navigation.navigate('Routes')}
                >
                  <Text style={{ fontSize: 12, color: 'black' }}>
                    {t('home.seeAll')}
                  </Text>
                </TouchableOpacity>
              </Box>
            </Box>
            
            {/* Categories Carousel - Full Width (first 5 only) */}
            <FlatList
              data={categories.slice(0, 5)}
              renderItem={({ item }) => <CategoryItem item={item} onPress={handleCategoryPress} />}
              keyExtractor={(item, index) => `category-${index}-${item.id}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingLeft: 20 }}
              style={{ marginBottom: 0 }}
            />
          </>
        )}

        {/* Featured Routes */}
        {routes.length > 0 && (
          <>
            <Box paddingHorizontal="l" marginBottom="m">
              <Text variant="sectionTitle">
                {t('home.discoverPaths')}
              </Text>
            </Box>
            
            {/* Routes Carousel - Full Width */}
            <FlatList
              data={routes}
              renderItem={({ item }) => <RouteCard item={item} onPress={() => navigation.navigate('RouteDetail', { routeId: item.id })} />}
              keyExtractor={(item, index) => `route-${index}-${item.id}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingLeft: 20 }}
              style={{ marginBottom: 0 }}
            />
          </>
        )}

        {/* Popular Cities */}
        {cities.length > 0 && (
          <>
            <Box paddingHorizontal="l" marginBottom="m">
              <Text variant="sectionTitle">
                {selectedCity ? t('home.nearbyCities') : t('home.popularCities')}
              </Text>
            </Box>
            
            {/* Cities Carousel - Full Width */}
            <FlatList
              data={cities}
              renderItem={({ item }) => <CityCard item={item} onPress={(city) => navigation.navigate('City', { cityId: city.id })} />}
              keyExtractor={(item, index) => `city-${index}-${item.id}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingLeft: 20, paddingRight: 20 }}
              style={{ marginBottom: 0 }}
              removeClippedSubviews={false}
              initialNumToRender={3}
            />
          </>
        )}

        {/* Routes by Category */}
        {categories.length > 0 && (
          <>
            <Box paddingHorizontal="l" marginBottom="m">
              <Text variant="sectionTitle">
                {t('home.routesByCategory')}
              </Text>
            </Box>
            
            {/* Categories Carousel - 150px */}
            <FlatList
              data={categories}
              renderItem={({ item }) => <CategoryDetailCard item={item} onPress={handleCategoryPress} />}
              keyExtractor={(item, index) => `category-route-${index}-${item.id}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingLeft: 20 }}
              style={{ marginBottom: 0 }}
            />
          </>
        )}

        {/* Events */}
        {events.length > 0 && (
          <>
            <Box paddingHorizontal="l" marginBottom="m">
              <Text variant="sectionTitle">
                {t('home.events')}
              </Text>
            </Box>
            
            {/* Events Carousel */}
            <FlatList
              data={events}
              renderItem={({ item }) => <EventCard item={item} onPress={handleEventPress} />}
              keyExtractor={(item, index) => `event-${index}-${item.id}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingLeft: 20 }}
              style={{ marginBottom: 0 }}
            />
          </>
        )}

        {/* Businesses and Services */}
        {businesses.length > 0 && (
          <>
            <Box paddingHorizontal="l" marginBottom="m">
              <Text variant="sectionTitle">
                {t('home.businessesAndServices')}
              </Text>
            </Box>
            
            {/* Businesses Carousel */}
            <FlatList
              data={businesses}
              renderItem={({ item }) => <BusinessCard item={item} onPress={handleBusinessPress} />}
              keyExtractor={(item, index) => `business-${index}-${item.id}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingLeft: 24, paddingRight: 16 }}
              style={{ marginBottom: 0 }}
            />
          </>
        )}

        {/* Historical Places */}
        {historicalPlaces.length > 0 && (
          <>
            <Box paddingHorizontal="l" marginBottom="m">
              <Text variant="sectionTitle">
                {t('home.historicalPlaces')}
              </Text>
            </Box>
            
            {/* Historical Places Carousel */}
            <FlatList
              data={historicalPlaces}
              renderItem={({ item }) => <HistoricalPlaceCard item={item} onPress={handleHistoricalPlacePress} />}
              keyExtractor={(item, index) => `historical-${index}-${item.id}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingLeft: 24, paddingRight: 16 }}
              style={{ marginBottom: 200 }}
            />
          </>
        )}
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

          {/* Cidade Selecionada Atual */}
          {selectedCity && (
            <Box
              style={{
                backgroundColor: '#E8F4F8',
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 8,
                marginBottom: 0,
                marginTop: 35,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <Box style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: 'Asap',
                    fontSize: 14,
                    color: '#666',
                    marginBottom: 2
                  }}
                >
                  {t('home.selectedCity')}:
                </Text>
                <Text
                  style={{
                    fontFamily: 'Asap',
                    fontSize: 16,
                    color: '#035A6E',
                    fontWeight: 'bold'
                  }}
                >
                  {selectedCity.name}, {selectedCity.state}
                </Text>
              </Box>
              <TouchableOpacity
                onPress={clearSelectedCity}
                style={{
                  backgroundColor: '#035A6E',
                  borderRadius: 12,
                  width: 24,
                  height: 24,
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>×</Text>
              </TouchableOpacity>
            </Box>
          )}

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
              marginTop: selectedCity ? 10 : 35
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
              onChangeText={handleCitySearchChange}
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

          {/* Loading indicator */}
          {isCitySearchLoading && (
            <Box style={{ alignItems: 'center', paddingVertical: 20 }}>
              <Text style={{ fontFamily: 'Asap', fontSize: 14, color: '#666' }}>
                {t('common.loading')}...
              </Text>
            </Box>
          )}

          {/* Resultados da Busca */}
          {citySearchText && citySearchResults && citySearchResults.length > 0 && !isCitySearchLoading && (
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
                    {city.description || ''}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* Mensagem quando não há resultados */}
          {citySearchText && citySearchResults && citySearchResults.length === 0 && !isCitySearchLoading && (
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

