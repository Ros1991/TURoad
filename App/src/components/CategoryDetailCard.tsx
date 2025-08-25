import React from 'react';
import { TouchableOpacity, Image } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Box, Text } from './';
import { Category } from '../types';

interface CategoryDetailCardProps {
  item: Category;
  onPress?: (category: Category) => void;
}

const CategoryDetailCard: React.FC<CategoryDetailCardProps> = ({ item, onPress }) => {
  const { t } = useTranslation();
  
  if (!item) return null;
  
  return (
    <TouchableOpacity 
      style={{
        width: 150,
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
          width: 150, 
          height: 150, 
          borderRadius: 12,
          marginBottom: 12
        }}
      />
      <Box padding="s">
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
          <Icon name="map-marker-path" size={16} color="#5A5A5A"/>
          <Text
            style={{
              fontFamily: 'Asap',
              fontSize: 14,
              color: '#5A5A5A',
              marginLeft: 4
            }}
          >
            {item.routeCount || 0} {t('home.routes')}
          </Text>
        </Box>
      </Box>
    </TouchableOpacity>
  );
};

export default CategoryDetailCard;
