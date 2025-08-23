import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config } from '@/config/environment';
import { initializeDatabase } from '@/config/database';
import { errorHandler } from '@/middleware/errorHandler';
import { notFoundHandler } from '@/middleware/notFoundHandler';
import { languageMiddleware } from '@/middleware/languageMiddleware';
import { locationLoggingMiddleware } from '@/middleware/locationLoggingMiddleware';
import { setupRoutes } from '@/utils/setupRoutes';

class App {
  public app: express.Application;

  constructor() {
    console.log('🚀 TURoad App constructor called - loading middlewares...');
    this.app = express();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
    console.log('✅ TURoad App initialization completed');
  }

  private initializeMiddlewares(): void {
    // Security middleware
    this.app.use(helmet());
    
    // CORS configuration
    this.app.use(cors({
      origin: config.server.corsOrigin,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept-Language', 'X-Language', 'X-User-Location', 'X-Location-Accuracy'],
    }));

    // Compression middleware
    this.app.use(compression());

    // Logging middleware
    if (config.server.nodeEnv !== 'test') {
      this.app.use(morgan('combined'));
    }

    // Rate limiting
    const limiter = rateLimit({
      windowMs: config.rateLimit.windowMs,
      max: config.rateLimit.maxRequests,
      message: {
        error: 'Too many requests from this IP, please try again later.',
      },
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use(limiter);

    // Body parser middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    
    // Language detection middleware
    this.app.use(languageMiddleware);

    // Location headers logging middleware
    console.log('🔧 Installing location logging middleware...');
    this.app.use(locationLoggingMiddleware);
    console.log('✅ Location logging middleware installed');

    // Static files
    this.app.use('/uploads', express.static('uploads'));
  }

  private initializeRoutes(): void {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: config.server.nodeEnv,
      });
    });

    // API routes
    setupRoutes(this.app);
  }

  private initializeErrorHandling(): void {
    // 404 handler
    this.app.use(notFoundHandler);
    
    // Global error handler
    this.app.use(errorHandler);
  }

  public async start(): Promise<void> {
    try {
      // Initialize database
      await initializeDatabase();

      // Start server
      this.app.listen(config.server.port, '0.0.0.0', () => {
        console.log(`🚀 Server running on port ${config.server.port}`);
        console.log(`📝 Environment: ${config.server.nodeEnv}`);
        console.log(`🔗 API Base URL: http://localhost:${config.server.port}${config.server.apiPrefix}`);
      });
    } catch (error) {
      console.error('❌ Failed to start server:', error);
      process.exit(1);
    }
  }
}

// Start the application
const app = new App();

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start the server
if (require.main === module) {
  app.start().catch((error) => {
    console.error('❌ Failed to start application:', error);
    process.exit(1);
  });
}

export default app;

