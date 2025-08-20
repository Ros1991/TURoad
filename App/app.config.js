import 'dotenv/config';

export default {
  expo: {
    name: process.env.EXPO_APP_NAME || 'TURoad',
    slug: process.env.EXPO_APP_SLUG || 'turoad',
    version: process.env.EXPO_APP_VERSION || '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff'
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: process.env.IOS_BUNDLE_IDENTIFIER || 'com.turoad.app',
      buildNumber: process.env.IOS_BUILD_NUMBER || '1'
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#FFFFFF'
      },
      package: process.env.ANDROID_PACKAGE || 'com.turoad.app',
      versionCode: parseInt(process.env.ANDROID_VERSION_CODE || '1')
    },
    web: {
      favicon: './assets/favicon.png'
    },
    plugins: [
      'expo-dev-client',
      [
        'expo-updates',
        {
          enabled: process.env.NODE_ENV !== 'development',
          checkAutomatically: 'ON_LOAD',
          fallbackToCacheTimeout: 0,
          codeSigningCertificate: process.env.EXPO_CODE_SIGNING_CERTIFICATE,
          codeSigningMetadata: process.env.EXPO_CODE_SIGNING_METADATA ? JSON.parse(process.env.EXPO_CODE_SIGNING_METADATA) : {}
        }
      ]
    ],
    extra: {
      // Custom update server configuration
      updateUrl: process.env.EXPO_UPDATE_URL,
      storageUrl: process.env.EXPO_STORAGE_URL,
      // Environment variables for the app
      apiUrl: process.env.API_URL || 'http://localhost:3001',
      environment: process.env.NODE_ENV || 'development'
    },
    runtimeVersion: '1.0.0'
  }
};
