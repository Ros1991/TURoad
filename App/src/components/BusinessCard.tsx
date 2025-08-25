import React from 'react';
import { TouchableOpacity, Image } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Box, Text } from './';
import { Business } from '../types';

interface BusinessCardProps {
  item: Business;
  onPress?: (business: Business) => void;
}

const BusinessCard: React.FC<BusinessCardProps> = ({ item, onPress }) => {
  const { i18n } = useTranslation();
  
  if (!item) return null;
  
  const currentLanguage = i18n.language || 'pt';
  const businessName = item.nameTranslations?.[currentLanguage as keyof typeof item.nameTranslations] || 'Negócio';
  const businessDescription = item.descriptionTranslations?.[currentLanguage as keyof typeof item.descriptionTranslations] || 'Descrição não disponível';

  return (
    <TouchableOpacity 
      style={{
        width: 200,
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
          width: 200, 
          height: 150, 
          borderRadius: 12
        }}
      />
      <Box padding="m">
        <Text 
          style={{
            fontFamily: 'Asap',
            fontSize: 16,
            color: 'black',
            fontWeight: 'bold',
            marginBottom: 8
          }}
        >
          {businessName}
        </Text>
        <Text 
          style={{
            fontFamily: 'Asap',
            fontSize: 14,
            color: '#1E1E1E',
            marginBottom: 12,
            lineHeight: 18
          }}
        >
          {businessDescription}
        </Text>
        <Box flexDirection="row" alignItems="center">
          <Icon name="map-marker-outline" size={16} color="#5A5A5A"/>
          <Text
            style={{
              fontFamily: 'Asap',
              fontSize: 14,
              color: '#5A5A5A',
              marginLeft: 4
            }}
          >
            {item.distance || 'N/A'}
          </Text>
        </Box>
      </Box>
    </TouchableOpacity>
  );
};

export default BusinessCard;
