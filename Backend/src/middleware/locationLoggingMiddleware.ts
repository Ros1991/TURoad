import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to log location headers information
 * Logs X-User-Location and X-Location-Accuracy headers when present
 */
export const locationLoggingMiddleware = (req: Request, res: Response, next: NextFunction): void => {

  const userLocation = req.headers['x-user-location'] as string;
  const locationAccuracy = req.headers['x-location-accuracy'] as string;
  
  if (userLocation || locationAccuracy) {

    if (userLocation) {

    }
    if (locationAccuracy) {

    }
  }
  else {

  }
  
  next();
};
