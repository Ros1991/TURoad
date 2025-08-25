import React, { useState, useEffect } from 'react';
import { TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { Box, Text } from '../components';
import { Story } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface AudioStoriesPlayerProps {
  title: string;
  stories: Story[];
  initialStoryIndex?: number;
}

export const AudioStoriesPlayer: React.FC<AudioStoriesPlayerProps> = ({
  title,
  stories,
  initialStoryIndex = 0
}) => {
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage, availableLanguages } = useLanguage();
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(initialStoryIndex);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  const languageOptions = [
    { code: 'pt' as const, flag: '🇧🇷', name: 'Português' },
    { code: 'en' as const, flag: '🇺🇸', name: 'English' },
    { code: 'es' as const, flag: '🇪🇸', name: 'Español' }
  ];

  const currentLanguageOption = languageOptions.find(lang => lang.code === currentLanguage) || languageOptions[0];

  useEffect(() => {
    // Simula carregamento da duração das histórias
    if (stories.length > 0) {
      const mockDuration = parseFloat(stories[currentStoryIndex]?.duration?.replace(' min', '') || '3') * 60;
      setDuration(mockDuration);
    }
  }, []);

  useEffect(() => {
    if (stories.length > 0) {
      const mockDuration = parseFloat(stories[currentStoryIndex]?.duration?.replace(' min', '') || '3') * 60;
      setDuration(mockDuration);
      setCurrentPosition(0);
      setIsPlaying(false);
    }
  }, [currentStoryIndex, currentLanguage, stories]);

  // Simula progresso do áudio quando está 'reproduzindo'
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentPosition(prev => {
          const newPosition = prev + 1;
          if (newPosition >= duration) {
            setIsPlaying(false);
            return duration;
          }
          return newPosition;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isPlaying, duration]);



  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  const goToNextStory = () => {
    if (currentStoryIndex >= stories.length - 1) return;
    setCurrentStoryIndex(currentStoryIndex + 1);
  };

  const goToPreviousStory = () => {
    if (currentStoryIndex <= 0) return;
    setCurrentStoryIndex(currentStoryIndex - 1);
  };

  const goToStory = (index: number) => {
    if (index < 0 || index >= stories.length) return;
    setCurrentStoryIndex(index);
  };


  const formatTime = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (stories.length === 0) {
    return null;
  }

  return (
    <Box>
      {/* Audio Player Controls */}
      {stories.length > 0 && (
        <Box>
          <Box flexDirection="row" alignItems="center" justifyContent="center" marginBottom="m">
            <TouchableOpacity 
              onPress={goToPreviousStory}
              disabled={currentStoryIndex <= 0}
            >
              <Box
                width={40}
                height={40}
                borderRadius={20}
                justifyContent="center"
                alignItems="center"
                marginRight="m"
                style={{ 
                  backgroundColor: currentStoryIndex <= 0 ? '#CCCCCC' : '#E0E0E0' 
                }}
              >
                <Icon 
                  name="skip-previous" 
                  size={16} 
                  color={currentStoryIndex <= 0 ? '#999999' : '#666666'} 
                />
              </Box>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={togglePlayback}>
              <Box
                width={50}
                height={50}
                borderRadius={25}
                justifyContent="center"
                alignItems="center"
                marginHorizontal="m"
                style={{ backgroundColor: '#035A6E' }}
              >
                <Icon name={isPlaying ? 'pause' : 'play'} size={20} color="white" />
              </Box>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={goToNextStory}
              disabled={currentStoryIndex >= stories.length - 1}
            >
              <Box
                width={40}
                height={40}
                borderRadius={20}
                justifyContent="center"
                alignItems="center"
                marginLeft="m"
                style={{ 
                  backgroundColor: (currentStoryIndex >= stories.length - 1) ? '#CCCCCC' : '#E0E0E0' 
                }}
              >
                <Icon 
                  name="skip-next" 
                  size={16} 
                  color={(currentStoryIndex >= stories.length - 1) ? '#999999' : '#666666'} 
                />
              </Box>
            </TouchableOpacity>
          </Box>
          
          {/* Progress Bar */}
          <Box marginBottom="s">
            <Box height={4} borderRadius={2} style={{ backgroundColor: '#E0E0E0' }}>
              <Box 
                width={`${duration > 0 ? (currentPosition / duration) * 100 : 0}%`} 
                height="100%" 
                borderRadius={2} 
                style={{ backgroundColor: '#035A6E' }} 
              />
            </Box>
            <Box flexDirection="row" justifyContent="space-between" style={{ marginTop: 4 }}>
              <Text style={{ fontSize: 12, color: '#666666' }}>
                {formatTime(currentPosition)}
              </Text>
              <Text style={{ fontSize: 12, color: '#666666' }}>
                {formatTime(duration)}
              </Text>
            </Box>
          </Box>
        </Box>
      )}
      
      {/* Stories Section */}
      <Box>
        <Box flexDirection="row" alignItems="center" justifyContent="space-between" marginBottom="s">
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#1A1A1A' }}>
            {title}
          </Text>
          <Box position="relative">
            <TouchableOpacity onPress={() => setShowLanguageDropdown(!showLanguageDropdown)}>
              <Box flexDirection="row" alignItems="center" paddingHorizontal="s" paddingVertical="s" borderRadius={8} style={{ backgroundColor: '#F5F5F5' }}>
                <Icon name="web" size={14} color="#666666" />
                <Text style={{ fontSize: 14, color: '#666666', marginLeft: 4, marginRight: 4 }}>{currentLanguageOption.flag}</Text>
                <Text style={{ fontSize: 14, color: '#666666', marginRight: 4 }}>{currentLanguageOption.name}</Text>
                <Icon name={showLanguageDropdown ? 'chevron-up' : 'chevron-down'} size={14} color="#666666" />
              </Box>
            </TouchableOpacity>
            
            {/* Dropdown Menu */}
            {showLanguageDropdown && (
              <Box 
                position="absolute" 
                top="100%" 
                right={0} 
                marginTop="s" 
                backgroundColor="white" 
                borderRadius={8} 
                style={{ 
                  shadowColor: '#000000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 4,
                  zIndex: 1000,
                  minWidth: 140
                }}
              >
                {languageOptions.map((option) => (
                  <TouchableOpacity 
                    key={option.code} 
                    onPress={async () => {
                      await changeLanguage(option.code);
                      setShowLanguageDropdown(false);
                    }}
                  >
                    <Box 
                      flexDirection="row" 
                      alignItems="center" 
                      paddingHorizontal="m" 
                      paddingVertical="s"
                      style={{ 
                        backgroundColor: option.code === currentLanguage ? '#F0F8FF' : 'transparent' 
                      }}
                    >
                      <Text style={{ fontSize: 14, marginRight: 8 }}>{option.flag}</Text>
                      <Text style={{ 
                        fontSize: 14, 
                        color: option.code === currentLanguage ? '#035A6E' : '#1A1A1A',
                        fontWeight: option.code === currentLanguage ? '500' : '400'
                      }}>
                        {option.name}
                      </Text>
                      {option.code === currentLanguage && (
                        <Icon name="check" size={14} color="#035A6E" style={{ marginLeft: 'auto' }} />
                      )}
                    </Box>
                  </TouchableOpacity>
                ))}
              </Box>
            )}
          </Box>
        </Box>
        
        {/* Story List */}
        {stories.map((story, index) => {
          const mockDuration = parseFloat(story.duration?.replace(' min', '') || '3') * 60;
          const displayDuration = formatTime(mockDuration);

          return (
            <TouchableOpacity key={story.id} onPress={() => goToStory(index)}>
              <Box marginBottom="s" padding="s" style={{
                backgroundColor: index === currentStoryIndex ? '#F8F9FF' : 'transparent',
                borderRadius: 8,
                borderWidth: index === currentStoryIndex ? 1 : 0,
                borderColor: index === currentStoryIndex ? '#035A6E20' : 'transparent'
              }}>
                <Box flexDirection="row" alignItems="center" justifyContent="space-between">
                  <Box flexDirection="row" alignItems="center" flex={1}>
                    <Box
                      width={4}
                      height={4}
                      borderRadius={2}
                      marginRight="s"
                      style={{ backgroundColor: index === currentStoryIndex ? '#035A6E' : '#E0E0E0' }}
                    />
                    <Box flex={1}>
                      <Text style={{ 
                        fontSize: 14, 
                        color: index === currentStoryIndex ? '#035A6E' : '#1A1A1A',
                        fontWeight: index === currentStoryIndex ? '500' : '400'
                      }}>
                        {story.name}
                      </Text>
                      <Text style={{ fontSize: 12, color: '#666666' }}>
                        {story.description}
                      </Text>
                    </Box>
                  </Box>
                  <Box alignItems="flex-end">
                    <Text style={{ 
                      fontSize: 12, 
                      color: '#666666',
                      fontWeight: '500',
                      marginLeft: 5
                    }}>
                      {displayDuration}
                    </Text>
                  </Box>
                </Box>
              </Box>
            </TouchableOpacity>
          );
        })}
      </Box>
    </Box>
  );
};

export default AudioStoriesPlayer;
