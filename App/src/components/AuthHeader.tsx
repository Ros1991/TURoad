import React from 'react';
import { TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { Box, Text } from './index';

const { height: screenHeight } = Dimensions.get('window');

interface AuthHeaderProps {
  showBackButton?: boolean;
  onBackPress?: () => void;
  withBackground?: boolean;
}

const AuthHeader: React.FC<AuthHeaderProps> = ({ 
  showBackButton = true, 
  onBackPress,
  withBackground = false
}) => {
  const navigation = useNavigation();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };

  if (withBackground) {
    return (
      <Box style={styles.backgroundContainer}>
        <Image 
          source={require('../../assets/welcome.png')}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
        <LinearGradient 
          colors={[
            'rgba(255, 255, 255, 0)', 
            'rgba(255, 255, 255, 0.1)', 
            'rgba(255, 255, 255, 0.4)', 
            'rgba(255, 255, 255, 0.8)', 
            '#FFFFFF'
          ]} 
          style={styles.gradient}
          locations={[0, 0.3, 0.6, 0.85, 1]}
        />
        {showBackButton && (
          <TouchableOpacity onPress={handleBackPress} style={styles.backButtonOverlay}>
            <Text style={styles.backArrowOverlay}>←</Text>
          </TouchableOpacity>
        )}
      </Box>
    );
  }

  return (
    <Box style={styles.container}>
      <Box style={styles.content}>
        {showBackButton && (
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
        )}
      </Box>
    </Box>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 40,
    paddingHorizontal: 20,
    backgroundColor: 'white',
    height: 90,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
  },
  backButton: {
    width: 44,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 24,
    fontWeight: '400',
    color: '#333',
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  // Novos estilos para o background
  backgroundContainer: {
    height: screenHeight * 0.4, // 40% da altura da tela
    position: 'relative',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  gradient: {
    position: 'absolute',
    bottom: -2, // Overlap de 2px para eliminar gaps
    left: 0,
    right: 0,
    height: screenHeight * 0.18, // Aumentado para 18% para melhor cobertura
  },
  backButtonOverlay: {
    position: 'absolute',
    top: 40,
    left: 20,
    width: 44,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 22,
  },
  backArrowOverlay: {
    fontSize: 24,
    fontWeight: '400',
    color: '#fff',
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
});

export default AuthHeader;
