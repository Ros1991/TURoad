import { Router } from 'express';
import { PublicController } from '../controllers/PublicController';

const router = Router();
const publicController = new PublicController();

// Public endpoints for HomeScreen data
router.get('/categories', publicController.getCategories.bind(publicController));
router.get('/routes', publicController.getRoutes.bind(publicController));
router.get('/cities', publicController.getCities.bind(publicController));
router.get('/events', publicController.getEvents.bind(publicController));
router.get('/locations/businesses', publicController.getBusinesses.bind(publicController));
router.get('/locations/historical', publicController.getHistoricalPlaces.bind(publicController));

// Search endpoints
router.get('/cities/search', publicController.searchCities.bind(publicController));

export default router;
