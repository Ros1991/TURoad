import { Request, Response } from 'express';
import { BaseController } from '@/core/base/BaseController';
import { Route } from '@/entities/Route';
import { RouteMapper } from '@/mappers/RouteMapper';
import { RouteService } from '@/services/RouteService';

export class RoutesController extends BaseController<Route> {
  public override service: RouteService;

  constructor() {
    super(Route, RouteMapper);
    this.service = new RouteService();
  }

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
}
