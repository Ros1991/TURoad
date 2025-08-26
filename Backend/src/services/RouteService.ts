import { BaseService } from '@/core/base/BaseService';
import { Route } from '@/entities/Route';
import { routeRepository } from '@/repositories/RouteRepository';
import { StoryRoute } from '@/entities/StoryRoute';
import { StoryRouteRepository } from '@/repositories/StoryRouteRepository';
import { StoryRouteService } from '@/services/StoryRouteService';

export class RouteService extends BaseService<Route> {
  private storyRouteRepository: StoryRouteRepository;
  private storyRouteService: StoryRouteService;

  constructor() {
    super(Route);
    this.repository = routeRepository;
    this.storyRouteRepository = new StoryRouteRepository();
    this.storyRouteService = new StoryRouteService();
  }

  // Helper method to fetch localized texts for story entities
  private async fetchLocalizedTextForStory(story: any): Promise<any> {
    return await (this.storyRouteService as any).fetchLocalizedTextForEntity(story);
  }

  // Story CRUD methods
  async getStoriesByRouteId(routeId: number, page?: number, limit?: number, search?: string) {
    // Verify route exists
    const route = await this.repository.findById(routeId);
    if (!route) {
      throw new Error('Route not found');
    }

    if (page && limit) {
      const result = await this.storyRouteRepository.findByRouteIdWithPagination(routeId, page, limit, search);
      const itemsWithLocalizedText = await Promise.all(
        result.items.map(story => this.fetchLocalizedTextForStory(story))
      );
      return {
        ...result,
        items: itemsWithLocalizedText
      };
    }

    const stories = await this.storyRouteRepository.findByRouteId(routeId);
    return Promise.all(stories.map(story => this.fetchLocalizedTextForStory(story)));
  }

  async getStoryById(routeId: number, storyId: number) {
    const story = await this.storyRouteRepository.findById(storyId);
    if (!story || story.routeId !== routeId) {
      throw new Error('Story not found');
    }
    return this.fetchLocalizedTextForStory(story);
  }

  async createStory(routeId: number, storyData: Partial<StoryRoute>) {
    // Verify route exists
    const route = await this.repository.findById(routeId);
    if (!route) {
      throw new Error('Route not found');
    }

    const story = await this.storyRouteRepository.create({
      ...storyData,
      routeId
    });
    return this.fetchLocalizedTextForStory(story);
  }

  async updateStory(routeId: number, storyId: number, storyData: Partial<StoryRoute>) {
    const story = await this.storyRouteRepository.findById(storyId);
    if (!story || story.routeId !== routeId) {
      throw new Error('Story not found');
    }

    const updatedStory = await this.storyRouteRepository.update(storyId, storyData);
    return this.fetchLocalizedTextForStory(updatedStory);
  }

  async deleteStory(routeId: number, storyId: number) {
    const story = await this.storyRouteRepository.findById(storyId);
    if (!story || story.routeId !== routeId) {
      throw new Error('Story not found');
    }

    return this.storyRouteRepository.delete(storyId);
  }

  async getAllWithLocalizedTexts(language: string = 'pt', categoryId?: number, search?: string, cityId?: number, userLatitude?: number, userLongitude?: number): Promise<any[]> {
    return await routeRepository.findAllWithLocalizedTexts(language, categoryId?.toString(), search, cityId, userLatitude, userLongitude);
  }

  async getRouteById(routeId: number, language: string = 'pt'): Promise<any> {
    const route = await routeRepository.findByIdWithLocalizedTexts(routeId, language);
    if (!route) {
      return null;
    }

    // Get stories for this route
    const stories = await this.getStoriesByRouteId(routeId);
    
    return {
      ...route,
      stories: stories || []
    };
  }
}
