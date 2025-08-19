import { Router } from 'express';
import { authenticate, requireAdmin } from '@/middleware/auth';
import { BaseController } from '@/core/base/BaseController';
import { User } from '@/entities/User';
import { UsersController } from '@/controllers/UsersController';
import { UserPushSettingsController } from '@/controllers/UserPushSettingsController';

const router = Router();
const usersController = new UsersController();
const userPushSettingsController = new UserPushSettingsController();

// All routes require authentication (admin requirement temporarily removed for testing)
router.use(authenticate);
// router.use(requireAdmin); // Commented out for testing

// Users routes
router.get('/', usersController.list.bind(usersController));
router.get('/:id', usersController.getById.bind(usersController));
router.post('/', usersController.create.bind(usersController));
router.put('/:id', usersController.update.bind(usersController));
router.delete('/:id', usersController.delete.bind(usersController));
router.patch('/:id/toggle-status', usersController.toggleStatus.bind(usersController));

// User Push Settings routes
router.get('/:id/push-settings', (req, res) => userPushSettingsController.getUserSettings(req, res));
router.put('/:id/push-settings', (req, res) => userPushSettingsController.updateUserSettings(req, res));
router.post('/:id/push-settings', (req, res) => userPushSettingsController.createDefaultSettings(req, res));

export default router;
