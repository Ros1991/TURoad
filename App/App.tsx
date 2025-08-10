import React from 'react';
import ThemeProvider from './src/themes/ThemeProvider';
import AppNavigator from './src/navigation/AppNavigator';
import './src/locales/i18n'; // Import i18n configuration

function App(): React.JSX.Element {
  return (
    <ThemeProvider>
      <AppNavigator />
    </ThemeProvider>
  );
}

export default App;


