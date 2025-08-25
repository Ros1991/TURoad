import { Request, Response, NextFunction } from 'express';

export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface RequestWithLocation extends Request {
  userLocation?: UserLocation;
}

/**
 * Middleware to parse location headers and add to request object
 * Parses X-User-Location and X-Location-Accuracy headers when present
 */
export const locationLoggingMiddleware = (req: RequestWithLocation, res: Response, next: NextFunction): void => {
  const userLocationHeader = req.headers['x-user-location'] as string;
  const locationAccuracyHeader = req.headers['x-location-accuracy'] as string;
  
  if (userLocationHeader) {
    try {
      const coords = userLocationHeader.split(',');
      if (coords.length === 2 && coords[0] && coords[1]) {
        const lat = parseFloat(coords[0].trim());
        const lng = parseFloat(coords[1].trim());
        
        if (!isNaN(lat) && !isNaN(lng)) {
          req.userLocation = {
            latitude: lat,
            longitude: lng
          };
          
          // Add accuracy if provided
          if (locationAccuracyHeader) {
            const accuracy = parseFloat(locationAccuracyHeader);
            if (!isNaN(accuracy)) {
              req.userLocation.accuracy = accuracy;
            }
          }
          
        } else {
          console.log('❌ Invalid coordinates in location header:', userLocationHeader);
        }
      }
    } catch (error) {
      console.log('❌ Error parsing location header:', userLocationHeader, error);
    }
  }
  
  next();
};
