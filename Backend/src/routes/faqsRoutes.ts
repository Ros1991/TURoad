import { Router } from 'express';
import { authenticate } from '@/middleware/auth';
import { FAQsController } from '@/controllers/FAQsController';

const router = Router();
const controller = new FAQsController();

// Public routes
router.get('/', controller.list.bind(controller));
router.get('/:id', controller.getById.bind(controller));

// Protected routes
router.post('/', authenticate, controller.create.bind(controller));
router.put('/:id', authenticate, controller.update.bind(controller));
router.delete('/:id', authenticate, controller.delete.bind(controller));

export default router;
