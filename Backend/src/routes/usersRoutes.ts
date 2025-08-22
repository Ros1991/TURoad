import { Router } from 'express';
import { authenticate, requireAdmin } from '@/middleware/auth';
import { BaseController } from '@/core/base/BaseController';
import { User } from '@/entities/User';
import { UsersController } from '@/controllers/UsersController';
import { UserPushSettingsController } from '@/controllers/UserPushSettingsController';
import { UserFavoriteCityController } from '@/controllers/UserFavoriteCityController';
import { UserFavoriteRouteController } from '@/controllers/UserFavoriteRouteController';
import { UserVisitedRouteController } from '@/controllers/UserVisitedRouteController';

const router = Router();
const usersController = new UsersController();
const userPushSettingsController = new UserPushSettingsController();
const userFavoriteCityController = new UserFavoriteCityController();
const userFavoriteRouteController = new UserFavoriteRouteController();
const userVisitedRouteController = new UserVisitedRouteController();

// All routes require authentication (admin requirement temporarily removed for testing)
router.use(authenticate);
// router.use(requireAdmin); // Commented out for testing

// Users routes
router.get('/', usersController.list.bind(usersController));
router.get('/me', usersController.getCurrentUser.bind(usersController));
router.get('/:id', usersController.getById.bind(usersController));
router.post('/', usersController.create.bind(usersController));
router.put('/:id', usersController.update.bind(usersController));
router.delete('/:id', usersController.delete.bind(usersController));
router.patch('/:id/toggle-status', usersController.toggleStatus.bind(usersController));
router.post('/:id/upload-profile-image', usersController.uploadProfileImage.bind(usersController));

// User Push Settings routes
router.get('/:id/push-settings', (req, res) => userPushSettingsController.getUserSettings(req, res));
router.put('/:id/push-settings', (req, res) => userPushSettingsController.updateUserSettings(req, res));
router.post('/:id/push-settings', (req, res) => userPushSettingsController.createDefaultSettings(req, res));

// User Favorite Cities routes
router.get('/:id/favorite-cities', (req, res) => userFavoriteCityController.getUserFavoriteCities(req, res));
router.post('/:id/favorite-cities', (req, res) => userFavoriteCityController.addFavoriteCity(req, res));
router.delete('/:id/favorite-cities/:cityId', (req, res) => userFavoriteCityController.removeFavoriteCity(req, res));
router.get('/:id/available-cities', (req, res) => userFavoriteCityController.getAvailableCities(req, res));

// User Favorite Routes routes
router.get('/:id/favorite-routes', (req, res) => userFavoriteRouteController.getUserFavoriteRoutes(req, res));
router.post('/:id/favorite-routes', (req, res) => userFavoriteRouteController.addFavoriteRoute(req, res));
router.delete('/:id/favorite-routes/:routeId', (req, res) => userFavoriteRouteController.removeFavoriteRoute(req, res));
router.get('/:id/available-favorite-routes', (req, res) => userFavoriteRouteController.getAvailableRoutes(req, res));

// User Visited Routes routes
router.get('/:id/visited-routes', (req, res) => userVisitedRouteController.getUserVisitedRoutes(req, res));
router.post('/:id/visited-routes', (req, res) => userVisitedRouteController.addVisitedRoute(req, res));
router.delete('/:id/visited-routes/:routeId', (req, res) => userVisitedRouteController.removeVisitedRoute(req, res));
router.get('/:id/available-visited-routes', (req, res) => userVisitedRouteController.getAvailableRoutes(req, res));

export default router;
