import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  schema: string;
  logging: boolean;
}

interface JwtConfig {
  secret: string;
  expiresIn: string;
  refreshExpiresIn: string;
}

interface ServerConfig {
  port: number;
  nodeEnv: string;
  apiPrefix: string;
  corsOrigin: string;
}

interface EmailConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
}

interface UploadConfig {
  path: string;
  maxFileSize: number;
  allowedFileTypes: string[];
}

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

interface LogConfig {
  level: string;
  file: string;
}

interface FirebaseConfig {
  projectId: string;
  privateKey: string;
  clientEmail: string;
}

interface GoogleMapsConfig {
  apiKey: string;
}

interface Config {
  database: DatabaseConfig;
  jwt: JwtConfig;
  server: ServerConfig;
  email: EmailConfig;
  upload: UploadConfig;
  rateLimit: RateLimitConfig;
  log: LogConfig;
  firebase: FirebaseConfig;
  googleMaps: GoogleMapsConfig;
}

const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = process.env[key];
  if (!value && !defaultValue) {
    throw new Error(`Environment variable ${key} is required`);
  }
  return value || defaultValue!;
};

const getEnvNumber = (key: string, defaultValue?: number): number => {
  const value = process.env[key];
  if (!value && defaultValue === undefined) {
    throw new Error(`Environment variable ${key} is required`);
  }
  return value ? parseInt(value, 10) : defaultValue!;
};

const getEnvBoolean = (key: string, defaultValue: boolean = false): boolean => {
  const value = process.env[key];
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true';
};

export const config: Config = {
  database: {
    host: getEnvVar('DB_HOST', 'localhost'),
    port: getEnvNumber('DB_PORT', 5432),
    username: getEnvVar('DB_USERNAME', 'postgres'),
    password: getEnvVar('DB_PASSWORD', 'postgres'),
    database: getEnvVar('DB_DATABASE', 'turoad_db'),
    schema: getEnvVar('DB_SCHEMA', 'public'),
    logging: getEnvBoolean('DB_LOGGING', false),
  },
  jwt: {
    secret: getEnvVar('JWT_SECRET', 'turoad-development-secret-key-2024'),
    expiresIn: getEnvVar('JWT_EXPIRES_IN', '24h'),
    refreshExpiresIn: getEnvVar('JWT_REFRESH_EXPIRES_IN', '7d'),
  },
  server: {
    port: getEnvNumber('PORT', 3001),
    nodeEnv: getEnvVar('NODE_ENV', 'development'),
    apiPrefix: getEnvVar('API_PREFIX', '/api/v1'),
    corsOrigin: getEnvVar('CORS_ORIGIN', '*'),
  },
  email: {
    host: getEnvVar('SMTP_HOST', 'smtp.gmail.com'),
    port: getEnvNumber('SMTP_PORT', 587),
    user: getEnvVar('SMTP_USER', ''),
    pass: getEnvVar('SMTP_PASS', ''),
    from: getEnvVar('SMTP_FROM', 'noreply@turoad.com'),
  },
  upload: {
    path: getEnvVar('UPLOAD_PATH', './uploads'),
    maxFileSize: getEnvNumber('MAX_FILE_SIZE', 10485760), // 10MB
    allowedFileTypes: getEnvVar('ALLOWED_FILE_TYPES', 'audio/mpeg,audio/wav,audio/mp3,image/jpeg,image/png,image/gif').split(','),
  },
  rateLimit: {
    windowMs: getEnvNumber('RATE_LIMIT_WINDOW_MS', 900000), // 15 minutes
    maxRequests: getEnvNumber('RATE_LIMIT_MAX_REQUESTS', 100),
  },
  log: {
    level: getEnvVar('LOG_LEVEL', 'info'),
    file: getEnvVar('LOG_FILE', './logs/app.log'),
  },
  firebase: {
    projectId: getEnvVar('FIREBASE_PROJECT_ID', ''),
    privateKey: getEnvVar('FIREBASE_PRIVATE_KEY', ''),
    clientEmail: getEnvVar('FIREBASE_CLIENT_EMAIL', ''),
  },
  googleMaps: {
    apiKey: getEnvVar('GOOGLE_MAPS_API_KEY', ''),
  },
};

// Validate critical configurations
if (config.server.nodeEnv === 'production') {
  if (!config.jwt.secret || config.jwt.secret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long in production');
  }
  
  if (!config.email.user || !config.email.pass) {
    console.warn('⚠️  Email configuration is incomplete. Password recovery will not work.');
  }
}

// Create upload directory if it doesn't exist
import fs from 'fs';
if (!fs.existsSync(config.upload.path)) {
  fs.mkdirSync(config.upload.path, { recursive: true });
}

// Create logs directory if it doesn't exist
const logDir = path.dirname(config.log.file);
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

