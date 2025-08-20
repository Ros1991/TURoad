import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import * as Updates from 'expo-updates';
import ThemeProvider from './src/themes/ThemeProvider';
import AppNavigator from './src/navigation/AppNavigator';
import './src/locales/i18n'; // Import i18n configuration

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

function App(): React.JSX.Element {
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
    <ThemeProvider>
      <AppNavigator />
    </ThemeProvider>
  );
}

export default App;


