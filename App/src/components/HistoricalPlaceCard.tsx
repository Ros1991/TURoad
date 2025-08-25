import React from 'react';
import { TouchableOpacity, Image } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Box, Text } from './';
import { HistoricalPlace } from '../types';

interface HistoricalPlaceCardProps {
  item: HistoricalPlace;
  onPress?: (historicalPlace: HistoricalPlace) => void;
}

const HistoricalPlaceCard: React.FC<HistoricalPlaceCardProps> = ({ item, onPress }) => {
  const { t } = useTranslation();
  
  if (!item) return null;

  return (
    <TouchableOpacity 
      style={{
        width: 300,
        marginRight: 20,
        backgroundColor: 'white',
        borderRadius: 12,
        overflow: 'hidden'
      }}
      onPress={() => onPress?.(item)}
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
          {item.name}
        </Text>
        {/* Badges de categorias */}
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
              {item.location}
            </Text>
          </Box>
          <Box flexDirection="row" alignItems="center" marginBottom="s">
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
              {item.distance}
            </Text>
          </Box>
        </Box>
      </Box>
    </TouchableOpacity>
  );
};

export default HistoricalPlaceCard;
