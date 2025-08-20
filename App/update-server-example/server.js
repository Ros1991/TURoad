const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3002;

// Enable CORS for all origins in development
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization', 'expo-platform', 'expo-runtime-version']
}));

app.use(express.json());

// Serve static files from updates directory
app.use('/assets', express.static(path.join(__dirname, 'updates')));

// Metadata for updates (in production, this would be in a database)
const updateManifests = {
  'android': {
    '1.0.0': {
      id: 'android-1.0.0-update-1',
      createdAt: '2024-01-15T10:00:00.000Z',
      runtimeVersion: '1.0.0',
      platform: 'android',
      assets: [
        {
          url: `http://localhost:${PORT}/assets/android/1.0.0/bundle.js`,
          key: 'bundle.js',
          contentType: 'application/javascript'
        }
      ],
      launchAsset: {
        url: `http://localhost:${PORT}/assets/android/1.0.0/bundle.js`,
        key: 'bundle.js',
        contentType: 'application/javascript'
      }
    }
  },
  'ios': {
    '1.0.0': {
      id: 'ios-1.0.0-update-1',
      createdAt: '2024-01-15T10:00:00.000Z',
      runtimeVersion: '1.0.0',
      platform: 'ios',
      assets: [
        {
          url: `http://localhost:${PORT}/assets/ios/1.0.0/bundle.js`,
          key: 'bundle.js',
          contentType: 'application/javascript'
        }
      ],
      launchAsset: {
        url: `http://localhost:${PORT}/assets/ios/1.0.0/bundle.js`,
        key: 'bundle.js',
        contentType: 'application/javascript'
      }
    }
  }
};

// Expo Updates API endpoint
app.get('/api/manifest', (req, res) => {
  const platform = req.get('expo-platform') || 'android';
  const runtimeVersion = req.get('expo-runtime-version') || '1.0.0';
  
  console.log(`Update request - Platform: ${platform}, Runtime Version: ${runtimeVersion}`);
  
  const manifest = updateManifests[platform]?.[runtimeVersion];
  
  if (!manifest) {
    return res.status(404).json({
      error: 'No update available',
      message: `No update found for platform ${platform} and runtime version ${runtimeVersion}`
    });
  }
  
  // Check if update files exist
  const bundlePath = path.join(__dirname, 'updates', platform, runtimeVersion, 'bundle.js');
  if (!fs.existsSync(bundlePath)) {
    return res.status(404).json({
      error: 'Update assets not found',
      message: 'Update manifest exists but assets are missing'
    });
  }
  
  res.json({
    ...manifest,
    serverTime: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    availableUpdates: Object.keys(updateManifests).reduce((acc, platform) => {
      acc[platform] = Object.keys(updateManifests[platform]);
      return acc;
    }, {})
  });
});

// Upload new update endpoint (for deployment)
app.post('/api/upload', (req, res) => {
  // In production, implement proper authentication
  const { platform, runtimeVersion, bundle } = req.body;
  
  if (!platform || !runtimeVersion || !bundle) {
    return res.status(400).json({
      error: 'Missing required fields',
      required: ['platform', 'runtimeVersion', 'bundle']
    });
  }
  
  // Create directory structure
  const updateDir = path.join(__dirname, 'updates', platform, runtimeVersion);
  fs.mkdirSync(updateDir, { recursive: true });
  
  // Write bundle file
  const bundlePath = path.join(updateDir, 'bundle.js');
  fs.writeFileSync(bundlePath, bundle);
  
  // Update manifest
  const updateId = `${platform}-${runtimeVersion}-update-${Date.now()}`;
  const manifest = {
    id: updateId,
    createdAt: new Date().toISOString(),
    runtimeVersion,
    platform,
    assets: [
      {
        url: `http://localhost:${PORT}/assets/${platform}/${runtimeVersion}/bundle.js`,
        key: 'bundle.js',
        contentType: 'application/javascript'
      }
    ],
    launchAsset: {
      url: `http://localhost:${PORT}/assets/${platform}/${runtimeVersion}/bundle.js`,
      key: 'bundle.js',
      contentType: 'application/javascript'
    }
  };
  
  if (!updateManifests[platform]) {
    updateManifests[platform] = {};
  }
  updateManifests[platform][runtimeVersion] = manifest;
  
  console.log(`New update uploaded: ${updateId}`);
  
  res.json({
    success: true,
    updateId,
    manifest
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`📱 Expo Update Server running on http://localhost:${PORT}`);
  console.log(`🔍 Health check: http://localhost:${PORT}/health`);
  console.log(`📋 Available platforms: ${Object.keys(updateManifests).join(', ')}`);
  
  // Create updates directory structure
  Object.keys(updateManifests).forEach(platform => {
    Object.keys(updateManifests[platform]).forEach(version => {
      const dir = path.join(__dirname, 'updates', platform, version);
      fs.mkdirSync(dir, { recursive: true });
      
      // Create sample bundle if it doesn't exist
      const bundlePath = path.join(dir, 'bundle.js');
      if (!fs.existsSync(bundlePath)) {
        fs.writeFileSync(bundlePath, `
// Sample bundle for ${platform} ${version}
console.log('TURoad Update Bundle loaded for ${platform} ${version}');
export default {};
        `.trim());
      }
    });
  });
});
