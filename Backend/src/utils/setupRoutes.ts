import { Application } from 'express';
import { config } from '@/config/environment';
import authRoutes from '@/routes/authRoutes';
import userRoutes from '@/routes/usersRoutes';
import categoryRoutes from '@/routes/categoriesRoutes';
import typeRoutes from '@/routes/typesRoutes';
import faqRoutes from '@/routes/faqRoutes';
import cityRoutes from '@/routes/citiesRoutes';

export const setupRoutes = (app: Application): void => {
  const apiPrefix = config.server.apiPrefix;

  // Authentication routes
  app.use(`${apiPrefix}/auth`, authRoutes);
  
  // Module routes
  app.use(`${apiPrefix}/users`, userRoutes);
  app.use(`${apiPrefix}/categories`, categoryRoutes);
  app.use(`${apiPrefix}/types`, typeRoutes);
  app.use(`${apiPrefix}/faq`, faqRoutes);
  app.use(`${apiPrefix}/cities`, cityRoutes);

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

