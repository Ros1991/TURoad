import React from 'react';
import { TouchableOpacity, Image } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Box, Text } from './';
import { Route, Category } from '../types';

interface RouteCardProps {
  item: Route;
  categories: Category[];
  onPress: (route: Route) => void;
}

const RouteCard: React.FC<RouteCardProps> = ({ item, categories, onPress }) => {
  const { t, i18n } = useTranslation();
  
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
      onPress={() => onPress(item)}
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

          {/* Tempo */}
          <Box flexDirection="row" alignItems="center" marginBottom="s">
            <Icon name="clock-outline" as any size={16} color="#5A5A5A"/>
            <Text
              style={{
                fontFamily: 'Asap',
                fontSize: 16,
                color: '#5A5A5A',
                marginLeft: 4
              }}
            >
              {item.totalTime}
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

export default RouteCard;
