import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, Image, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Box, Text } from '../components';

const FavoritesScreen: React.FC = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const favorites = [
    {
      id: '1',
      title: 'Aracaju',
      type: 'Cidade',
      stories: 5,
      image: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73c0e?w=400&h=300&fit=crop',
    },
    {
      id: '2',
      title: 'Orla de Atalaia',
      type: 'Ponto turístico',
      stories: 5,
      image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop',
    },
  ];

  const FavoriteCard = ({ item }: { item: any }) => (
    <TouchableOpacity>
      <Box
        backgroundColor="white"
        borderRadius={12}
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
            source={{ uri: item.image }}
            style={{
              width: 80,
              height: 80,
              borderRadius: 8,
              marginRight: 12,
            }}
          />
          <Box flex={1}>
            <Text style={{ 
              fontSize: 16, 
              fontWeight: '600', 
              color: '#1A1A1A',
              marginBottom: 4,
            }}>
              {item.title}
            </Text>
            <Box
              backgroundColor="light"
              paddingHorizontal="s"
              paddingVertical="s"
              borderRadius={4}
              alignSelf="flex-start"
              marginBottom="s"
            >
              <Text style={{ fontSize: 12, color: '#2E7D32', fontWeight: '500' }}>
                {item.type}
              </Text>
            </Box>
            <Box flexDirection="row" alignItems="center">
              <Icon name="headphones" size={12} color="#666666" />
              <Text style={{ fontSize: 12, color: '#666666', marginLeft: 4 }}>
                {item.stories} histórias em áudio
              </Text>
            </Box>
          </Box>
        </Box>
      </Box>
    </TouchableOpacity>
  );

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <Box flex={1} backgroundColor="light">
        {/* Header */}
        <Box
          backgroundColor="white"
          paddingTop="l"
          paddingBottom="m"
          paddingHorizontal="m"
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
            elevation: 3,
          }}
        >
          <Box flexDirection="row" alignItems="center" flex={1}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Icon name="arrow-left" size={24} color="#1A1A1A" />
            </TouchableOpacity>
            <Text style={{
              fontSize: 18,
              fontWeight: '600',
              color: '#1A1A1A',
              marginLeft: 16,
            }}>
              Favoritos
            </Text>
          </Box>
          <TouchableOpacity onPress={() => setShowFilterMenu(!showFilterMenu)}>
            <Icon name="tune" size={24} color="#1A1A1A" />
          </TouchableOpacity>
        </Box>

        {/* Content */}
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <Box paddingTop="m">
            {favorites.map((item) => (
              <FavoriteCard key={item.id} item={item} />
            ))}
          </Box>
          <Box height={20} />
        </ScrollView>
      </Box>
    </>
  );
};

export default FavoritesScreen;
