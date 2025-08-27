import { Router } from 'express';
import { PublicController } from '../controllers/PublicController';
import { optionalAuthenticate, authenticate } from '@/middleware/auth';

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

// Individual item endpoints
router.get('/locations/:id', publicController.getLocationById.bind(publicController));
router.get('/events/:id', publicController.getEventById.bind(publicController));
router.get('/routes/:id', optionalAuthenticate, publicController.getRouteById.bind(publicController));

// Route businesses and hosting endpoints
router.get('/routes/:routeId/businesses', publicController.getRouteBusinesses.bind(publicController));
router.get('/routes/:routeId/hosting', publicController.getRouteHosting.bind(publicController));

// User favorites endpoint (requires authentication)
router.get('/users/favorites', authenticate, publicController.getUserFavorites.bind(publicController));

export default router;
