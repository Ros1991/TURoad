import { Request, Response } from 'express';
import { EventService } from '../services/EventService';
import { BaseController } from '@/core/base/BaseController';
import { AudioDurationCalculator } from '../utils/AudioDurationCalculator';
import { Event } from '@/entities/Event';
import { EventMapper } from '@/mappers/EventMapper';
import { EventCategoryService } from '@/services/EventCategoryService';

export class EventsController extends BaseController<Event> {
  public override service: EventService;
  private eventCategoryService: EventCategoryService;

  constructor() {
    super(Event, EventMapper);
    this.service = new EventService();
    this.eventCategoryService = new EventCategoryService();
  }

  // Story CRUD endpoints
  async getStories(req: Request, res: Response): Promise<Response> {
    try {
      const eventId = parseInt(req.params.id!);
      const { page, limit, search } = req.query;
      
      const stories = await this.service.getStoriesByEventId(
        eventId,
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
      const eventId = parseInt(req.params.id!);
      const storyId = parseInt(req.params.storyId!);
      
      const story = await this.service.getStoryById(eventId, storyId);
      
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
      const eventId = parseInt(req.params.id!);
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
      
      const story = await this.service.createStory(eventId, storyData);
      
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
      const eventId = parseInt(req.params.id!);
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
      
      const story = await this.service.updateStory(eventId, storyId, storyData);
      
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
      const eventId = parseInt(req.params.id!);
      const storyId = parseInt(req.params.storyId!);
      
      await this.service.deleteStory(eventId, storyId);
      
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
      const eventId = parseInt(req.params.id!);
      const categories = await this.eventCategoryService.getCategoriesByEvent(eventId);
      
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
      const eventId = parseInt(req.params.id!);
      const { categoryId } = req.body;
      
      const association = await this.eventCategoryService.addCategoryToEvent(eventId, categoryId);
      
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
      const eventId = parseInt(req.params.id!);
      const categoryId = parseInt(req.params.categoryId!);
      
      await this.eventCategoryService.removeCategoryFromEvent(eventId, categoryId);
      
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
      const eventId = parseInt(req.params.id!);
      const categories = await this.eventCategoryService.getAvailableCategoriesForEvent(eventId);
      
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
}
