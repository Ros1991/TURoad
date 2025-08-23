import { Application } from 'express';
import { config } from '@/config/environment';
import authRoutes from '@/routes/authRoutes';
import userRoutes from '@/routes/usersRoutes';
import categoryRoutes from '@/routes/categoriesRoutes';
import typeRoutes from '@/routes/typesRoutes';
import faqRoutes from '@/routes/faqsRoutes';
import cityRoutes from '@/routes/citiesRoutes';
import routesRoutes from '@/routes/routesRoutes';
import locationsRoutes from '@/routes/locationsRoutes';
import eventsRoutes from '@/routes/eventsRoutes';
import publicRoutes from '@/routes/publicRoutes';

export const setupRoutes = (app: Application): void => {
  const apiPrefix = config.server.apiPrefix;

  // Public routes (for HomeScreen data)
  app.use(`${apiPrefix}/public`, publicRoutes);
  
  // Authentication routes
  app.use(`${apiPrefix}/auth`, authRoutes);
  
  // Module routes
  app.use(`${apiPrefix}/users`, userRoutes);
  app.use(`${apiPrefix}/categories`, categoryRoutes);
  app.use(`${apiPrefix}/types`, typeRoutes);
  app.use(`${apiPrefix}/faq`, faqRoutes);
  app.use(`${apiPrefix}/cities`, cityRoutes);
  app.use(`${apiPrefix}/routes`, routesRoutes);
  app.use(`${apiPrefix}/locations`, locationsRoutes);
  app.use(`${apiPrefix}/events`, eventsRoutes);

  // Status endpoint
  app.get(`${apiPrefix}/status`, (req, res) => {
    res.json({
      success: true,
      message: 'API is running',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    });
  });
};

