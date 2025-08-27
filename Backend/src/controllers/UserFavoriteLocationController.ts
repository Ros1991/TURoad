import { Request, Response } from 'express';
import { UserFavoriteLocationService } from '@/services/UserFavoriteLocationService';
import { AppError } from '@/core/errors/AppError';

export class UserFavoriteLocationController {
  private userFavoriteLocationService: UserFavoriteLocationService;

  constructor() {
    this.userFavoriteLocationService = new UserFavoriteLocationService();
  }

  async getUserFavoriteLocations(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.id as string);
      
      if (isNaN(userId)) {
        throw new AppError('Invalid user ID', 400);
      }

      const favoriteLocations = await this.userFavoriteLocationService.getUserFavoriteLocations(userId);
      
      res.status(200).json({
        success: true,
        data: favoriteLocations
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      } else {
        console.error('Error in getUserFavoriteLocations:', error);
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    }
  }

  async addFavoriteLocation(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.id as string);
      const { locationId } = req.body;
      
      if (isNaN(userId)) {
        throw new AppError('Invalid user ID', 400);
      }

      if (!locationId || isNaN(parseInt(locationId))) {
        throw new AppError('Valid location ID is required', 400);
      }

      const favoriteLocation = await this.userFavoriteLocationService.addFavoriteLocation(userId, parseInt(locationId));
      
      res.status(201).json({
        success: true,
        message: 'Location added to favorites successfully',
        data: favoriteLocation
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      } else {
        console.error('Error in addFavoriteLocation:', error);
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    }
  }

  async removeFavoriteLocation(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.id as string);
      const locationId = parseInt(req.params.locationId as string);
      
      if (isNaN(userId)) {
        throw new AppError('Invalid user ID', 400);
      }

      if (isNaN(locationId)) {
        throw new AppError('Invalid location ID', 400);
      }

      await this.userFavoriteLocationService.removeFavoriteLocation(userId, locationId);
      
      res.status(200).json({
        success: true,
        message: 'Location removed from favorites successfully'
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      } else {
        console.error('Error in removeFavoriteLocation:', error);
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    }
  }

  async getAvailableLocations(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.id as string);
      
      if (isNaN(userId)) {
        throw new AppError('Invalid user ID', 400);
      }

      const availableLocations = await this.userFavoriteLocationService.getAvailableLocations(userId);
      
      res.status(200).json({
        success: true,
        data: availableLocations
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      } else {
        console.error('Error in getAvailableLocations:', error);
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    }
  }

  async isFavoriteLocation(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.id as string);
      const locationId = parseInt(req.params.locationId as string);
      
      if (isNaN(userId)) {
        throw new AppError('Invalid user ID', 400);
      }

      if (isNaN(locationId)) {
        throw new AppError('Invalid location ID', 400);
      }

      const isFavorite = await this.userFavoriteLocationService.isFavoriteLocation(userId, locationId);
      
      res.status(200).json({
        success: true,
        data: { isFavorited: isFavorite }
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      } else {
        console.error('Error in isFavoriteLocation:', error);
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    }
  }

  async toggleFavoriteLocation(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.id as string);
      const { locationId } = req.body;
      
      if (isNaN(userId)) {
        throw new AppError('Invalid user ID', 400);
      }

      if (!locationId || isNaN(parseInt(locationId))) {
        throw new AppError('Valid location ID is required', 400);
      }

      const result = await this.userFavoriteLocationService.toggleFavoriteLocation(userId, parseInt(locationId));
      
      res.status(200).json({
        success: true,
        message: result.isFavorited ? 'Location added to favorites' : 'Location removed from favorites',
        data: result
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      } else {
        console.error('Error in toggleFavoriteLocation:', error);
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    }
  }
}
