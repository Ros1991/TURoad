import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { TouchableOpacity, Animated, Dimensions, PanResponder } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { Box, Text } from '../components';
import { Story } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import Sound from 'react-native-sound';

interface AudioStoriesPlayerProps {
  stories: Story[];
  currentStoryIndex: number;
  onStoryChange: (index: number) => void;
  onDurationUpdate?: (storyIndex: number, realDuration: number) => void;
  onPlayStart?: () => void; // Called when this player starts playing
}

export interface AudioStoriesPlayerRef {
  pause: () => void;
}

const AudioStoriesPlayer = forwardRef<AudioStoriesPlayerRef, AudioStoriesPlayerProps>(({ stories, currentStoryIndex, onStoryChange, onDurationUpdate, onPlayStart }, ref) => {
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage, availableLanguages } = useLanguage();
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playStartTime, setPlayStartTime] = useState<number | null>(null);
  
  const soundRef = useRef<Sound | null>(null);
  const isInitialLoadRef = useRef(true);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressBarWidth = Dimensions.get('window').width - 64; // Account for padding

  // Expose pause method to parent
  useImperativeHandle(ref, () => ({
    pause: () => {
      if (soundRef.current && isPlaying) {
        soundRef.current.pause();
        setIsPlaying(false);
        setPlayStartTime(null);
      }
    }
  }), [isPlaying]);

  const languageOptions = [
    { code: 'pt' as const, flag: '🇧🇷', name: 'Português' },
    { code: 'en' as const, flag: '🇺🇸', name: 'English' },
    { code: 'es' as const, flag: '🇪🇸', name: 'Español' }
  ];

  const currentLanguageOption = languageOptions.find(lang => lang.code === currentLanguage) || languageOptions[0];

  // Initialize Sound library
  useEffect(() => {
    Sound.setCategory('Playback');
    return () => {
      // Cleanup on unmount
      if (soundRef.current) {
        soundRef.current.release();
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  // Load audio when story changes
  useEffect(() => {
    loadAudio();
  }, [currentStoryIndex]);

  // Track progress when playing - usando abordagem híbrida
  useEffect(() => {
    if (isPlaying && soundRef.current && playStartTime) {
      progressIntervalRef.current = setInterval(() => {
        if (soundRef.current && playStartTime) {
          // Método 1: Tentar getCurrentTime
          soundRef.current.getCurrentTime((seconds) => {
            if (seconds > 0) {
              // Se getCurrentTime funciona, usar ele
              setCurrentPosition(seconds);
              if (seconds >= duration && duration > 0) {
                onPlaybackFinished();
              }
            } else {
              // Método 2: Fallback para timer manual
              const elapsedTime = (Date.now() - playStartTime) / 1000;
              const estimatedPosition = Math.min(elapsedTime + currentPosition, duration);
              setCurrentPosition(estimatedPosition);
              
              if (estimatedPosition >= duration && duration > 0) {
                onPlaybackFinished();
              }
            }
          });
        }
      }, 300);
    } else {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    }
    
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [isPlaying, duration, playStartTime]);



  const getCurrentAudioUrl = (): string | null => {
    const currentStory = stories[currentStoryIndex];
    if (!currentStory) return null;
    
    if(currentStory.audioUrl){
      return currentStory.audioUrl;
    }
    // Check if story has audioUrlTranslations for current language
    if (currentStory.audioUrlTranslations && currentStory.audioUrlTranslations[currentLanguage as keyof typeof currentStory.audioUrlTranslations]) {
      return currentStory.audioUrlTranslations[currentLanguage as keyof typeof currentStory.audioUrlTranslations];
    }
    
    // Fallback to Portuguese if current language not available
    if (currentStory.audioUrlTranslations && currentStory.audioUrlTranslations.pt) {
      return currentStory.audioUrlTranslations.pt;
    }
    
    return null;
  };

  const loadAudio = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Release previous sound
      if (soundRef.current) {
        soundRef.current.release();
        soundRef.current = null;
      }
      
      const audioUrl = getCurrentAudioUrl();
      if (!audioUrl) {
        setError(t('audioPlayer.audioNotAvailable'));
        setIsLoading(false);
        return;
      }
      
      // Create new sound instance
      soundRef.current = new Sound(audioUrl, Sound.MAIN_BUNDLE, (error) => {
        setIsLoading(false);
        
        if (error) {
          setError(t('audioPlayer.loadError'));
          return;
        }
        
        // Audio loaded successfully
        const soundDuration = soundRef.current?.getDuration() || 0;
        const backendDuration = stories[currentStoryIndex]?.durationSeconds || 0;
        const audioDuration = soundDuration > 0 ? soundDuration : backendDuration;
        
        setDuration(audioDuration);
        setCurrentPosition(0);
        setIsPlaying(false);
        setPlayStartTime(null);
        
        // Update story duration if real duration is different
        if (soundDuration > 0 && soundDuration !== backendDuration && onDurationUpdate) {
          onDurationUpdate(currentStoryIndex, soundDuration);
        }
        
        // Auto-play only when NOT initial load (story change)
        const shouldAutoPlay = !isInitialLoadRef.current;
        
        if (shouldAutoPlay) {
          // Notify parent that this player is starting
          if (onPlayStart) {
            onPlayStart();
          }
          
          const startTime = Date.now();
          setIsPlaying(true);
          setPlayStartTime(startTime);
          
          soundRef.current?.play((success) => {
            if (!success) {
              setIsPlaying(false);
              setPlayStartTime(null);
            }
          });
        } else {
        }
        
        // Mark as no longer initial load
        isInitialLoadRef.current = false;
      });
      
    } catch (err) {
      setError(t('audioPlayer.initError'));
      setIsLoading(false);
    }
  };
  
  const togglePlayback = () => {
    if (!soundRef.current || isLoading) {
      return;
    }
    
    if (isPlaying) {
      // Pause - definir estado imediatamente também
      setIsPlaying(false);
      setPlayStartTime(null);
      
      soundRef.current.pause();
    } else {
      // Notify parent that this player is starting
      if (onPlayStart) {
        onPlayStart();
      }
      
      // Play - definir estado imediatamente
      const startTime = Date.now();
      setIsPlaying(true);
      setPlayStartTime(startTime);
      
      soundRef.current.play((success) => {
        if (!success) {
          setIsPlaying(false);
          setPlayStartTime(null);
          setError(t('audioPlayer.playbackError'));
        }
      });
    }
  };
  
  const onPlaybackFinished = () => {
    setIsPlaying(false);
    setCurrentPosition(0);
    setPlayStartTime(null);
    
    // Auto play next story if available
    if (currentStoryIndex < stories.length - 1) {
      setTimeout(() => {
        goToNextStory();
      }, 500);
    }
  };
  
  const seekToPosition = (position: number) => {
    if (!soundRef.current || isLoading) return;
    
    const seekTime = Math.max(0, Math.min(position, duration));
    soundRef.current.setCurrentTime(seekTime);
    setCurrentPosition(seekTime);
    
    // Reset play start time se estiver tocando
    if (isPlaying) {
      setPlayStartTime(Date.now());
    }
  };

  const goToNextStory = () => {
    if (currentStoryIndex >= stories.length - 1) return;
    
    // Stop current audio
    if (soundRef.current && isPlaying) {
      soundRef.current.stop(() => {
        setIsPlaying(false);
        onStoryChange(currentStoryIndex + 1);
      });
    } else {
      onStoryChange(currentStoryIndex + 1);
    }
  };

  const goToPreviousStory = () => {
    if (currentStoryIndex <= 0) return;
    
    // Stop current audio
    if (soundRef.current && isPlaying) {
      soundRef.current.stop(() => {
        setIsPlaying(false);
        onStoryChange(currentStoryIndex - 1);
      });
    } else {
      onStoryChange(currentStoryIndex - 1);
    }
  };

  const goToStory = (index: number) => {
    if (index < 0 || index >= stories.length || index === currentStoryIndex) return;
    
    // Stop current audio
    if (soundRef.current && isPlaying) {
      soundRef.current.stop(() => {
        setIsPlaying(false);
        onStoryChange(index);
      });
    } else {
      onStoryChange(index);
    }
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
            
            <TouchableOpacity onPress={togglePlayback} disabled={isLoading || !!error}>
              <Box
                width={50}
                height={50}
                borderRadius={25}
                justifyContent="center"
                alignItems="center"
                marginHorizontal="m"
                style={{ 
                  backgroundColor: (isLoading || error) ? '#CCCCCC' : '#035A6E' 
                }}
              >
                {isLoading ? (
                  <Icon name="loading" size={20} color="white" />
                ) : (
                  <Icon name={isPlaying ? 'pause' : 'play'} size={20} color="white" />
                )}
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
          
          {/* Interactive Progress Bar */}
          <Box marginBottom="s">
            <TouchableOpacity
              activeOpacity={1}
              onPress={(event) => {
                const { locationX } = event.nativeEvent;
                const progress = Math.max(0, Math.min(1, locationX / progressBarWidth));
                const newPosition = progress * duration;
                seekToPosition(newPosition);
              }}
            >
              <Box height={20} justifyContent="center" paddingVertical="s">
                <Box height={5} borderRadius={2} style={{ backgroundColor: '#E0E0E0' }}>
                  <Box 
                    width={`${duration > 0 ? (currentPosition / duration) * 100 : 0}%`} 
                    height="100%" 
                    borderRadius={2} 
                    style={{ backgroundColor: '#035A6E' }} 
                  />
                </Box>
                {/* Progress Handle */}
                <Box
                  position="absolute"
                  width={12}
                  height={12}
                  backgroundColor="success"
                  borderRadius={8}
                  borderWidth={2}
                  borderColor="success"
                  style={{
                    left: Math.max(0, Math.min(progressBarWidth - 12, (currentPosition / duration) * progressBarWidth - 6)),
                    top: 4,
                  }}
                />
              </Box>
            </TouchableOpacity>
            
            <Box flexDirection="row" justifyContent="space-between" style={{ marginTop: 4 }}>
              <Text style={{ fontSize: 12, color: '#666666' }}>
                {formatTime(currentPosition)}
              </Text>
              <Text style={{ fontSize: 12, color: '#666666' }}>
                {formatTime(duration)}
              </Text>
            </Box>
            
            {/* Error message */}
            {error && (
              <Box alignItems="center" marginTop="s">
                <Text style={{ fontSize: 12, color: '#DC3545' }}>{error}</Text>
              </Box>
            )}
          </Box>
        </Box>
      )}
      
      {/* Stories Section */}
      <Box>
        <Box flexDirection="row" alignItems="center" justifyContent="space-between" marginBottom="s">
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#1A1A1A' }}>
            {t('city.stories')}
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
          const displayDuration = formatTime(story.durationSeconds);

          return (
            <TouchableOpacity key={story.id || `story-${index}`} onPress={() => goToStory(index)}>
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
});

export default AudioStoriesPlayer;

