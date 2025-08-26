import React, { useEffect } from 'react';
import { Platform, StatusBar } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import * as Updates from 'expo-updates';
import ThemeProvider from './src/themes/ThemeProvider';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/contexts/AuthContext';
import { ToastProvider } from './src/contexts/ToastContext';
import './src/locales/i18n'; // Import i18n configuration
import { locationService } from './src/services/LocationService';
import { LanguageProvider } from './src/contexts/LanguageContext';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

function App(): React.JSX.Element {
  const appId = React.useRef(Math.random().toString(36).substr(2, 9));
  console.log(`🚀 App: Component rendering - ID: ${appId.current}`);
  useEffect(() => {
    async function prepare() {
      try {
        // Initialize expo-updates in production
        if (!__DEV__ && Updates.isEnabled) {
          try {
            const update = await Updates.checkForUpdateAsync();
            if (update.isAvailable) {
              await Updates.fetchUpdateAsync();
              await Updates.reloadAsync();
            }
          } catch (error) {
            console.log('Failed to check for updates:', error);
          }
        }
        
        // Initialize location service
        console.log('📍 Initializing location service...');
        await locationService.initializeLocation();
        
        // Simulate loading time or actual resource loading
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Hide splash screen
        await SplashScreen.hideAsync();
      } catch (e) {
        console.warn(e);
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  return (
    <LanguageProvider>
      <AuthProvider>
        <ThemeProvider>
          <ToastProvider>
            <StatusBar hidden={true} />
            <AppNavigator key="main-navigator" />
          </ToastProvider>
        </ThemeProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;


