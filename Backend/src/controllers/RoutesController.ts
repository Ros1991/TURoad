import { Request, Response } from 'express';
import { RouteService } from '../services/RouteService';
import { BaseController } from '@/core/base/BaseController';
import { AudioDurationCalculator } from '../utils/AudioDurationCalculator';
import { Route } from '@/entities/Route';
import { RouteMapper } from '@/mappers/RouteMapper';
import { RouteCategoryService } from '@/services/RouteCategoryService';
import { RouteCityService } from '@/services/RouteCityService';
import { UserFavoriteRouteService } from '@/services/UserFavoriteRouteService';
import { RequestWithLanguage } from '../middleware/languageMiddleware';

export class RoutesController extends BaseController<Route> {
  public override service: RouteService;
  private routeCategoryService: RouteCategoryService;
  private routeCityService: RouteCityService;
  private userFavoriteRouteService: UserFavoriteRouteService;

  constructor() {
    super(Route, RouteMapper);
    this.service = new RouteService();
    this.routeCategoryService = new RouteCategoryService();
    this.routeCityService = new RouteCityService();
    this.userFavoriteRouteService = new UserFavoriteRouteService();
  }

  // Override getById to include isFavorite
  override getById = async (req: Request, res: Response): Promise<void> => {
    try {
      // Set language from request
      const language = (req as RequestWithLanguage).language || 'pt';
      this.service.setLanguage(language);
      
      const id = parseInt(req.params['id'] as string, 10);

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'ID inválido',
        });
        return;
      }

      const result = await this.service.findById(id);
      
      // Check if user is authenticated and get favorite status
      let isFavorite = false;
      if (req.user?.userId) {
        try {
          isFavorite = await this.userFavoriteRouteService.isFavoriteRoute(req.user.userId, id);
        } catch (error) {
          // If error checking favorite status, just continue with false
          console.warn('Error checking favorite status:', error);
        }
      }

      res.status(200).json({
        success: true,
        message: 'Obtido com sucesso',
        data: result,
        isFavorite
      });

    } catch (error) {
      this.handleError(res, error);
    }
  };

  // Story CRUD endpoints
  async getStories(req: Request, res: Response): Promise<Response> {
    try {
      const routeId = parseInt(req.params.id!);
      const { page, limit, search } = req.query;
      
      const stories = await this.service.getStoriesByRouteId(
        routeId,
        page ? parseInt(page as string) : undefined,
        limit ? parseInt(limit as string) : undefined,
        search as string
      );
      
      return res.json({
        success: true,
        message: 'Stories retrieved successfully',
        data: stories
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to retrieve stories',
        data: null
      });
    }
  }

  async getStory(req: Request, res: Response): Promise<Response> {
    try {
      const routeId = parseInt(req.params.id!);
      const storyId = parseInt(req.params.storyId!);
      
      const story = await this.service.getStoryById(routeId, storyId);
      
      return res.json({
        success: true,
        message: 'Story retrieved successfully',
        data: story
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to retrieve story',
        data: null
      });
    }
  }

  async createStory(req: Request, res: Response): Promise<Response> {
    try {
      const routeId = parseInt(req.params.id!);
      const storyData = req.body;
      
      // Calculate audio duration if audio URL is provided
      const audioUrl = AudioDurationCalculator.extractAudioUrl(storyData);
      if (audioUrl) {
        try {
          const durationSeconds = await AudioDurationCalculator.calculateDurationFromUrl(audioUrl);
          storyData.durationSeconds = durationSeconds;
        } catch (error) {
          console.warn('Failed to calculate audio duration:', error);
          // Continue without duration - it's optional
        }
      }
      
      const story = await this.service.createStory(routeId, storyData);
      
      return res.status(201).json({
        success: true,
        message: 'Story created successfully',
        data: story
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to create story',
        data: null
      });
    }
  }

  async updateStory(req: Request, res: Response): Promise<Response> {
    try {
      const routeId = parseInt(req.params.id!);
      const storyId = parseInt(req.params.storyId!);
      const storyData = req.body;
      
      // Calculate audio duration if audio URL is provided
      const audioUrl = AudioDurationCalculator.extractAudioUrl(storyData);
      if (audioUrl) {
        try {
          const durationSeconds = await AudioDurationCalculator.calculateDurationFromUrl(audioUrl);
          storyData.durationSeconds = durationSeconds;
        } catch (error) {
          console.warn('Failed to calculate audio duration:', error);
          // Continue without duration - it's optional
        }
      }
      
      const story = await this.service.updateStory(routeId, storyId, storyData);
      
      return res.json({
        success: true,
        message: 'Story updated successfully',
        data: story
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to update story',
        data: null
      });
    }
  }

  async deleteStory(req: Request, res: Response): Promise<Response> {
    try {
      const routeId = parseInt(req.params.id!);
      const storyId = parseInt(req.params.storyId!);
      
      await this.service.deleteStory(routeId, storyId);
      
      return res.json({
        success: true,
        message: 'Story deleted successfully',
        data: null
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to delete story',
        data: null
      });
    }
  }

  // Category endpoints
  async getCategories(req: Request, res: Response): Promise<Response> {
    try {
      const routeId = parseInt(req.params.id!);
      const categories = await this.routeCategoryService.getCategoriesByRoute(routeId);
      
      return res.json({
        success: true,
        message: 'Categories retrieved successfully',
        data: categories
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to retrieve categories',
        data: null
      });
    }
  }

  async addCategory(req: Request, res: Response): Promise<Response> {
    try {
      const routeId = parseInt(req.params.id!);
      const { categoryId } = req.body;
      
      const association = await this.routeCategoryService.addCategoryToRoute(routeId, categoryId);
      
      return res.status(201).json({
        success: true,
        message: 'Category added successfully',
        data: association
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to add category',
        data: null
      });
    }
  }

  async removeCategory(req: Request, res: Response): Promise<Response> {
    try {
      const routeId = parseInt(req.params.id!);
      const categoryId = parseInt(req.params.categoryId!);
      
      await this.routeCategoryService.removeCategoryFromRoute(routeId, categoryId);
      
      return res.json({
        success: true,
        message: 'Category removed successfully',
        data: null
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to remove category',
        data: null
      });
    }
  }

  async getAvailableCategories(req: Request, res: Response): Promise<Response> {
    try {
      const routeId = parseInt(req.params.id!);
      const categories = await this.routeCategoryService.getAvailableCategoriesForRoute(routeId);
      
      return res.json({
        success: true,
        message: 'Available categories retrieved successfully',
        data: categories
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to retrieve available categories',
        data: null
      });
    }
  }

  // City CRUD endpoints
  async getCities(req: Request, res: Response): Promise<Response> {
    try {
      const routeId = parseInt(req.params.id!);
      const cities = await this.routeCityService.findByRouteId(routeId);
      
      return res.json({
        success: true,
        message: 'Cities retrieved successfully',
        data: cities
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to retrieve cities',
        data: null
      });
    }
  }

  async addCity(req: Request, res: Response): Promise<Response> {
    try {
      const routeId = parseInt(req.params.id!);
      const { cityId, order } = req.body;
      
      const routeCity = await this.routeCityService.addCityToRoute(routeId, cityId, order);
      
      return res.status(201).json({
        success: true,
        message: 'City added successfully',
        data: routeCity
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to add city',
        data: null
      });
    }
  }

  async removeCity(req: Request, res: Response): Promise<Response> {
    try {
      const routeId = parseInt(req.params.id!);
      const cityId = parseInt(req.params.cityId!);
      
      await this.routeCityService.removeCityFromRoute(routeId, cityId);
      
      return res.json({
        success: true,
        message: 'City removed successfully',
        data: null
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to remove city',
        data: null
      });
    }
  }

  async reorderCities(req: Request, res: Response): Promise<Response> {
    try {
      const routeId = parseInt(req.params.id!);
      const { cities } = req.body; // Array of { cityId, order }
      
      await this.routeCityService.reorderCities(routeId, cities);
      
      return res.json({
        success: true,
        message: 'Cities reordered successfully',
        data: null
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to reorder cities',
        data: null
      });
    }
  }

  async getAvailableCities(req: Request, res: Response): Promise<Response> {
    try {
      const routeId = parseInt(req.params.id!);
      const cities = await this.routeCityService.getAvailableCitiesForRoute(routeId);
      
      return res.json({
        success: true,
        message: 'Available cities retrieved successfully',
        data: cities
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to retrieve available cities',
        data: null
      });
    }
  }
}
