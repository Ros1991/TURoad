import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../contexts/LanguageContext';
import { Box, Text, Button } from '../components';
import TranslateWithFormat from '../components/TranslateWithFormat';
import { backgroundColor } from '@shopify/restyle';

type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  MainTabs: undefined;
};

type WelcomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Welcome'>;

const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation<WelcomeScreenNavigationProp>();
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage } = useLanguage();

  return (
    <Box flex={1} style={styles.backgroundColorWhite}>
      <Box style={styles.imageContainer}>
        <Image 
          source={require('../../assets/welcome.png')}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
      </Box>
      {/* Language selector */}
      <Box 
        position="absolute" 
        top={40} 
        right={20} 
        zIndex={999} 
        flexDirection="row" 
        backgroundColor="white" 
        borderRadius={20}
        padding="s"
        opacity={0.9}
      >
        <TouchableOpacity 
          style={[styles.languageButton, currentLanguage === 'pt' && styles.activeLanguage]} 
          onPress={() => changeLanguage('pt')}
        >
          <Text variant="body" color={currentLanguage === 'pt' ? 'primary' : 'textPrimary'}>PT</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.languageButton, currentLanguage === 'en' && styles.activeLanguage]} 
          onPress={() => changeLanguage('en')}
        >
          <Text variant="body" color={currentLanguage === 'en' ? 'primary' : 'textPrimary'}>EN</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.languageButton, currentLanguage === 'es' && styles.activeLanguage]} 
          onPress={() => changeLanguage('es')}
        >
          <Text variant="body" color={currentLanguage === 'es' ? 'primary' : 'textPrimary'}>ES</Text>
        </TouchableOpacity>
      </Box>

      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
        {/* Gradiente dentro do ScrollView */}
        <LinearGradient 
          colors={['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.4)', 'rgba(255, 255, 255, 0.8)', '#FFFFFF']} 
          style={styles.gradientInScroll}
          locations={[0, 0.2, 0.5, 0.8, 1.0]}
        />
        {/* Conteúdo branco que segue o gradiente */}
        <Box backgroundColor="white" width="100%" padding="l" paddingBottom="m" paddingTop="l">
            <TranslateWithFormat
              i18nKey="welcome.title"
              style={{ fontSize: 30, color: '#035A6E', marginBottom: 16, fontWeight: '400' }}
            />
            <Text variant="body" color="textPrimary" marginBottom="m">
              {t('welcome.subtitle')}
            </Text>
            
            <Box marginTop="xl">
              <Button
                title={t('welcome.createAccount')}
                variant="primary"
                marginBottom="m"
                onPress={() => navigation.navigate('Register')}
              />
              
              <Button
                title={t('welcome.alreadyHaveAccount')}
                variant="outline"
                marginBottom="xl"
                onPress={() => navigation.navigate('Login')}
              />
              
              <TouchableOpacity onPress={() => navigation.navigate('MainTabs')}>
                <Text variant="body" textAlign="center" color="primary">
                  {t('welcome.continueAsGuest')}
                </Text>
              </TouchableOpacity>
            </Box>
        </Box>
      </ScrollView>
    </Box>
  );
};

const styles = StyleSheet.create({
  imageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '60%', // Reduzido para dar espaço ao ScrollView
    overflow: 'visible',
  },
  backgroundImage: {
    width: '105%',
    height: '100%',
    top: '0%',
    resizeMode: 'cover',
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    transform: [{ translateY: -70 }], // Move 70px para cima
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    minHeight: '100%',
  },
  gradientInScroll: {
    height: 120, // Altura fixa para o gradiente
    width: '100%',
  },
  container: {
    flexGrow: 1,
    top: -90,
  },
  languageButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginHorizontal: 2,
  },
  activeLanguage: {
    backgroundColor: 'rgba(0, 32, 67, 0.1)',
  },
  backgroundColorWhite: {
    backgroundColor: 'white',
  },
});

export default WelcomeScreen;
