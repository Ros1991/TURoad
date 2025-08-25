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

  if (!item) return null;

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
          {item.name}
        </Text>

        {/* Badges de categorias */}
        {/* <Box flexDirection="row" flexWrap="wrap" marginBottom="s">
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
                  fontSize: 12,
                  color: '#444444'
                }}
              >
                {categoryName}
              </Text>
            </Box>
          ))}
        </Box> */}
        <Text 
          style={{
            fontFamily: 'Asap',
            fontSize: 14,
            color: '#1E1E1E',
            marginBottom: 12,
            lineHeight: 18
          }}
        >
          {item.description}
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
