import { Request, Response } from 'express';
import { CityService } from '../services/CityService';
import { BaseController } from '@/core/base/BaseController';
import { AudioDurationCalculator } from '../utils/AudioDurationCalculator';
import { City } from '@/entities/City';
import { CityMapper } from '@/mappers/CityMapper';
import { CityCategoryService } from '@/services/CityCategoryService';
import { UserFavoriteCityService } from '@/services/UserFavoriteCityService';
import { RequestWithLanguage } from '../middleware/languageMiddleware';

export class CitiesController extends BaseController<City> {
  public override service: CityService;
  private cityCategoryService: CityCategoryService;
  private userFavoriteCityService: UserFavoriteCityService;

  constructor() {
    super(City, CityMapper);
    this.service = new CityService();
    this.cityCategoryService = new CityCategoryService();
    this.userFavoriteCityService = new UserFavoriteCityService();
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
          isFavorite = await this.userFavoriteCityService.isFavoriteCity(req.user.userId, id);
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
      const cityId = parseInt(req.params.id!);
      const { page, limit, search, language } = req.query;
      
      const stories = await this.service.getStoriesByCityId(
        cityId,
        (language as string) || 'pt',
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
      const cityId = parseInt(req.params.id!);
      const storyId = parseInt(req.params.storyId!);
      
      const story = await this.service.getStoryById(cityId, storyId);
      
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
      const cityId = parseInt(req.params.id!);
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
      
      const story = await this.service.createStory(cityId, storyData);
      
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
      const cityId = parseInt(req.params.id!);
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
      
      const story = await this.service.updateStory(cityId, storyId, storyData);
      
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
      const cityId = parseInt(req.params.id!);
      const storyId = parseInt(req.params.storyId!);
      
      await this.service.deleteStory(cityId, storyId);
      
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

  // Category association endpoints
  async getCategories(req: Request, res: Response): Promise<Response> {
    try {
      const cityId = parseInt(req.params.id!);
      
      const categories = await this.cityCategoryService.getCategoriesByCity(cityId);
      
      return res.json({
        success: true,
        message: 'City categories retrieved successfully',
        data: categories
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to retrieve city categories',
        data: null
      });
    }
  }

  async getAvailableCategories(req: Request, res: Response): Promise<Response> {
    try {
      const cityId = parseInt(req.params.id!);
      
      const categories = await this.cityCategoryService.getAvailableCategoriesForCity(cityId);
      
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

  async addCategory(req: Request, res: Response): Promise<Response> {
    try {
      const cityId = parseInt(req.params.id!);
      const { categoryId } = req.body;
      
      const association = await this.cityCategoryService.addCategoryToCity(cityId, categoryId);
      
      return res.status(201).json({
        success: true,
        message: 'Category added to city successfully',
        data: association
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to add category to city',
        data: null
      });
    }
  }

  async removeCategory(req: Request, res: Response): Promise<Response> {
    try {
      const cityId = parseInt(req.params.id!);
      const categoryId = parseInt(req.params.categoryId!);
      
      await this.cityCategoryService.removeCategoryFromCity(cityId, categoryId);
      
      return res.json({
        success: true,
        message: 'Category removed from city successfully',
        data: null
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to remove category from city',
        data: null
      });
    }
  }
}
