import React from 'react';
import { ThemeProvider as RestyleThemeProvider } from '@shopify/restyle';
import theme from './theme';

interface ThemeProviderProps {
  children: React.ReactNode;
}

const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  return (
    <RestyleThemeProvider theme={theme}>
      {children}
    </RestyleThemeProvider>
  );
};

export default ThemeProvider;

