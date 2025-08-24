import React, { useState, useEffect } from 'react';
import { ScrollView, Image, TouchableOpacity, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { Box, Text, Card } from '../components';
import { useLanguageRefresh } from '../hooks/useDataRefresh';
import { getRoutes } from '../services/RouteService';
import { Route } from '../types';

type RootStackParamList = {
  Routes: undefined;
  RouteDetail: { routeId: string };
};

type RoutesScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Routes'>;

const RoutesScreen: React.FC = () => {
  const navigation = useNavigation<RoutesScreenNavigationProp>();
  const { t } = useTranslation();
  const [historicalRoutes, setHistoricalRoutes] = useState<Route[]>([]);
  const [ecologicalRoutes, setEcologicalRoutes] = useState<Route[]>([]);

  useEffect(() => {
    loadRoutes();
  }, []);

  // Refresh data when language changes
  useLanguageRefresh(() => {
    console.log('🌐 RoutesScreen: Refreshing data due to language change');
    loadRoutes();
  });

  const loadRoutes = async () => {
    try {
      const [historical, ecological] = await Promise.all([
        getRoutes('historical'),
        getRoutes('ecological'),
      ]);
      setHistoricalRoutes(historical);
      setEcologicalRoutes(ecological);
    } catch (error) {
      console.error('Error loading routes:', error);
    }
  };

  const renderRoute = ({ item }: { item: Route }) => (
    <Card
      variant="elevated"
      marginRight="m"
      width={280}
      onPress={() => navigation.navigate('RouteDetail', { routeId: item.id })}
    >
      <Image
        source={{ uri: item.image }}
        style={{ width: '100%', height: 150, borderRadius: 8, marginBottom: 12 }}
      />
      <Text variant="subheader" color="textPrimary" marginBottom="s" numberOfLines={2}>
        {item.title}
      </Text>
      <Text variant="body" color="textPrimary" marginBottom="m" numberOfLines={3}>
        {item.description}
      </Text>
      <Box flexDirection="row" justifyContent="space-between" marginBottom="s">
        <Text variant="body" color="secondary">
          📍 {item.totalDistance}
        </Text>
        <Text variant="body" color="secondary">
          🎵 {item.stories.length} {t('home.audioStories')}
        </Text>
      </Box>
    </Card>
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: 'white' }}>
      <Box padding="l" paddingTop="xl">
        <Text variant="header" color="textPrimary" marginBottom="xl">
          {t('routes.title')}
        </Text>

        {/* Historical Routes */}
        <Box flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom="m">
          <Text variant="subheader" color="textPrimary">
            {t('routes.historical')}
          </Text>
          <TouchableOpacity>
            <Text variant="body" color="primary">
              {t('routes.seeMore')} →
            </Text>
          </TouchableOpacity>
        </Box>

        <FlatList
          data={historicalRoutes}
          renderItem={renderRoute}
          keyExtractor={(item, index) => `historical-route-${index}-${item.id}`}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 32 }}
        />

        {/* Ecological Routes */}
        <Box flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom="m">
          <Text variant="subheader" color="textPrimary">
            {t('routes.ecological')}
          </Text>
          <TouchableOpacity>
            <Text variant="body" color="primary">
              {t('routes.seeMore')} →
            </Text>
          </TouchableOpacity>
        </Box>

        <FlatList
          data={ecologicalRoutes}
          renderItem={renderRoute}
          keyExtractor={(item, index) => `ecological-route-${index}-${item.id}`}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      </Box>
    </ScrollView>
  );
};

export default RoutesScreen;

