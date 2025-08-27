import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { TouchableOpacity, Animated, Dimensions, PanResponder } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { Box, Text } from '../components';
import { Story } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import Sound from 'react-native-sound';

interface SafeAudioStoriesPlayerProps {
  stories: Story[];
  currentStoryIndex: number;
  onStoryChange: (index: number) => void;
  onDurationUpdate?: (storyIndex: number, realDuration: number) => void;
  onPlayStart?: () => void;
  hideLanguageSelector?: boolean;
}

export interface SafeAudioStoriesPlayerRef {
  pause: () => void;
}

const SafeAudioStoriesPlayer = forwardRef<SafeAudioStoriesPlayerRef, SafeAudioStoriesPlayerProps>(({ 
  stories, 
  currentStoryIndex, 
  onStoryChange, 
  onDurationUpdate, 
  onPlayStart, 
  hideLanguageSelector = false 
}, ref) => {
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage, availableLanguages } = useLanguage();
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playStartTime, setPlayStartTime] = useState<number | null>(null);
  const [isDestroyed, setIsDestroyed] = useState(false);
  
  const soundRef = useRef<Sound | null>(null);
  const isInitialLoadRef = useRef(true);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMountedRef = useRef(true);
  const progressBarWidth = Dimensions.get('window').width - 64;

  // Safe state setter that checks if component is still mounted
  const safeSetState = (setter: Function, value: any) => {
    if (isMountedRef.current && !isDestroyed) {
      try {
        setter(value);
      } catch (error) {
        console.warn('Error setting state in SafeAudioStoriesPlayer:', error);
      }
    }
  };

  // Expose pause method to parent with safety checks
  useImperativeHandle(ref, () => ({
    pause: () => {
      if (isDestroyed || !isMountedRef.current) return;
      
      try {
        if (soundRef.current && isPlaying) {
          soundRef.current.pause();
          safeSetState(setIsPlaying, false);
          safeSetState(setPlayStartTime, null);
        }
      } catch (error) {
        console.warn('Error pausing audio in SafeAudioStoriesPlayer:', error);
        safeSetState(setIsPlaying, false);
        safeSetState(setPlayStartTime, null);
      }
    }
  }), [isPlaying, isDestroyed]);

  const languageOptions = [
    { code: 'pt' as const, flag: '🇧🇷', name: 'Português' },
    { code: 'en' as const, flag: '🇺🇸', name: 'English' },
    { code: 'es' as const, flag: '🇪🇸', name: 'Español' }
  ];

  const currentLanguageOption = languageOptions.find(lang => lang.code === currentLanguage) || languageOptions[0];

  // SAFE cleanup function
  const cleanupAudio = () => {
    console.log('🎵 SafeAudioStoriesPlayer: Starting cleanup');
    
    // Clear interval first
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    
    // Force stop and release sound
    if (soundRef.current) {
      try {
        soundRef.current.stop(() => {
          try {
            if (soundRef.current) {
              soundRef.current.release();
              soundRef.current = null;
            }
          } catch (releaseError) {
            console.warn('Error in sound release callback:', releaseError);
            soundRef.current = null;
          }
        });
      } catch (stopError) {
        console.warn('Error stopping sound:', stopError);
        try {
          if (soundRef.current) {
            soundRef.current.release();
            soundRef.current = null;
          }
        } catch (releaseError) {
          console.warn('Error releasing sound after stop error:', releaseError);
          soundRef.current = null;
        }
      }
    }
    
    // Reset all states safely
    safeSetState(setIsPlaying, false);
    safeSetState(setCurrentPosition, 0);
    safeSetState(setDuration, 0);
    safeSetState(setPlayStartTime, null);
    safeSetState(setError, null);
    safeSetState(setIsLoading, false);
  };

  // Initialize and cleanup
  useEffect(() => {
    Sound.setCategory('Playback');
    isMountedRef.current = true;
    
    return () => {
      console.log('🎵 SafeAudioStoriesPlayer: Component unmounting');
      isMountedRef.current = false;
      setIsDestroyed(true);
      cleanupAudio();
    };
  }, []);

  // Load audio when story changes
  useEffect(() => {
    if (!isDestroyed && isMountedRef.current) {
      loadAudio();
    }
  }, [currentStoryIndex]);

  // Safe progress tracking
  useEffect(() => {
    if (isDestroyed || !isMountedRef.current) return;
    
    if (isPlaying && soundRef.current && playStartTime && duration > 0) {
      progressIntervalRef.current = setInterval(() => {
        if (isDestroyed || !isMountedRef.current || !soundRef.current) {
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
          }
          return;
        }
        
        try {
          soundRef.current.getCurrentTime((seconds) => {
            if (isDestroyed || !isMountedRef.current) return;
            
            if (seconds != null && typeof seconds === 'number' && !isNaN(seconds) && seconds >= 0) {
              safeSetState(setCurrentPosition, seconds);
              if (seconds >= duration && duration > 0) {
                onPlaybackFinished();
              }
            } else {
              // Fallback to manual timer
              const elapsedTime = (Date.now() - (playStartTime || 0)) / 1000;
              const estimatedPosition = Math.min(elapsedTime + currentPosition, duration);
              if (!isNaN(estimatedPosition) && estimatedPosition >= 0) {
                safeSetState(setCurrentPosition, estimatedPosition);
                if (estimatedPosition >= duration && duration > 0) {
                  onPlaybackFinished();
                }
              }
            }
          });
        } catch (error) {
          console.warn('Error in progress tracking:', error);
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
          }
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
        progressIntervalRef.current = null;
      }
    };
  }, [isPlaying, duration, playStartTime]);

  const getCurrentAudioUrl = (): string | null => {
    if (isDestroyed || !stories || !stories[currentStoryIndex]) return null;
    
    const currentStory = stories[currentStoryIndex];
    if (!currentStory) return null;
    
    if (currentStory.audioUrl) {
      return currentStory.audioUrl;
    }
    
    if (currentStory.audioUrlTranslations && currentStory.audioUrlTranslations[currentLanguage as keyof typeof currentStory.audioUrlTranslations]) {
      return currentStory.audioUrlTranslations[currentLanguage as keyof typeof currentStory.audioUrlTranslations];
    }
    
    if (currentStory.audioUrlTranslations && currentStory.audioUrlTranslations.pt) {
      return currentStory.audioUrlTranslations.pt;
    }
    
    return null;
  };

  const loadAudio = async () => {
    if (isDestroyed || !isMountedRef.current) return;
    
    try {
      safeSetState(setIsLoading, true);
      safeSetState(setError, null);
      
      // Clear existing interval
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      
      // Clean up existing sound
      if (soundRef.current) {
        safeSetState(setIsPlaying, false);
        safeSetState(setPlayStartTime, null);
        
        try {
          soundRef.current.stop(() => {
            try {
              if (soundRef.current && !isDestroyed) {
                soundRef.current.release();
                soundRef.current = null;
              }
            } catch (releaseError) {
              console.warn('Error in release callback:', releaseError);
              soundRef.current = null;
            }
          });
        } catch (stopError) {
          console.warn('Error stopping sound in loadAudio:', stopError);
          if (soundRef.current) {
            try {
              soundRef.current.release();
              soundRef.current = null;
            } catch (releaseError) {
              console.warn('Error releasing after stop error:', releaseError);
              soundRef.current = null;
            }
          }
        }
      }
      
      const audioUrl = getCurrentAudioUrl();
      if (!audioUrl || isDestroyed || !isMountedRef.current) {
        safeSetState(setError, t('audioPlayer.audioNotAvailable'));
        safeSetState(setIsLoading, false);
        return;
      }
      
      // Create new sound instance
      soundRef.current = new Sound(audioUrl, Sound.MAIN_BUNDLE, (error) => {
        if (isDestroyed || !isMountedRef.current) return;
        
        safeSetState(setIsLoading, false);
        
        if (error) {
          safeSetState(setError, t('audioPlayer.loadError'));
          return;
        }
        
        // Audio loaded successfully
        const soundDuration = soundRef.current?.getDuration() || 0;
        const backendDuration = stories[currentStoryIndex]?.durationSeconds || 0;
        const audioDuration = soundDuration > 0 ? soundDuration : backendDuration;
        
        safeSetState(setDuration, audioDuration);
        safeSetState(setCurrentPosition, 0);
        safeSetState(setIsPlaying, false);
        safeSetState(setPlayStartTime, null);
        
        // Update story duration if needed
        if (soundDuration > 0 && soundDuration !== backendDuration && onDurationUpdate && !isDestroyed) {
          onDurationUpdate(currentStoryIndex, soundDuration);
        }
        
        // Auto-play only when NOT initial load
        const shouldAutoPlay = !isInitialLoadRef.current;
        
        if (shouldAutoPlay && !isDestroyed && isMountedRef.current) {
          if (onPlayStart) {
            onPlayStart();
          }
          
          const startTime = Date.now();
          safeSetState(setIsPlaying, true);
          safeSetState(setPlayStartTime, startTime);
          
          soundRef.current?.play((success) => {
            if (isDestroyed || !isMountedRef.current) return;
            
            if (!success) {
              safeSetState(setIsPlaying, false);
              safeSetState(setPlayStartTime, null);
            }
          });
        }
        
        isInitialLoadRef.current = false;
      });
      
    } catch (err) {
      if (!isDestroyed && isMountedRef.current) {
        safeSetState(setError, t('audioPlayer.initError'));
        safeSetState(setIsLoading, false);
      }
    }
  };
  
  const togglePlayback = () => {
    if (isDestroyed || !isMountedRef.current || !soundRef.current || isLoading) {
      return;
    }
    
    try {
      if (isPlaying) {
        safeSetState(setIsPlaying, false);
        safeSetState(setPlayStartTime, null);
        soundRef.current.pause();
      } else {
        if (onPlayStart) {
          onPlayStart();
        }
        
        const startTime = Date.now();
        safeSetState(setIsPlaying, true);
        safeSetState(setPlayStartTime, startTime);
        
        soundRef.current.play((success) => {
          if (isDestroyed || !isMountedRef.current) return;
          
          if (!success) {
            safeSetState(setIsPlaying, false);
            safeSetState(setPlayStartTime, null);
            safeSetState(setError, t('audioPlayer.playbackError'));
          }
        });
      }
    } catch (error) {
      console.warn('Error in togglePlayback:', error);
      safeSetState(setIsPlaying, false);
      safeSetState(setPlayStartTime, null);
      safeSetState(setError, t('audioPlayer.playbackError'));
    }
  };
  
  const onPlaybackFinished = () => {
    if (isDestroyed || !isMountedRef.current) return;
    
    safeSetState(setIsPlaying, false);
    safeSetState(setCurrentPosition, 0);
    safeSetState(setPlayStartTime, null);
    
    // Auto play next story if available
    if (currentStoryIndex < stories.length - 1 && !isDestroyed) {
      setTimeout(() => {
        if (!isDestroyed && isMountedRef.current) {
          goToNextStory();
        }
      }, 500);
    }
  };
  
  const seekToPosition = (position: number) => {
    if (isDestroyed || !isMountedRef.current || !soundRef.current || isLoading) return;
    
    try {
      const seekTime = Math.max(0, Math.min(position, duration));
      soundRef.current.setCurrentTime(seekTime);
      safeSetState(setCurrentPosition, seekTime);
      
      if (isPlaying) {
        safeSetState(setPlayStartTime, Date.now());
      }
    } catch (error) {
      console.warn('Error seeking audio position:', error);
    }
  };

  const goToNextStory = () => {
    if (isDestroyed || !isMountedRef.current || currentStoryIndex >= stories.length - 1) return;
    
    try {
      if (soundRef.current && isPlaying) {
        soundRef.current.stop(() => {
          if (!isDestroyed && isMountedRef.current) {
            safeSetState(setIsPlaying, false);
            onStoryChange(currentStoryIndex + 1);
          }
        });
      } else {
        onStoryChange(currentStoryIndex + 1);
      }
    } catch (error) {
      console.warn('Error in goToNextStory:', error);
      safeSetState(setIsPlaying, false);
      if (!isDestroyed && isMountedRef.current) {
        onStoryChange(currentStoryIndex + 1);
      }
    }
  };

  const goToPreviousStory = () => {
    if (isDestroyed || !isMountedRef.current || currentStoryIndex <= 0) return;
    
    try {
      if (soundRef.current && isPlaying) {
        soundRef.current.stop(() => {
          if (!isDestroyed && isMountedRef.current) {
            safeSetState(setIsPlaying, false);
            onStoryChange(currentStoryIndex - 1);
          }
        });
      } else {
        onStoryChange(currentStoryIndex - 1);
      }
    } catch (error) {
      console.warn('Error in goToPreviousStory:', error);
      safeSetState(setIsPlaying, false);
      if (!isDestroyed && isMountedRef.current) {
        onStoryChange(currentStoryIndex - 1);
      }
    }
  };

  const goToStory = (index: number) => {
    if (isDestroyed || !isMountedRef.current || index < 0 || index >= stories.length || index === currentStoryIndex) return;
    
    try {
      if (soundRef.current && isPlaying) {
        soundRef.current.stop(() => {
          if (!isDestroyed && isMountedRef.current) {
            safeSetState(setIsPlaying, false);
            onStoryChange(index);
          }
        });
      } else {
        onStoryChange(index);
      }
    } catch (error) {
      console.warn('Error in goToStory:', error);
      safeSetState(setIsPlaying, false);
      if (!isDestroyed && isMountedRef.current) {
        onStoryChange(index);
      }
    }
  };

  const formatTime = (seconds: number): string => {
    if (seconds == null || typeof seconds !== 'number' || isNaN(seconds) || seconds < 0) {
      return '0:00';
    }
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isDestroyed || !isMountedRef.current || stories.length === 0) {
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
                  backgroundColor="textPrimary"
                  borderRadius={8}
                  borderWidth={2}
                  borderColor="textPrimary"
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
          {!hideLanguageSelector && (
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
                        if (!isDestroyed && isMountedRef.current) {
                          await changeLanguage(option.code);
                          setShowLanguageDropdown(false);
                        }
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
          )}
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

export default SafeAudioStoriesPlayer;
