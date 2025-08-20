const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Configure AWS SDK (use environment variables or AWS credentials file)
AWS.config.update({
  region: process.env.AWS_REGION || 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const s3 = new AWS.S3();

class ExpoS3Updater {
  constructor(bucketName, keyPrefix = 'expo-updates/') {
    this.bucketName = bucketName;
    this.keyPrefix = keyPrefix;
  }

  /**
   * Upload update bundle to S3
   */
  async uploadUpdate(platform, runtimeVersion, bundlePath, assetsDir = null) {
    try {
      console.log(`🚀 Uploading update for ${platform} ${runtimeVersion}...`);
      
      const updateId = `${platform}-${runtimeVersion}-${Date.now()}`;
      const bundleContent = fs.readFileSync(bundlePath);
      const bundleHash = crypto.createHash('sha256').update(bundleContent).digest('hex');
      
      // Upload bundle
      const bundleKey = `${this.keyPrefix}${platform}/${runtimeVersion}/bundle-${bundleHash}.js`;
      const bundleUrl = await this.uploadFile(bundleKey, bundlePath, 'application/javascript');
      
      // Upload assets if provided
      const assets = [
        {
          url: bundleUrl,
          key: 'bundle.js',
          contentType: 'application/javascript',
          fileExtension: '.js'
        }
      ];

      if (assetsDir && fs.existsSync(assetsDir)) {
        const assetFiles = fs.readdirSync(assetsDir);
        for (const file of assetFiles) {
          const filePath = path.join(assetsDir, file);
          const fileKey = `${this.keyPrefix}${platform}/${runtimeVersion}/assets/${file}`;
          const fileUrl = await this.uploadFile(fileKey, filePath);
          
          assets.push({
            url: fileUrl,
            key: file,
            contentType: this.getContentType(file),
            fileExtension: path.extname(file)
          });
        }
      }

      // Create manifest
      const manifest = {
        id: updateId,
        createdAt: new Date().toISOString(),
        runtimeVersion,
        platform,
        assets,
        launchAsset: assets[0], // Bundle is always first
        metadata: {
          bundleHash,
          deployedBy: process.env.USER || 'automated',
          deployedAt: new Date().toISOString()
        }
      };

      // Upload manifest
      const manifestKey = `${this.keyPrefix}${platform}/${runtimeVersion}/manifest.json`;
      await this.uploadJson(manifestKey, manifest);
      
      console.log(`✅ Update uploaded successfully: ${updateId}`);
      console.log(`📋 Manifest URL: ${this.getPublicUrl(manifestKey)}`);
      
      return {
        updateId,
        manifestUrl: this.getPublicUrl(manifestKey),
        bundleUrl,
        manifest
      };

    } catch (error) {
      console.error('❌ Error uploading update:', error);
      throw error;
    }
  }

  /**
   * Upload file to S3
   */
  async uploadFile(key, filePath, contentType = null) {
    const fileContent = fs.readFileSync(filePath);
    const detectedContentType = contentType || this.getContentType(filePath);
    
    const params = {
      Bucket: this.bucketName,
      Key: key,
      Body: fileContent,
      ContentType: detectedContentType,
      ACL: 'public-read',
      CacheControl: 'public, max-age=31536000', // 1 year cache for immutable assets
    };

    const result = await s3.upload(params).promise();
    console.log(`📤 Uploaded: ${key} -> ${result.Location}`);
    
    return result.Location;
  }

  /**
   * Upload JSON object to S3
   */
  async uploadJson(key, jsonObject) {
    const params = {
      Bucket: this.bucketName,
      Key: key,
      Body: JSON.stringify(jsonObject, null, 2),
      ContentType: 'application/json',
      ACL: 'public-read',
      CacheControl: 'public, max-age=300', // 5 minutes cache for manifests
    };

    const result = await s3.upload(params).promise();
    console.log(`📤 Uploaded JSON: ${key} -> ${result.Location}`);
    
    return result.Location;
  }

  /**
   * Get content type for file
   */
  getContentType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const contentTypes = {
      '.js': 'application/javascript',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.ttf': 'font/ttf',
      '.otf': 'font/otf',
      '.mp3': 'audio/mpeg',
      '.mp4': 'video/mp4',
    };
    
    return contentTypes[ext] || 'application/octet-stream';
  }

  /**
   * Get public URL for S3 object
   */
  getPublicUrl(key) {
    return `https://${this.bucketName}.s3.${AWS.config.region}.amazonaws.com/${key}`;
  }

  /**
   * List all updates for a platform
   */
  async listUpdates(platform) {
    const params = {
      Bucket: this.bucketName,
      Prefix: `${this.keyPrefix}${platform}/`,
      Delimiter: '/'
    };

    const result = await s3.listObjectsV2(params).promise();
    const versions = result.CommonPrefixes?.map(prefix => {
      const version = prefix.Prefix.split('/').slice(-2, -1)[0];
      return version;
    }) || [];

    return versions;
  }

  /**
   * Delete update from S3
   */
  async deleteUpdate(platform, runtimeVersion) {
    const prefix = `${this.keyPrefix}${platform}/${runtimeVersion}/`;
    
    // List all objects with this prefix
    const listParams = {
      Bucket: this.bucketName,
      Prefix: prefix
    };

    const objects = await s3.listObjectsV2(listParams).promise();
    
    if (objects.Contents && objects.Contents.length > 0) {
      // Delete all objects
      const deleteParams = {
        Bucket: this.bucketName,
        Delete: {
          Objects: objects.Contents.map(obj => ({ Key: obj.Key }))
        }
      };

      await s3.deleteObjects(deleteParams).promise();
      console.log(`🗑️ Deleted update: ${platform} ${runtimeVersion}`);
    }
  }
}

// CLI usage
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!process.env.S3_BUCKET) {
    console.error('❌ Error: S3_BUCKET environment variable is required');
    process.exit(1);
  }

  const updater = new ExpoS3Updater(process.env.S3_BUCKET);

  switch (command) {
    case 'upload':
      const [platform, runtimeVersion, bundlePath, assetsDir] = args.slice(1);
      if (!platform || !runtimeVersion || !bundlePath) {
        console.error('Usage: node deploy-s3.js upload <platform> <runtimeVersion> <bundlePath> [assetsDir]');
        process.exit(1);
      }
      await updater.uploadUpdate(platform, runtimeVersion, bundlePath, assetsDir);
      break;

    case 'list':
      const listPlatform = args[1];
      if (!listPlatform) {
        console.error('Usage: node deploy-s3.js list <platform>');
        process.exit(1);
      }
      const updates = await updater.listUpdates(listPlatform);
      console.log(`📱 Updates for ${listPlatform}:`, updates);
      break;

    case 'delete':
      const [delPlatform, delVersion] = args.slice(1);
      if (!delPlatform || !delVersion) {
        console.error('Usage: node deploy-s3.js delete <platform> <runtimeVersion>');
        process.exit(1);
      }
      await updater.deleteUpdate(delPlatform, delVersion);
      break;

    default:
      console.log(`
🚀 Expo S3 Update Deployer

Commands:
  upload <platform> <runtimeVersion> <bundlePath> [assetsDir]  Upload new update
  list <platform>                                             List all updates
  delete <platform> <runtimeVersion>                          Delete update

Environment Variables:
  AWS_REGION                AWS region (default: us-east-1)
  AWS_ACCESS_KEY_ID         AWS access key
  AWS_SECRET_ACCESS_KEY     AWS secret key
  S3_BUCKET                 S3 bucket name (required)

Examples:
  node deploy-s3.js upload android 1.0.0 ./dist/bundle.js ./dist/assets
  node deploy-s3.js list android
  node deploy-s3.js delete android 1.0.0
      `);
      break;
  }
}

// Run CLI if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
}

module.exports = ExpoS3Updater;
