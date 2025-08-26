import React, { useState, useEffect } from 'react';
import { ScrollView, TouchableOpacity, FlatList, SafeAreaView, View, Text as RNText } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { Box, Text, RouteCard } from '../components';
import { useLanguageRefresh } from '../hooks/useDataRefresh';
import { getCategoriesWithRoutes } from '../services/RouteService';
import { Route, CategoryWithRoutes } from '../types';

type RootStackParamList = {
  Routes: undefined;
  RouteDetail: { routeId: string };
};

type RoutesScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Routes'>;

const RoutesScreen: React.FC = () => {
  const navigation = useNavigation<RoutesScreenNavigationProp>();
  const { t } = useTranslation();
  const [categories, setCategories] = useState<CategoryWithRoutes[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCategoriesWithRoutes();
  }, []);

  // Refresh data when language changes
  useLanguageRefresh(() => {
    console.log('🌍 RoutesScreen: Refreshing data due to language change');
    loadCategoriesWithRoutes();
  });

  const loadCategoriesWithRoutes = async () => {
    try {
      setIsLoading(true);
      const data = await getCategoriesWithRoutes();
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories with routes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoutePress = (route: Route) => {
    navigation.navigate('RouteDetail', { routeId: route.id });
  };

  const handleSeeMore = (categoryId: string) => {
    // TODO: Navigate to a screen showing all routes for this category
    console.log('See more for category:', categoryId);
  };

  const renderRouteCard = ({ item }: { item: Route }) => (
    <RouteCard
      item={item}
      onPress={handleRoutePress}
    />
  );

  const renderCategorySection = (category: CategoryWithRoutes) => (
    <Box key={category.id} marginBottom="xl">
      {/* Category Header */}
      <Box 
        flexDirection="row" 
        justifyContent="space-between" 
        alignItems="center"
        marginBottom="m"
        paddingHorizontal="m"
      >
        <Text 
          style={{
            fontFamily: 'Asap',
            fontSize: 24,
            color: '#035A6E',
            fontWeight: 'bold'
          }}
        >
          {category.name}
        </Text>
        <TouchableOpacity 
          onPress={() => handleSeeMore(category.id)}
          style={{
            flexDirection: 'row',
            alignItems: 'center'
          }}
        >
          <Text 
            style={{
              fontFamily: 'Asap',
              fontSize: 16,
              color: '#035A6E',
              marginRight: 4
            }}
          >
            {t('routes.seeMore')}
          </Text>
          <Icon name="chevron-right" size={20} color="#035A6E" />
        </TouchableOpacity>
      </Box>

      {/* Routes Carousel */}
      <FlatList
        data={category.routes}
        renderItem={renderRouteCard}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingLeft: 16 }}
      />
    </Box>
  );

  console.log('RoutesScreen rendering...');
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      
      {/* Fixed Header */}
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
          Rotas turísticas
        </RNText>
      </View>

      {/* Content */}
      <ScrollView 
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 16 }}
      >
        {isLoading ? (
          <Box flex={1} justifyContent="center" alignItems="center" paddingTop="xl">
            <Text style={{ color: '#666666' }}>{t('common.loading')}</Text>
          </Box>
        ) : categories.length > 0 ? (
          categories.map(renderCategorySection)
        ) : (
          <Box flex={1} justifyContent="center" alignItems="center" paddingTop="xl">
            <Text style={{ color: '#666666' }}>Nenhuma categoria encontrada</Text>
          </Box>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default RoutesScreen;

