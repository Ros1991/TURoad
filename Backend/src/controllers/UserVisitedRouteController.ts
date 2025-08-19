import { Request, Response } from 'express';
import { UserVisitedRouteService } from '@/services/UserVisitedRouteService';
import { AppError } from '@/core/errors/AppError';

export class UserVisitedRouteController {
  private userVisitedRouteService: UserVisitedRouteService;

  constructor() {
    this.userVisitedRouteService = new UserVisitedRouteService();
  }

  async getUserVisitedRoutes(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.id as string);
      
      if (isNaN(userId)) {
        throw new AppError('Invalid user ID', 400);
      }

      const visitedRoutes = await this.userVisitedRouteService.getUserVisitedRoutes(userId);
      
      res.status(200).json({
        success: true,
        data: visitedRoutes
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      } else {
        console.error('Error in getUserVisitedRoutes:', error);
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    }
  }

  async addVisitedRoute(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.id as string);
      const { routeId, visitedAt } = req.body;
      
      if (isNaN(userId)) {
        throw new AppError('Invalid user ID', 400);
      }

      if (!routeId || isNaN(parseInt(routeId))) {
        throw new AppError('Valid route ID is required', 400);
      }

      const visitedDate = visitedAt ? new Date(visitedAt) : undefined;
      const visitedRoute = await this.userVisitedRouteService.addVisitedRoute(userId, parseInt(routeId), visitedDate);
      
      res.status(201).json({
        success: true,
        message: 'Route marked as visited successfully',
        data: visitedRoute
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      } else {
        console.error('Error in addVisitedRoute:', error);
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    }
  }

  async removeVisitedRoute(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.id as string);
      const routeId = parseInt(req.params.routeId as string);
      
      if (isNaN(userId)) {
        throw new AppError('Invalid user ID', 400);
      }

      if (isNaN(routeId)) {
        throw new AppError('Invalid route ID', 400);
      }

      await this.userVisitedRouteService.removeVisitedRoute(userId, routeId);
      
      res.status(200).json({
        success: true,
        message: 'Route removed from visited list successfully'
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      } else {
        console.error('Error in removeVisitedRoute:', error);
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

      const availableRoutes = await this.userVisitedRouteService.getAvailableRoutes(userId);
      
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
}
