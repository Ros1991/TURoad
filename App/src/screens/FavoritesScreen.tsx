import React, { useState, useEffect } from 'react';
import { ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { Box, Text } from '../components';
import { favoritesService, UserFavoriteItem } from '../services/FavoritesService';

type RootStackParamList = {
  RouteDetail: { routeId: string };
  City: { cityId: string };
  Others: { type: 'event' | 'location'; itemId: string };
};

const FavoritesScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { t } = useTranslation();
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [favorites, setFavorites] = useState<UserFavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const data = await favoritesService.getUserFavorites();
      console.log(data);
      setFavorites(data);
    } catch (error) {
      console.error('Error loading favorites:', error);
      Alert.alert('Erro', 'Não foi possível carregar seus favoritos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCardPress = (item: UserFavoriteItem) => {
    if (item.type === 'route') {
      navigation.navigate('RouteDetail', { routeId: item.id });
    } else if (item.type === 'city') {
      navigation.navigate('City', { cityId: item.id });
    } else {
      // For events and locations, navigate to OthersScreen
      const othersType = item.type === 'event' ? 'event' : 'location';
      navigation.navigate('Others', { type: othersType, itemId: item.id });
    }
  };

  const FavoriteCard = ({ item }: { item: UserFavoriteItem }) => (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => handleCardPress(item)}
      style={{
        transform: [{ scale: 1 }],
      }}
    >
      <Box
        backgroundColor="white"
        borderRadius={16}
        marginHorizontal="m"
        marginBottom="m"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 3,
        }}
      >
        <Box flexDirection="row" padding="m">
          <Image
            source={{ uri: item.imageUrl || 'https://via.placeholder.com/120x120/E0E0E0/FFFFFF?text=No+Image' }}
            style={{
              width: 120,
              height: 120,
              borderRadius: 12,
              marginRight: 16,
            }}
          />
          <Box flex={1} justifyContent="space-between">
            <Box>
              <Text style={{ 
                fontSize: 18, 
                fontWeight: '600', 
                color: '#1A1A1A',
                marginBottom: 6,
              }}>
                {item.name}
              </Text>
              <Text style={{ 
                fontSize: 14, 
                color: '#2E7D32', 
                fontWeight: '500',
                marginBottom: 8,
              }}>
                {item.type == 'city' || item.type == 'route' || item.type == 'event' ? t(`favorites.types.${item.type}`) : item.type}
              </Text>
            </Box>
            <Box flexDirection="row" alignItems="center">
              <Icon name="headphones" size={14} color="#666666" />
              <Text style={{ fontSize: 14, color: '#666666', marginLeft: 6 }}>
                {item.storiesCount} {t('favorites.audioStories')}
              </Text>
            </Box>
          </Box>
        </Box>
      </Box>
    </TouchableOpacity>
  );

  return (
      <Box flex={1} backgroundColor="light">
        {/* Header */}
        <Box
          backgroundColor="white"
          paddingBottom="m"
          paddingHorizontal="m"
          flexDirection="row"
          alignItems="center"
          style={{
            paddingTop: 80,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
            elevation: 3,
          }}
        >
          <Box flexDirection="row" alignItems="center" flex={1}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Icon name="chevron-left" size={24} color="#1A1A1A" />
            </TouchableOpacity>
            <Text style={{
              fontSize: 18,
              fontWeight: '600',
              color: '#1A1A1A',
              marginLeft: 16,
            }}>
              {t('favorites.title')}
            </Text>
          </Box>
          <TouchableOpacity onPress={() => setShowFilterMenu(!showFilterMenu)}>
            <Icon name="tune" as any size={24} color="#1A1A1A" />
          </TouchableOpacity>
        </Box>

        {/* Content */}
        {loading ? (
          <Box flex={1} justifyContent="center" alignItems="center">
            <ActivityIndicator size="large" color="#2E7D32" />
            <Text style={{ marginTop: 16, color: '#666666' }}>
              Carregando seus favoritos...
            </Text>
          </Box>
        ) : favorites.length === 0 ? (
          <Box flex={1} justifyContent="center" alignItems="center" padding="xl">
            <Icon name="heart-outline" size={64} color="#CCCCCC" />
            <Text style={{ 
              fontSize: 18, 
              fontWeight: '600', 
              color: '#1A1A1A',
              marginTop: 16,
              textAlign: 'center'
            }}>
              Nenhum favorito ainda
            </Text>
            <Text style={{ 
              fontSize: 14, 
              color: '#666666',
              marginTop: 8,
              textAlign: 'center',
              lineHeight: 20
            }}>
              Explore cidades, rotas e eventos{'\n'}e adicione aos seus favoritos
            </Text>
          </Box>
        ) : (
          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            <Box paddingTop="m">
              {favorites.map((item) => (
                <FavoriteCard key={item.id} item={item} />
              ))}
            </Box>
            <Box height={20} />
          </ScrollView>
        )}
      </Box>
  );
};

export default FavoritesScreen;
