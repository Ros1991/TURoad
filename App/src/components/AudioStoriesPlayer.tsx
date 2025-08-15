import React, { useState, useEffect, useRef } from 'react';
import { TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Sound from 'react-native-sound';
import { Box, Text } from '../components';
import { Story } from '../types';

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
  const [selectedLanguage, setSelectedLanguage] = useState<'pt' | 'en' | 'es'>('pt');
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(initialStoryIndex);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [storyDurations, setStoryDurations] = useState<{ [key: string]: number }>({});
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const soundRef = useRef<Sound | null>(null);

  const languageOptions = [
    { code: 'pt' as const, flag: '🇧🇷', name: 'Português' },
    { code: 'en' as const, flag: '🇺🇸', name: 'English' },
    { code: 'es' as const, flag: '🇪🇸', name: 'Español' }
  ];

  const currentLanguage = languageOptions.find(lang => lang.code === selectedLanguage) || languageOptions[0];

  useEffect(() => {
    // Habilita reprodução em modo mudo (iOS)
    Sound.setCategory('Playback');
  }, []);

  useEffect(() => {
    if (stories.length > 0) {
      loadCurrentStory();
      loadAllStoryDurations();
    }
  }, [currentStoryIndex, selectedLanguage, stories]);

  useEffect(() => {
    if (isPlaying && soundRef.current) {
      intervalRef.current = setInterval(() => {
        if (soundRef.current) {
          soundRef.current.getCurrentTime((seconds) => {
            setCurrentPosition(seconds);
            if (seconds >= duration) {
              setIsPlaying(false);
              if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
              }
            }
          });
        }
      }, 500);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, duration]);

  const loadAllStoryDurations = () => {
    if (stories.length === 0) return;

    stories.forEach((story, index) => {
      const audioUrl = story.audioUrlTranslations 
        ? story.audioUrlTranslations[selectedLanguage] 
        : story.audioUrl;
      
      const storyKey = `${story.id}-${selectedLanguage}`;
      
      // Só carrega se ainda não tiver a duração em cache
      if (!storyDurations[storyKey]) {
        const tempSound = new Sound(audioUrl, undefined, (error) => {
          if (error) {
            console.log(`❌ Erro ao carregar duração da história ${index + 1}:`, error);
            // Usa duração do mock como fallback
            const mockDuration = parseFloat(story.duration.replace(' min', '')) * 60;
            setStoryDurations(prev => ({
              ...prev,
              [storyKey]: mockDuration
            }));
          } else {
            const audioDuration = tempSound.getDuration();
            console.log(`✅ Duração carregada para história ${index + 1}:`, audioDuration, 'segundos');
            setStoryDurations(prev => ({
              ...prev,
              [storyKey]: audioDuration
            }));
          }
          
          // Libera o sound temporário
          tempSound.release();
        });
      }
    });
  };

  const loadCurrentStory = () => {
    if (stories.length === 0) return;
    
    // Limpa o player anterior
    if (soundRef.current) {
      soundRef.current.stop();
      soundRef.current.release();
      soundRef.current = null;
    }
    
    const currentStory = stories[currentStoryIndex];
    const audioUrl = currentStory.audioUrlTranslations 
      ? currentStory.audioUrlTranslations[selectedLanguage] 
      : currentStory.audioUrl;
    
    console.log('🎵 Carregando áudio:', audioUrl);
    
    setCurrentPosition(0);
    setIsPlaying(false);
    
    // Carrega o novo áudio (para URLs remotas, usar undefined como segundo parâmetro)
    soundRef.current = new Sound(audioUrl, undefined, (error) => {
      if (error) {
        console.log('❌ Erro ao carregar áudio:', error);
        console.log('📍 URL que falhou:', audioUrl);
        // Usa duração do mock se não conseguir carregar
        const mockDuration = parseFloat(currentStory.duration.replace(' min', '')) * 60;
        setDuration(mockDuration);
        return;
      }
      
      if (soundRef.current) {
        const audioDuration = soundRef.current.getDuration();
        setDuration(audioDuration);
        console.log('✅ Áudio carregado com sucesso!');
        console.log('📖 História:', currentStory.titleTranslations 
          ? currentStory.titleTranslations[selectedLanguage] 
          : currentStory.title);
        console.log('⏱️ Duração:', audioDuration, 'segundos');
      }
    });
  };

  const togglePlayback = () => {
    console.log('🎮 Toggle playback chamado, isPlaying atual:', isPlaying);
    
    if (!soundRef.current) {
      console.log('❌ SoundRef está null - áudio não carregado ainda');
      return;
    }

    if (isPlaying) {
      console.log('⏸️ Pausando áudio...');
      soundRef.current.pause();
      setIsPlaying(false);
    } else {
      console.log('▶️ Tentando reproduzir áudio...');
      console.log('🔊 Volume do dispositivo precisa estar ligado!');
      
      soundRef.current.play((success) => {
        if (success) {
          console.log('✅ Áudio reproduzido com sucesso!');
          console.log('🔊 Se não está ouvindo, verifique:');
          console.log('   • Volume do dispositivo/emulador');
          console.log('   • Permissões de áudio');
          console.log('   • Se o emulador suporta áudio');
        } else {
          console.log('❌ Falha na reprodução do áudio');
          setIsPlaying(false);
        }
      });
      setIsPlaying(true);
    }
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
    console.log(`🎯 Navegando para história ${index + 1}`);
    setCurrentStoryIndex(index);
  };

  // Cleanup ao desmontar o componente
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.stop();
        soundRef.current.release();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

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
                <Text style={{ fontSize: 14, color: '#666666', marginLeft: 4, marginRight: 4 }}>{currentLanguage.flag}</Text>
                <Text style={{ fontSize: 14, color: '#666666', marginRight: 4 }}>{currentLanguage.name}</Text>
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
                    onPress={() => {
                      setSelectedLanguage(option.code);
                      setShowLanguageDropdown(false);
                    }}
                  >
                    <Box 
                      flexDirection="row" 
                      alignItems="center" 
                      paddingHorizontal="m" 
                      paddingVertical="s"
                      style={{ 
                        backgroundColor: option.code === selectedLanguage ? '#F0F8FF' : 'transparent' 
                      }}
                    >
                      <Text style={{ fontSize: 14, marginRight: 8 }}>{option.flag}</Text>
                      <Text style={{ 
                        fontSize: 14, 
                        color: option.code === selectedLanguage ? '#035A6E' : '#1A1A1A',
                        fontWeight: option.code === selectedLanguage ? '500' : '400'
                      }}>
                        {option.name}
                      </Text>
                      {option.code === selectedLanguage && (
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
          const storyKey = `${story.id}-${selectedLanguage}`;
          const realDuration = storyDurations[storyKey];
          const displayDuration = realDuration 
            ? formatTime(realDuration)
            : story.duration;

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
                        {story.titleTranslations ? story.titleTranslations[selectedLanguage] : story.title}
                      </Text>
                      <Text style={{ fontSize: 12, color: '#666666' }}>
                        Contada por {story.narrator}
                      </Text>
                    </Box>
                  </Box>
                  <Box alignItems="flex-end">
                    <Text style={{ 
                      fontSize: 12, 
                      color: '#666666',
                      fontWeight: realDuration ? '500' : '400'
                    }}>
                      {!realDuration ? 'carregando...' : displayDuration}
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
