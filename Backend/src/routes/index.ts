import { Router } from 'express'

// Import route modules
import authRoutes from './authRoutes'
import userRoutes from './usersRoutes'
import categoriesRoutes from './categoriesRoutes'
import citiesRoutes from './citiesRoutes'
import routesRoutes from './routesRoutes'
import locationsRoutes from './locationsRoutes'
import eventsRoutes from './eventsRoutes'
import typesRoutes from './typesRoutes'
import faqsRoutes from './faqsRoutes'
import localizedTextsRoutes from './localizedTextsRoutes'
import publicRoutes from './publicRoutes'

const router = Router()

// Public routes (no authentication required)
router.use('/public', publicRoutes)

// Mount routes
router.use('/auth', authRoutes)
router.use('/users', userRoutes)
router.use('/categories', categoriesRoutes)
router.use('/cities', citiesRoutes)
router.use('/routes', routesRoutes)
router.use('/locations', locationsRoutes)
router.use('/events', eventsRoutes)
router.use('/types', typesRoutes)
router.use('/faqs', faqsRoutes)
router.use('/localized-texts', localizedTextsRoutes)


// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'TURoad API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  })
})

// API status endpoint
router.get('/status', (req, res) => {
  res.json({
    success: true,
    message: 'TURoad API Status',
    endpoints: {
      auth: '/api/v1/auth',
      users: '/api/v1/users',
    },
    timestamp: new Date().toISOString()
  })
})

export default router

