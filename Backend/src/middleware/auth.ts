import { Request, Response, NextFunction } from 'express';
import { JwtUtils, JwtPayload } from '@/utils/jwt';
import { AuthenticationError, AuthorizationError } from '@/utils/AppError';
import { userRepository } from '@/repositories';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = JwtUtils.extractTokenFromHeader(req.headers.authorization);
    
    if (!token) {
      throw new AuthenticationError('Access token required');
    }

    const payload = JwtUtils.verifyToken(token);
    
    // Verify user still exists and is enabled
    const user = await userRepository.findById(payload.userId);
    if (!user || !user.enabled) {
      throw new AuthenticationError('User not found or disabled');
    }

    req.user = payload;
    next();
  } catch (error) {
    next(error);
  }
};

export const optionalAuthenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = JwtUtils.extractTokenFromHeader(req.headers.authorization);
    
    if (token) {
      const payload = JwtUtils.verifyToken(token);
      
      // Verify user still exists and is enabled
      const user = await userRepository.findById(payload.userId);
      if (user && user.enabled) {
        req.user = payload;
      }
    }

    next();
  } catch (error) {
    // For optional authentication, we don't throw errors
    next();
  }
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    throw new AuthenticationError('Authentication required');
  }

  if (!req.user.isAdmin) {
    throw new AuthorizationError('Admin access required');
  }

  next();
};

export const requireSelfOrAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    throw new AuthenticationError('Authentication required');
  }

  const targetUserId = parseInt(req.params.userId || req.params.id || '0');
  
  if (req.user.userId !== targetUserId && !req.user.isAdmin) {
    throw new AuthorizationError('Access denied: can only access own resources or admin required');
  }

  next();
};

export const requireOwnershipOrAdmin = (userIdField: string = 'userId') => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AuthenticationError('Authentication required');
      }

      // If admin, allow access
      if (req.user.isAdmin) {
        return next();
      }

      // Check if the resource belongs to the user
      const resourceUserId = req.body[userIdField] || req.params[userIdField] || req.query[userIdField];
      
      if (resourceUserId && parseInt(resourceUserId) !== req.user.userId) {
        throw new AuthorizationError('Access denied: can only access own resources');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const rateLimitByUser = (maxRequests: number, windowMs: number) => {
  const userRequests = new Map<number, { count: number; resetTime: number }>();

  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next();
    }

    const userId = req.user.userId;
    const now = Date.now();
    const userLimit = userRequests.get(userId);

    if (!userLimit || now > userLimit.resetTime) {
      userRequests.set(userId, {
        count: 1,
        resetTime: now + windowMs,
      });
      return next();
    }

    if (userLimit.count >= maxRequests) {
      res.status(429).json({
        success: false,
        message: 'Too many requests, please try again later',
        retryAfter: Math.ceil((userLimit.resetTime - now) / 1000),
      });
      return;
    }

    userLimit.count++;
    next();
  };
};

