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
  const { t, i18n } = useTranslation();
  
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

export default HistoricalPlaceCard;
