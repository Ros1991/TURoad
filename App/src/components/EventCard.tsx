import React from 'react';
import { TouchableOpacity, Image } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { Box, Text } from './';
import { Event } from '../types';

interface EventCardProps {
  item: Event;
  onPress?: (event: Event) => void;
}

const EventCard: React.FC<EventCardProps> = ({ item, onPress }) => {

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
        <Box marginBottom="s">
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
          {/* <Box flexDirection="row" alignItems="center" marginBottom="s">
            <Icon name="calendar-month-outline" as any size={16} color="#5A5A5A"/>
            <Text
              style={{
                fontFamily: 'Asap',
                fontSize: 16,
                color: '#5A5A5A',
                marginLeft: 4
              }}
            >
              {item.date || 'Data não informada'}
            </Text>
          </Box> */}
          <Box flexDirection="row" alignItems="center">
            <Icon name="clock-outline" as any size={16} color="#5A5A5A"/>
            <Text
              style={{
                fontFamily: 'Asap',
                fontSize: 16,
                color: '#5A5A5A',
                marginLeft: 4
              }}
            >
              {item.time || 'Horário não informado'}
            </Text>
          </Box>
        </Box>
      </Box>
    </TouchableOpacity>
  );
};

export default EventCard;
