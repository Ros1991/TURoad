import { Router } from 'express';
import { authenticate } from '@/middleware/auth';
import { CitiesController } from '@/controllers/CitiesController';

const router = Router();
const controller = new CitiesController();

// Public routes
router.get('/', controller.list.bind(controller));
router.get('/:id', controller.getById.bind(controller));

// Protected routes
router.post('/', authenticate, controller.create.bind(controller));
router.put('/:id', authenticate, controller.update.bind(controller));
router.delete('/:id', authenticate, controller.delete.bind(controller));

// Story routes (nested under cities)
router.get('/:id/stories', controller.getStories.bind(controller));
router.get('/:id/stories/:storyId', controller.getStory.bind(controller));
router.post('/:id/stories', authenticate, controller.createStory.bind(controller));
router.put('/:id/stories/:storyId', authenticate, controller.updateStory.bind(controller));
router.delete('/:id/stories/:storyId', authenticate, controller.deleteStory.bind(controller));

// Category association routes (nested under cities)
router.get('/:id/categories', controller.getCategories.bind(controller));
router.get('/:id/available-categories', controller.getAvailableCategories.bind(controller));
router.post('/:id/categories', authenticate, controller.addCategory.bind(controller));
router.delete('/:id/categories/:categoryId', authenticate, controller.removeCategory.bind(controller));

export default router;
