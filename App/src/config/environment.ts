interface Config {
  apiUrl: string;
  environment: string;
  isProduction: boolean;
  isDevelopment: boolean;
}

// For now, using direct configuration
// TODO: Later integrate with Expo Constants when available
const getConfig = (): Config => {
  // Read from process.env if available (Expo), otherwise use default
  const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3001';
  const environment = process.env.NODE_ENV || 'development';

  return {
    apiUrl,
    environment,
    isProduction: environment === 'production',
    isDevelopment: environment === 'development',
  };
};

export const config = getConfig();
