import React from 'react';
import { TouchableOpacity, Image } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Box, Text } from './';
import { City } from '../types';

interface CityCardProps {
  item: City;
  onPress: (city: City) => void;
}

const CityCard: React.FC<CityCardProps> = ({ item, onPress }) => {
  const { t, i18n } = useTranslation();
  
  if (!item) return null;

  // Aplicar tradução baseada no idioma atual
  const currentLanguage = i18n.language || 'pt';
  const cityDescription = item.descriptionTranslations?.[currentLanguage as keyof typeof item.descriptionTranslations] || 'Descrição não disponível';

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
          borderBottomRightRadius: 12,
          marginBottom: 12
        }}
        resizeMode="cover"
      />
      
      {/* Conteúdo */}
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
          {item.name || 'Cidade'}, {item.state || 'Estado'}
        </Text>
        
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
          {cityDescription}
        </Text>
        
        {/* Quantitativos - cada um em uma linha */}
        <Box>
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
              {item.totalDistance}
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
              {typeof item.stories === 'number' ? item.stories : (item.stories || []).length} {t('home.audioStories')}
            </Text>
          </Box>
        </Box>
      </Box>
    </TouchableOpacity>
  );
};

export default CityCard;
