import { Request, Response } from 'express';
import { UserFavoriteRouteService } from '@/services/UserFavoriteRouteService';
import { AppError } from '@/core/errors/AppError';

export class UserFavoriteRouteController {
  private userFavoriteRouteService: UserFavoriteRouteService;

  constructor() {
    this.userFavoriteRouteService = new UserFavoriteRouteService();
  }

  async getUserFavoriteRoutes(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.id as string);
      
      if (isNaN(userId)) {
        throw new AppError('Invalid user ID', 400);
      }

      const favoriteRoutes = await this.userFavoriteRouteService.getUserFavoriteRoutes(userId);
      
      res.status(200).json({
        success: true,
        data: favoriteRoutes
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      } else {
        console.error('Error in getUserFavoriteRoutes:', error);
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    }
  }

  async addFavoriteRoute(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.id as string);
      const { routeId } = req.body;
      
      if (isNaN(userId)) {
        throw new AppError('Invalid user ID', 400);
      }

      if (!routeId || isNaN(parseInt(routeId))) {
        throw new AppError('Valid route ID is required', 400);
      }

      const favoriteRoute = await this.userFavoriteRouteService.addFavoriteRoute(userId, parseInt(routeId));
      
      res.status(201).json({
        success: true,
        message: 'Route added to favorites successfully',
        data: favoriteRoute
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      } else {
        console.error('Error in addFavoriteRoute:', error);
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    }
  }

  async removeFavoriteRoute(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.id as string);
      const routeId = parseInt(req.params.routeId as string);
      
      if (isNaN(userId)) {
        throw new AppError('Invalid user ID', 400);
      }

      if (isNaN(routeId)) {
        throw new AppError('Invalid route ID', 400);
      }

      await this.userFavoriteRouteService.removeFavoriteRoute(userId, routeId);
      
      res.status(200).json({
        success: true,
        message: 'Route removed from favorites successfully'
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      } else {
        console.error('Error in removeFavoriteRoute:', error);
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    }
  }

  async getAvailableRoutes(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.id as string);
      
      if (isNaN(userId)) {
        throw new AppError('Invalid user ID', 400);
      }

      const availableRoutes = await this.userFavoriteRouteService.getAvailableRoutes(userId);
      
      res.status(200).json({
        success: true,
        data: availableRoutes
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      } else {
        console.error('Error in getAvailableRoutes:', error);
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    }
  }

  async isFavoriteRoute(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.id as string);
      const routeId = parseInt(req.params.routeId as string);
      
      if (isNaN(userId)) {
        throw new AppError('Invalid user ID', 400);
      }

      if (isNaN(routeId)) {
        throw new AppError('Invalid route ID', 400);
      }

      const isFavorite = await this.userFavoriteRouteService.isFavoriteRoute(userId, routeId);
      
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
        console.error('Error in isFavoriteRoute:', error);
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    }
  }

  async toggleFavoriteRoute(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.id as string);
      const { routeId } = req.body;
      
      if (isNaN(userId)) {
        throw new AppError('Invalid user ID', 400);
      }

      if (!routeId || isNaN(parseInt(routeId))) {
        throw new AppError('Valid route ID is required', 400);
      }

      const result = await this.userFavoriteRouteService.toggleFavoriteRoute(userId, parseInt(routeId));
      
      res.status(200).json({
        success: true,
        message: result.isFavorited ? 'Route added to favorites' : 'Route removed from favorites',
        data: result
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      } else {
        console.error('Error in toggleFavoriteRoute:', error);
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    }
  }
}
