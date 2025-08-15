import { Router } from 'express';
import { AuthController } from '@/controllers/AuthController';
import { authenticate, requireAdmin } from '@/middleware/auth';

const router = Router();
const authController = new AuthController();

// Public routes
router.post('/login', authController.login.bind(authController));
router.post('/register', authController.register.bind(authController));
router.post('/refresh-token', authController.refreshToken.bind(authController));
router.post('/logout', authController.logout.bind(authController));
router.post('/validate-token', authController.validateToken.bind(authController));
// Password recovery routes removed - User entity doesn't have email field

// Protected routes
router.use(authenticate); // All routes below require authentication

router.get('/profile', authController.getUserProfile.bind(authController));
router.post('/change-password', authController.changePassword.bind(authController));
router.post('/logout-all', authController.logoutAll.bind(authController));
router.get('/tokens', authController.getActiveTokens.bind(authController));
router.delete('/tokens/:tokenHash', authController.revokeToken.bind(authController));

// Admin only routes
router.post('/cleanup-tokens', requireAdmin, authController.cleanupExpiredTokens.bind(authController));

export default router;

