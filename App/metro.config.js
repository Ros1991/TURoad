const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/**
 * Metro configuration for Expo bare workflow
 * https://docs.expo.dev/guides/customizing-metro/
 *
 * @type {import('expo/metro-config').MetroConfig}
 */
const config = getDefaultConfig(__dirname);

// Enable CSS support for NativeWind (if needed in future)
// config = withNativeWind(config, { input: './global.css' });

// Support for pnpm (hoisted node_modules)
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
  path.resolve(__dirname, '../../node_modules'),
];

// Additional resolver settings for better compatibility
config.resolver.alias = {
  // Add any aliases you might need
  '@': path.resolve(__dirname, 'src'),
};

// Enable symlinks support for monorepo
config.resolver.unstable_enableSymlinks = true;

// Support more file types
config.resolver.assetExts.push(
  // Adds support for more asset types
  'db', 'mp3', 'ttf', 'obj', 'png', 'jpg'
);

module.exports = config;
