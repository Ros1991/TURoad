import React from 'react';
import { TouchableOpacity, Image } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Box, Text } from './';
import { Event } from '../types';

interface EventCardProps {
  item: Event;
  onPress?: (event: Event) => void;
}

const EventCard: React.FC<EventCardProps> = ({ item, onPress }) => {
  const { t, i18n } = useTranslation();
  
  if (!item) return null;
  
  const currentLanguage = i18n.language || 'pt';
  const eventName = item.nameTranslations?.[currentLanguage as keyof typeof item.nameTranslations] || 'Evento';
  const eventType = item.typeTranslations?.[currentLanguage as keyof typeof item.typeTranslations] || 'Tipo';
  const eventLocation = item.locationTranslations?.[currentLanguage as keyof typeof item.locationTranslations] || 'Local';

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
          {eventName}
        </Text>
        <Box
          style={{
            backgroundColor: '#E6E6E6',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 12,
            alignSelf: 'flex-start',
            marginBottom: 8
          }}
        >
          <Text
            style={{
              fontFamily: 'Asap',
              fontSize: 16,
              color: '#444444'
            }}
          >
            {eventType}
          </Text>
        </Box>
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
              {eventLocation}
            </Text>
          </Box>
          <Box flexDirection="row" alignItems="center" marginBottom="s">
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
          </Box>
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
