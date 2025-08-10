import React, { useState } from 'react';
import { ScrollView, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { Box, Text, Button, Card } from '../components';

type RootStackParamList = {
  Explore: undefined;
  City: { cityId: string };
};

type ExploreScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Explore'>;

const ExploreScreen: React.FC = () => {
  const navigation = useNavigation<ExploreScreenNavigationProp>();
  const { t } = useTranslation();
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: 'white' }}>
      {/* Header with background image */}
      <Box height={300} position="relative">
        <Image
          source={{ uri: 'https://via.placeholder.com/400x300/4ECDC4/FFFFFF?text=Aracaju+Beach' }}
          style={{ width: '100%', height: '100%' }}
        />
        <Box position="absolute" top={40} left={16}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Box
              width={40}
              height={40}
              borderRadius={20}
              backgroundColor="white"
              justifyContent="center"
              alignItems="center"
            >
              <Text>←</Text>
            </Box>
          </TouchableOpacity>
        </Box>
      </Box>

      {/* Content */}
      <Box padding="l">
        <Card variant="elevated" marginBottom="l">
          <Box flexDirection="row" justifyContent="space-between" alignItems="flex-start" marginBottom="m">
            <Box flex={1}>
              <Text variant="subheader" color="textPrimary" marginBottom="s">
                {t('city.title')}
              </Text>
              <Text variant="body" color="secondary" marginBottom="s">
                {t('city.state')}
              </Text>
              <Text variant="body" color="secondary">
                📍 {t('explore.distance')}
              </Text>
            </Box>
            <Box flexDirection="row">
              <TouchableOpacity style={{ marginRight: 12 }}>
                <Text>📤</Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text>❤️</Text>
              </TouchableOpacity>
            </Box>
          </Box>

          <Box marginBottom="m">
            <Text variant="body" color="textPrimary" marginBottom="s">
              🎵 {t('explore.storyBy')}
            </Text>
            <Box flexDirection="row" alignItems="center" marginBottom="s">
              <Text variant="body" color="secondary">
                🌐 {t('explore.language')}
              </Text>
            </Box>
          </Box>

          {/* Audio Player */}
          <Box marginBottom="m">
            <Text variant="body" color="primary" marginBottom="s">
              🎵 {t('explore.introduction')}
            </Text>
            
            <Box flexDirection="row" alignItems="center" marginBottom="s">
              <TouchableOpacity onPress={() => setIsPlaying(!isPlaying)}>
                <Box
                  width={40}
                  height={40}
                  borderRadius={20}
                  backgroundColor="primary"
                  justifyContent="center"
                  alignItems="center"
                  marginRight="m"
                >
                  <Text color="white">{isPlaying ? '⏸️' : '▶️'}</Text>
                </Box>
              </TouchableOpacity>
              
              <Box flex={1} height={4} backgroundColor="light" borderRadius={2}>
                <Box width="30%" height="100%" backgroundColor="primary" borderRadius={2} />
              </Box>
            </Box>
            
            <Box flexDirection="row" justifyContent="space-between">
              <Text variant="body" color="secondary">1:46</Text>
              <Text variant="body" color="secondary">3:40</Text>
            </Box>
          </Box>

          <Button
            title={t('explore.disableTranscription')}
            variant="outline"
            marginBottom="m"
          />

          <Text variant="body" color="textPrimary" marginBottom="m">
            {t('explore.transcription')}
          </Text>

          <Text variant="body" color="secondary" marginBottom="s">
            {t('explore.nextLocation')}
          </Text>
          <TouchableOpacity>
            <Text variant="body" color="primary">
              {t('explore.nextLocationName')} →
            </Text>
          </TouchableOpacity>
        </Card>

        <Box flexDirection="row" marginBottom="l">
          <Button
            title={t('city.viewOnMap')}
            variant="outline"
            style={{ flex: 1, marginRight: 8 }}
          />
          <Button
            title={t('city.route')}
            variant="primary"
            style={{ flex: 1, marginLeft: 8 }}
          />
        </Box>

        {/* Expandable sections */}
        <Card variant="elevated" marginBottom="m">
          <TouchableOpacity>
            <Box flexDirection="row" justifyContent="space-between" alignItems="center">
              <Text variant="subheader" color="textPrimary">
                {t('city.whatToObserve')}
              </Text>
              <Text>🔽</Text>
            </Box>
          </TouchableOpacity>
        </Card>

        <Card variant="elevated" marginBottom="m">
          <TouchableOpacity>
            <Box flexDirection="row" justifyContent="space-between" alignItems="center">
              <Text variant="subheader" color="textPrimary">
                {t('city.aboutLocation')}
              </Text>
              <Text>🔽</Text>
            </Box>
          </TouchableOpacity>
        </Card>

        <Text variant="subheader" color="textPrimary" marginBottom="m">
          {t('city.nearbyServices')}
        </Text>

        <Box flexDirection="row" marginBottom="l">
          <Image
            source={{ uri: 'https://via.placeholder.com/150x100/FF6B6B/FFFFFF?text=Service+1' }}
            style={{ width: 150, height: 100, borderRadius: 8, marginRight: 12 }}
          />
          <Image
            source={{ uri: 'https://via.placeholder.com/150x100/4ECDC4/FFFFFF?text=Service+2' }}
            style={{ width: 150, height: 100, borderRadius: 8 }}
          />
        </Box>
      </Box>
    </ScrollView>
  );
};

export default ExploreScreen;

