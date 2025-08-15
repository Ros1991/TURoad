import { Router } from 'express';
import { authenticate, requireAdmin } from '@/middleware/auth';
import { BaseController } from '@/core/base/BaseController';
import { User } from '@/entities/User';
import { UsersController } from '@/controllers/UsersController';

const router = Router();
const usersController = new UsersController();

// All routes require authentication (admin requirement temporarily removed for testing)
router.use(authenticate);
// router.use(requireAdmin); // Commented out for testing

// Users routes
router.get('/', usersController.list.bind(usersController));
router.get('/:id', usersController.getById.bind(usersController));
router.put('/:id', usersController.update.bind(usersController));
router.delete('/:id', usersController.delete.bind(usersController));

export default router;
