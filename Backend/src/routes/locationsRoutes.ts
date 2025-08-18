import { Router } from 'express';
import { authenticate } from '@/middleware/auth';
import { LocationsController } from '@/controllers/LocationsController';

const router = Router();
const controller = new LocationsController();

// Public routes
router.get('/', controller.list.bind(controller));
router.get('/:id', controller.getById.bind(controller));

// Protected routes
router.post('/', authenticate, controller.create.bind(controller));
router.put('/:id', authenticate, controller.update.bind(controller));
router.delete('/:id', authenticate, controller.delete.bind(controller));

// Story routes (nested under locations)
router.get('/:id/stories', controller.getStories.bind(controller));
router.get('/:id/stories/:storyId', controller.getStory.bind(controller));
router.post('/:id/stories', authenticate, controller.createStory.bind(controller));
router.put('/:id/stories/:storyId', authenticate, controller.updateStory.bind(controller));
router.delete('/:id/stories/:storyId', authenticate, controller.deleteStory.bind(controller));

export default router;
