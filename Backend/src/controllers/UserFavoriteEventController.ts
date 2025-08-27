import { Request, Response } from 'express';
import { UserFavoriteEventService } from '@/services/UserFavoriteEventService';
import { AppError } from '@/core/errors/AppError';

export class UserFavoriteEventController {
  private userFavoriteEventService: UserFavoriteEventService;

  constructor() {
    this.userFavoriteEventService = new UserFavoriteEventService();
  }

  async getUserFavoriteEvents(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.id as string);
      
      if (isNaN(userId)) {
        throw new AppError('Invalid user ID', 400);
      }

      const favoriteEvents = await this.userFavoriteEventService.getUserFavoriteEvents(userId);
      
      res.status(200).json({
        success: true,
        data: favoriteEvents
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      } else {
        console.error('Error in getUserFavoriteEvents:', error);
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    }
  }

  async addFavoriteEvent(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.id as string);
      const { eventId } = req.body;
      
      if (isNaN(userId)) {
        throw new AppError('Invalid user ID', 400);
      }

      if (!eventId || isNaN(parseInt(eventId))) {
        throw new AppError('Valid event ID is required', 400);
      }

      const favoriteEvent = await this.userFavoriteEventService.addFavoriteEvent(userId, parseInt(eventId));
      
      res.status(201).json({
        success: true,
        message: 'Event added to favorites successfully',
        data: favoriteEvent
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      } else {
        console.error('Error in addFavoriteEvent:', error);
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    }
  }

  async removeFavoriteEvent(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.id as string);
      const eventId = parseInt(req.params.eventId as string);
      
      if (isNaN(userId)) {
        throw new AppError('Invalid user ID', 400);
      }

      if (isNaN(eventId)) {
        throw new AppError('Invalid event ID', 400);
      }

      await this.userFavoriteEventService.removeFavoriteEvent(userId, eventId);
      
      res.status(200).json({
        success: true,
        message: 'Event removed from favorites successfully'
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      } else {
        console.error('Error in removeFavoriteEvent:', error);
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    }
  }

  async getAvailableEvents(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.id as string);
      
      if (isNaN(userId)) {
        throw new AppError('Invalid user ID', 400);
      }

      const availableEvents = await this.userFavoriteEventService.getAvailableEvents(userId);
      
      res.status(200).json({
        success: true,
        data: availableEvents
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      } else {
        console.error('Error in getAvailableEvents:', error);
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    }
  }

  async isFavoriteEvent(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.id as string);
      const eventId = parseInt(req.params.eventId as string);
      
      if (isNaN(userId)) {
        throw new AppError('Invalid user ID', 400);
      }

      if (isNaN(eventId)) {
        throw new AppError('Invalid event ID', 400);
      }

      const isFavorite = await this.userFavoriteEventService.isFavoriteEvent(userId, eventId);
      
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
        console.error('Error in isFavoriteEvent:', error);
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    }
  }

  async toggleFavoriteEvent(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.id as string);
      const { eventId } = req.body;
      
      if (isNaN(userId)) {
        throw new AppError('Invalid user ID', 400);
      }

      if (!eventId || isNaN(parseInt(eventId))) {
        throw new AppError('Valid event ID is required', 400);
      }

      const result = await this.userFavoriteEventService.toggleFavoriteEvent(userId, parseInt(eventId));
      
      res.status(200).json({
        success: true,
        message: result.isFavorited ? 'Event added to favorites' : 'Event removed from favorites',
        data: result
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      } else {
        console.error('Error in toggleFavoriteEvent:', error);
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    }
  }
}
