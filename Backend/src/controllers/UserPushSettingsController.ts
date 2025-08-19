import { Request, Response } from 'express';
import { UserPushSettingsService } from '@/services/UserPushSettingsService';
import { AppError } from '@/utils/AppError';

export class UserPushSettingsController {
  private userPushSettingsService: UserPushSettingsService;

  constructor() {
    this.userPushSettingsService = new UserPushSettingsService();
  }

  async getUserSettings(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.id as string);
      
      if (isNaN(userId)) {
        throw new AppError('Invalid user ID', 400);
      }

      const settings = await this.userPushSettingsService.getUserSettings(userId);
      
      if (!settings) {
        // If no settings exist, create default ones
        const defaultSettings = await this.userPushSettingsService.createDefaultSettings(userId);
        res.json({
          success: true,
          message: 'Default push settings created',
          data: defaultSettings
        });
        return;
      }

      res.json({
        success: true,
        message: 'Push settings retrieved successfully',
        data: settings
      });
    } catch (error) {
      console.error('Error getting user push settings:', error);
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    }
  }

  async updateUserSettings(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.id as string);
      
      if (isNaN(userId)) {
        throw new AppError('Invalid user ID', 400);
      }

      const {
        activeRouteNotifications,
        travelTipsNotifications,
        nearbyEventsNotifications,
        availableNarrativesNotifications,
        localOffersNotifications
      } = req.body;

      const updateData: any = {};
      
      if (typeof activeRouteNotifications === 'boolean') {
        updateData.activeRouteNotifications = activeRouteNotifications;
      }
      if (typeof travelTipsNotifications === 'boolean') {
        updateData.travelTipsNotifications = travelTipsNotifications;
      }
      if (typeof nearbyEventsNotifications === 'boolean') {
        updateData.nearbyEventsNotifications = nearbyEventsNotifications;
      }
      if (typeof availableNarrativesNotifications === 'boolean') {
        updateData.availableNarrativesNotifications = availableNarrativesNotifications;
      }
      if (typeof localOffersNotifications === 'boolean') {
        updateData.localOffersNotifications = localOffersNotifications;
      }

      if (Object.keys(updateData).length === 0) {
        throw new AppError('No valid settings provided', 400);
      }

      const updatedSettings = await this.userPushSettingsService.updateSettings(userId, updateData);

      res.json({
        success: true,
        message: 'Push settings updated successfully',
        data: updatedSettings
      });
    } catch (error) {
      console.error('Error updating user push settings:', error);
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    }
  }

  async createDefaultSettings(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.id as string);
      
      if (isNaN(userId)) {
        throw new AppError('Invalid user ID', 400);
      }

      const settings = await this.userPushSettingsService.createDefaultSettings(userId);

      res.status(201).json({
        success: true,
        message: 'Default push settings created successfully',
        data: settings
      });
    } catch (error) {
      console.error('Error creating default push settings:', error);
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    }
  }
}
