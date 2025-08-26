import { Router } from 'express';
import { PublicController } from '../controllers/PublicController';
import { optionalAuthenticate } from '@/middleware/auth';

const router = Router();
const publicController = new PublicController();

// Public endpoints for HomeScreen data
router.get('/categories', publicController.getCategories.bind(publicController));
router.get('/routes', publicController.getRoutes.bind(publicController));
router.get('/cities/:cityId', optionalAuthenticate, publicController.getCityById.bind(publicController));
router.get('/cities', publicController.getCities.bind(publicController));
router.get('/events', publicController.getEvents.bind(publicController));
router.get('/locations/businesses', publicController.getBusinesses.bind(publicController));

// Historical places routes
router.get('/locations/historical', publicController.getHistoricalPlaces.bind(publicController));

// Hosting routes  
router.get('/locations/hosting', publicController.getHosting.bind(publicController));

// Categories with routes
router.get('/categories/with-routes', publicController.getCategoriesWithRoutes.bind(publicController));

// Search endpoints
router.get('/cities/search', publicController.searchCities.bind(publicController));

// FAQ endpoint
router.get('/faqs', publicController.getFAQs.bind(publicController));

export default router;
