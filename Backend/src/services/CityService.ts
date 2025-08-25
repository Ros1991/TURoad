import { BaseService } from '@/core/base/BaseService';
import { City } from '@/entities/City';
import { cityRepository } from '@/repositories/CityRepository';
import { StoryCity } from '@/entities/StoryCity';
import { StoryCityRepository } from '@/repositories/StoryCityRepository';
import { StoryCityService } from '@/services/StoryCityService';

export class CityService extends BaseService<City> {
  private storyCityRepository: StoryCityRepository;
  private storyCityService: StoryCityService;

  constructor() {
    super(City);
    this.repository = cityRepository;
    this.storyCityRepository = new StoryCityRepository();
    this.storyCityService = new StoryCityService();
  }

  // Helper method to fetch localized texts for story entities
  private async fetchLocalizedTextForStory(story: any): Promise<any> {
    return await (this.storyCityService as any).fetchLocalizedTextForEntity(story);
  }

  // Story CRUD methods
  async getStoriesByCityId(cityId: number, page?: number, limit?: number, search?: string) {
    // Verify city exists
    const city = await this.repository.findById(cityId);
    if (!city) {
      throw new Error('City not found');
    }

    if (page && limit) {
      const result = await this.storyCityRepository.findByCityIdWithPagination(cityId, page, limit, search);
      const itemsWithLocalizedText = await Promise.all(
        result.items.map(story => this.fetchLocalizedTextForStory(story))
      );
      return {
        ...result,
        items: itemsWithLocalizedText
      };
    }

    const stories = await this.storyCityRepository.findByCityId(cityId);
    return Promise.all(stories.map(story => this.fetchLocalizedTextForStory(story)));
  }

  async getStoryById(cityId: number, storyId: number) {
    const story = await this.storyCityRepository.findById(storyId);
    if (!story || story.cityId !== cityId) {
      throw new Error('Story not found');
    }
    return this.fetchLocalizedTextForStory(story);
  }

  async createStory(cityId: number, storyData: Partial<StoryCity>) {
    // Verify city exists
    const city = await this.repository.findById(cityId);
    if (!city) {
      throw new Error('City not found');
    }

    const story = await this.storyCityRepository.create({
      ...storyData,
      cityId
    });
    return this.fetchLocalizedTextForStory(story);
  }

  async updateStory(cityId: number, storyId: number, storyData: Partial<StoryCity>) {
    const story = await this.storyCityRepository.findById(storyId);
    if (!story || story.cityId !== cityId) {
      throw new Error('Story not found');
    }

    // Use StoryCityService to handle localized text fields properly
    const storyCityService = new StoryCityService();
    return await storyCityService.update(storyId, storyData);
  }

  async deleteStory(cityId: number, storyId: number) {
    const story = await this.storyCityRepository.findById(storyId);
    if (!story || story.cityId !== cityId) {
      throw new Error('Story not found');
    }

    return this.storyCityRepository.delete(storyId);
  }

  async getAllWithLocalizedTexts(language: string = 'pt', search?: string, cityId?: number, userLatitude?: number, userLongitude?: number): Promise<any[]> {
    return await cityRepository.findAllWithLocalizedTexts(language, search, cityId, userLatitude, userLongitude);
  }
}
