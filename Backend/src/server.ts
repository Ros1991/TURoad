import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/environment';
import { initializeDatabase } from './config/database';
import { errorHandler } from './middleware/errorHandler';
import { languageMiddleware } from './middleware/languageMiddleware';
import { locationLoggingMiddleware } from './middleware/locationLoggingMiddleware';

// Import ALL routes
import routes from './routes';


class TURoadServer {
  public app: express.Application;

  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    // Security
    this.app.use(helmet());
    
    // CORS - Allow frontend connections
    this.app.use(cors({
      origin: ['http://localhost:5174'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept-Language', 'X-User-Location', 'X-Location-Accuracy'],
    }));

    // Logging
    this.app.use(morgan('dev'));

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));

    // Language detection middleware
    this.app.use(languageMiddleware);

    // Location headers logging middleware
    this.app.use(locationLoggingMiddleware);
  }

  private initializeRoutes(): void {
    // Health check
    this.app.get('/api/status', (req, res) => {
      res.json({
        success: true,
        message: 'TURoad API is running',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        environment: config.server.nodeEnv,
      });
    });

    this.app.get('/api/health', (req, res) => {
      res.json({
        success: true,
        status: 'healthy',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
      });
    });

    // API Routes - NO v1 prefix, clean URLs
    this.app.use('/api', routes);
  }

  private initializeErrorHandling(): void {
    // 404 handler
    this.app.use((req, res) => {
      res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.path,
      });
    });

    // Global error handler
    this.app.use(errorHandler);
  }

  public async start(): Promise<void> {
    try {
      // Initialize database and run seeds
      console.log('🔄 Initializing database connection...');
      await initializeDatabase();
      console.log('✅ Database connected and seeds executed');
      
      const PORT = config.server.port;
      
      this.app.listen(PORT, '0.0.0.0', () => {
        console.log('='.repeat(60));
        console.log('🚀 TURoad API Server STARTED');
        console.log('='.repeat(60));
        console.log(`📍 Environment: ${config.server.nodeEnv}`);
        console.log(`🔗 Server: http://localhost:${PORT}`);
        console.log(`🌐 API Base: http://localhost:${PORT}/api`);
        console.log(`⏰ Started at: ${new Date().toISOString()}`);
        console.log('='.repeat(60));
      });
      
    } catch (error) {
      console.error('❌ Failed to start TURoad server:', error);
      process.exit(1);
    }
  }
}

// Start the server
const server = new TURoadServer();
server.start();

export default server;
