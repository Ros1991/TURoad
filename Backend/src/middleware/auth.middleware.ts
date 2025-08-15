import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/environment';
import { AppError } from '../core/errors/AppError';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { JwtToken } from '../entities/JwtToken';

export interface AuthRequest extends Request {
  user?: {
    userId: number;
    username: string;
    isAdmin: boolean;
  };
}

/**
 * Verify JWT token and attach user to request
 */
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw AppError.unauthorized('No token provided');
    }

    const token = authHeader.substring(7);

    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret) as any;
    
    // Check if token exists in database and is not revoked
    const tokenRepository = AppDataSource.getRepository(JwtToken);
    const storedToken = await tokenRepository.findOne({
      where: {
        userId: decoded.userId,
        revoked: false
      }
    });

    if (!storedToken) {
      throw AppError.unauthorized('Token has been revoked');
    }

    // Check if token is expired
    if (new Date(storedToken.expirationDate) < new Date()) {
      throw AppError.unauthorized('Token has expired');
    }

    // Get user from database
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { userId: decoded.userId }
    });

    if (!user) {
      throw AppError.unauthorized('User not found');
    }

    if (!user.enabled) {
      throw AppError.forbidden('User account is disabled');
    }

    // Attach user to request
    req.user = {
      userId: user.userId,
      username: user.username,
      isAdmin: user.isAdmin
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(AppError.unauthorized('Invalid token'));
    } else {
      next(error);
    }
  }
};

/**
 * Check if user is admin
 */
export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    return next(AppError.unauthorized('Authentication required'));
  }

  if (!req.user.isAdmin) {
    return next(AppError.forbidden('Admin access required'));
  }

  next();
};

/**
 * Optional authentication - doesn't fail if no token
 */
export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, config.jwt.secret) as any;
    
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { userId: decoded.userId }
    });

    if (user && user.enabled) {
      req.user = {
        userId: user.userId,
        username: user.username,
        isAdmin: user.isAdmin
      };
    }

    next();
  } catch {
    // Ignore errors in optional auth
    next();
  }
};

/**
 * Rate limiting middleware
 */
export const rateLimit = (maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) => {
  const requests = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, res: Response, next: NextFunction): void => {
    const identifier = req.ip || 'unknown';
    const now = Date.now();
    
    const requestData = requests.get(identifier);
    
    if (!requestData || requestData.resetTime < now) {
      requests.set(identifier, {
        count: 1,
        resetTime: now + windowMs
      });
      return next();
    }
    
    if (requestData.count >= maxRequests) {
      return next(AppError.tooManyRequests('Rate limit exceeded'));
    }
    
    requestData.count++;
    next();
  };
};

/**
 * Check if user owns the resource
 */
export const requireOwnership = (resourceUserIdParam: string = 'userId') => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(AppError.unauthorized('Authentication required'));
    }

    const userIdParam = req.params[resourceUserIdParam];
    if (!userIdParam) {
      return next(AppError.badRequest('Missing user ID parameter'));
    }
    
    const resourceUserId = parseInt(userIdParam);
    if (isNaN(resourceUserId)) {
      return next(AppError.badRequest('Invalid user ID'));
    }

    // Admins can access any resource
    if (req.user.isAdmin) {
      return next();
    }

    // Regular users can only access their own resources
    if (req.user.userId !== resourceUserId) {
      return next(AppError.forbidden('Access denied'));
    }

    next();
  };
};
