import React, { useState, useEffect } from 'react';
import { ScrollView, TouchableOpacity, FlatList, SafeAreaView, View, Text as RNText } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { Box, Text, RouteCard } from '../components';
import { useLanguageRefresh } from '../hooks/useDataRefresh';
import { getRoutes } from '../services/RouteService';
import { Route } from '../types';

type RootStackParamList = {
  CategoryRoutes: { categoryId: string; categoryName: string };
  RouteDetail: { routeId: string };
};

type CategoryRoutesScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CategoryRoutes'>;
type CategoryRoutesScreenRouteProp = RouteProp<RootStackParamList, 'CategoryRoutes'>;

const CategoryRoutesScreen: React.FC = () => {
  const navigation = useNavigation<CategoryRoutesScreenNavigationProp>();
  const route = useRoute<CategoryRoutesScreenRouteProp>();
  const { t } = useTranslation();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { categoryId, categoryName } = route.params;

  // Function to create localized title based on language
  const getLocalizedTitle = () => {
    const routesWord = t('home.routes'); // "rotas", "routes", "rutas"
    const currentLanguage = i18n.language || 'pt';
    
    if (currentLanguage === 'en') {
      // English: "Historical Routes" (category + routes)
      return `${categoryName} ${routesWord.charAt(0).toUpperCase() + routesWord.slice(1)}`;
    } else {
      // Portuguese/Spanish: "Rotas Históricas" (routes + category)  
      return `${routesWord.charAt(0).toUpperCase() + routesWord.slice(1)} ${categoryName}`;
    }
  };

  useEffect(() => {
    loadRoutes();
  }, [categoryId]);

  // Refresh data when language changes
  useLanguageRefresh(() => {
    console.log('🌍 CategoryRoutesScreen: Refreshing data due to language change');
    loadRoutes();
  });

  const loadRoutes = async () => {
    try {
      setIsLoading(true);
      const data = await getRoutes(categoryId);
      setRoutes(data || []);
    } catch (error) {
      console.error('Error loading routes for category:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoutePress = (route: Route) => {
    navigation.navigate('RouteDetail', { routeId: route.id });
  };

  const renderRouteItem = ({ item }: { item: Route }) => (
    <Box marginHorizontal="m" marginBottom="m">
      <RouteCard
        item={item}
        onPress={handleRoutePress}
        fullWidth={true}
      />
    </Box>
  );

  console.log('CategoryRoutesScreen rendering...');
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      
      {/* Fixed Header - Copied from RoutesScreen */}
      <View 
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 12,
          paddingTop: 65, // More space for status bar
          borderBottomWidth: 1,
          borderBottomColor: '#F0F0F0',
          backgroundColor: 'white',
          height: 105 // Increased height to accommodate status bar
        }}
      >
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={{ marginRight: 16 }}
        >
          <Icon name="arrow-left" size={24} color="#000000" />
        </TouchableOpacity>
        <RNText 
          style={{
            fontFamily: 'Asap',
            fontSize: 20,
            color: '#000000',
            fontWeight: 'bold'
          }}
        >
          {getLocalizedTitle()}
        </RNText>
      </View>

      {/* Content */}
      {isLoading ? (
        <Box flex={1} justifyContent="center" alignItems="center">
          <Text style={{ color: '#666666' }}>{t('common.loading')}</Text>
        </Box>
      ) : routes.length > 0 ? (
        <FlatList
          data={routes}
          renderItem={renderRouteItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 16 }}
        />
      ) : (
        <Box flex={1} justifyContent="center" alignItems="center">
          <Text style={{ color: '#666666' }}>{t('home.noRoutesFound')}</Text>
        </Box>
      )}
    </SafeAreaView>
  );
};

export default CategoryRoutesScreen;
