import React, { useEffect } from 'react';
import { StyleSheet, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { Box, Text } from '../components';

type RootStackParamList = {
  Splash: undefined;
  Welcome: undefined;
};

type SplashScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Splash'>;

const SplashScreen: React.FC = () => {
  const navigation = useNavigation<SplashScreenNavigationProp>();
  const { t } = useTranslation();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Welcome');
    }, 3000); // Navigate to WelcomeScreen after 3 seconds

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <Box flex={1} justifyContent="center" alignItems="center">
      <ImageBackground 
        source={require('../assets/spash.png')} 
        style={styles.background}
      >
        {/* Overlay semi-transparente */}
        <Box style={styles.overlay} />
        
        {/* Título por cima do overlay */}
        <Box 
          style={styles.titleContainer}
          flex={1} 
          justifyContent="center" 
          alignItems="center"
        >
          <Text variant="header" color="white">
            {t('splash.title')}
          </Text>
        </Box>
      </ImageBackground>
    </Box>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    backgroundColor: '#035A6E',
    opacity: 0.7,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  titleContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
});

export default SplashScreen;


