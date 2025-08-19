import { Request, Response } from 'express';
import { UserFavoriteCityService } from '@/services/UserFavoriteCityService';
import { AppError } from '@/core/errors/AppError';

export class UserFavoriteCityController {
  private userFavoriteCityService: UserFavoriteCityService;

  constructor() {
    this.userFavoriteCityService = new UserFavoriteCityService();
  }

  async getUserFavoriteCities(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.id as string);
      
      if (isNaN(userId)) {
        throw new AppError('Invalid user ID', 400);
      }

      const favoriteCities = await this.userFavoriteCityService.getUserFavoriteCities(userId);
      
      res.status(200).json({
        success: true,
        data: favoriteCities
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      } else {
        console.error('Error in getUserFavoriteCities:', error);
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    }
  }

  async addFavoriteCity(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.id as string);
      const { cityId } = req.body;
      
      if (isNaN(userId)) {
        throw new AppError('Invalid user ID', 400);
      }

      if (!cityId || isNaN(parseInt(cityId))) {
        throw new AppError('Valid city ID is required', 400);
      }

      const favoriteCity = await this.userFavoriteCityService.addFavoriteCity(userId, parseInt(cityId));
      
      res.status(201).json({
        success: true,
        message: 'City added to favorites successfully',
        data: favoriteCity
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      } else {
        console.error('Error in addFavoriteCity:', error);
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    }
  }

  async removeFavoriteCity(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.id as string);
      const cityId = parseInt(req.params.cityId as string);
      
      if (isNaN(userId)) {
        throw new AppError('Invalid user ID', 400);
      }

      if (isNaN(cityId)) {
        throw new AppError('Invalid city ID', 400);
      }

      await this.userFavoriteCityService.removeFavoriteCity(userId, cityId);
      
      res.status(200).json({
        success: true,
        message: 'City removed from favorites successfully'
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      } else {
        console.error('Error in removeFavoriteCity:', error);
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    }
  }

  async getAvailableCities(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.id as string);
      
      if (isNaN(userId)) {
        throw new AppError('Invalid user ID', 400);
      }

      const availableCities = await this.userFavoriteCityService.getAvailableCities(userId);
      
      res.status(200).json({
        success: true,
        data: availableCities
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      } else {
        console.error('Error in getAvailableCities:', error);
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    }
  }
}
