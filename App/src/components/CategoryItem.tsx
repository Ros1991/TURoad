import React from 'react';
import { TouchableOpacity, Image } from 'react-native';
import { Box, Text } from './';
import { Category } from '../types';

interface CategoryItemProps {
  item: Category;
  onPress?: (category: Category) => void;
}

const CategoryItem: React.FC<CategoryItemProps> = ({ item, onPress }) => {
  if (!item) return null;
  
  return (
    <TouchableOpacity 
      style={{ marginRight: 16 }}
      onPress={() => onPress?.(item)}
    >
      <Box alignItems="center">
        <Image
          source={{ uri: item.image }}
          style={{ width: 80, height: 80, borderRadius: 40, marginBottom: 8 }}
        />
        <Text style={{ fontSize: 12, color: 'black', textAlign: 'center' }}>
          {item.name || 'Categoria'}
        </Text>
      </Box>
    </TouchableOpacity>
  );
};

export default CategoryItem;
