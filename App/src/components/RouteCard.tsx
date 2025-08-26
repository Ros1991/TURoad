import React from 'react';
import { TouchableOpacity, Image } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Box, Text } from './';
import { Route, Category } from '../types';

interface RouteCardProps {
  item: Route;
  onPress: (route: Route) => void;
  fullWidth?: boolean;
}

const RouteCard: React.FC<RouteCardProps> = ({ item, onPress, fullWidth = false }) => {
  const { t } = useTranslation();
  
  if (!item) return null;

  const cardWidth = fullWidth ? '100%' : 300;
  const imageWidth = fullWidth ? '100%' : 300;
  const imageHeight = fullWidth ? 200 : 285;

  return (
    <TouchableOpacity 
      style={{
        width: cardWidth,
        marginRight: fullWidth ? 0 : 20,
        backgroundColor: 'white',
        borderRadius: 12,
        overflow: 'hidden',
        ...(fullWidth && {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        })
      }}
      onPress={() => onPress(item)}
    >
      {/* Imagem ocupando todo o topo */}
      <Image
        source={{ uri: item.image }}
        style={{ 
          width: imageWidth, 
          height: imageHeight, 
          borderTopLeftRadius: 12, 
          borderTopRightRadius: 12,
          borderBottomLeftRadius: fullWidth ? 0 : 12, 
          borderBottomRightRadius: fullWidth ? 0 : 12,
          marginBottom: fullWidth ? 0 : 12
        }}
      />
      
      {/* Conteúdo com padding */}
      <Box paddingHorizontal={fullWidth ? "m" : undefined} paddingVertical={fullWidth ? "m" : undefined}>
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
          {item.title}
        </Text>
        
        {/* Badges de categorias - ocultar no fullWidth */}
        {!fullWidth && item.categories && item.categories.length > 0 && (
          <Box flexDirection="row" flexWrap="wrap" marginBottom="s">
            {item.categories.map((categoryName, index) => (
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
        )}
        
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
          {item.description}
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
