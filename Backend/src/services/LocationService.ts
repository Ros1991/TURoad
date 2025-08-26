import { BaseService } from '@/core/base/BaseService';
import { Location } from '@/entities/Location';
import { locationRepository } from '@/repositories/LocationRepository';
import { StoryLocation } from '@/entities/StoryLocation';
import { StoryLocationRepository } from '@/repositories/StoryLocationRepository';
import { StoryLocationService } from '@/services/StoryLocationService';

export class LocationService extends BaseService<Location> {
  private storyLocationRepository: StoryLocationRepository;
  private storyLocationService: StoryLocationService;

  constructor() {
    super(Location);
    this.repository = locationRepository;
    this.storyLocationRepository = new StoryLocationRepository();
    this.storyLocationService = new StoryLocationService();
  }

  // Helper method to fetch localized texts for story entities
  private async fetchLocalizedTextForStory(story: any): Promise<any> {
    return await (this.storyLocationService as any).fetchLocalizedTextForEntity(story);
  }

  // Story CRUD methods
  async getStoriesByLocationId(locationId: number, page?: number, limit?: number, search?: string) {
    // Verify location exists
    const location = await this.repository.findById(locationId);
    if (!location) {
      throw new Error('Location not found');
    }

    if (page && limit) {
      const result = await this.storyLocationRepository.findByLocationIdWithPagination(locationId, page, limit, search);
      const itemsWithLocalizedText = await Promise.all(
        result.items.map(story => this.fetchLocalizedTextForStory(story))
      );
      return {
        ...result,
        items: itemsWithLocalizedText
      };
    }

    const stories = await this.storyLocationRepository.findByLocationId(locationId);
    return Promise.all(stories.map(story => this.fetchLocalizedTextForStory(story)));
  }

  async getStoryById(locationId: number, storyId: number) {
    const story = await this.storyLocationRepository.findById(storyId);
    if (!story || story.locationId !== locationId) {
      throw new Error('Story not found');
    }
    return this.fetchLocalizedTextForStory(story);
  }

  async createStory(locationId: number, storyData: Partial<StoryLocation>) {
    // Verify location exists
    const location = await this.repository.findById(locationId);
    if (!location) {
      throw new Error('Location not found');
    }

    const story = await this.storyLocationRepository.create({
      ...storyData,
      locationId
    });
    return this.fetchLocalizedTextForStory(story);
  }

  async updateStory(locationId: number, storyId: number, storyData: Partial<StoryLocation>) {
    const story = await this.storyLocationRepository.findById(storyId);
    if (!story || story.locationId !== locationId) {
      throw new Error('Story not found');
    }

    const updatedStory = await this.storyLocationRepository.update(storyId, storyData);
    return this.fetchLocalizedTextForStory(updatedStory);
  }

  async deleteStory(locationId: number, storyId: number) {
    const story = await this.storyLocationRepository.findById(storyId);
    if (!story || story.locationId !== locationId) {
      throw new Error('Story not found');
    }

    return this.storyLocationRepository.delete(storyId);
  }

  async getBusinessesWithLocalizedTexts(language: string = 'pt', search?: string, cityId?: number, userLatitude?: number, userLongitude?: number): Promise<any[]> {
    return await locationRepository.findBusinessesWithLocalizedTexts(language, search, cityId, userLatitude, userLongitude);
  }

  async getHistoricalPlacesWithLocalizedTexts(language: string = 'pt', search?: string, cityId?: number, userLatitude?: number, userLongitude?: number): Promise<any[]> {
    return await locationRepository.findHistoricalPlacesWithLocalizedTexts(language, search, cityId, userLatitude, userLongitude);
  }

  async getHostingWithLocalizedTexts(language: string = 'pt', search?: string, cityId?: number, userLatitude?: number, userLongitude?: number): Promise<any[]> {
    return await locationRepository.findHostingWithLocalizedTexts(language, search, cityId, userLatitude, userLongitude);
  }

  async getLocationById(locationId: number, language: string = 'pt', userLatitude?: number, userLongitude?: number): Promise<any> {
    const location = await locationRepository.findByIdWithLocalizedTexts(locationId, language, userLatitude, userLongitude);
    if (!location) {
      return null;
    }

    // Get stories for this location
    const stories = await this.getStoriesByLocationId(locationId);
    
    return {
      ...location,
      stories: stories || []
    };
  }

  async getBusinessesByCities(cityIds: number[], language: string = 'pt', userLatitude?: number | null, userLongitude?: number | null): Promise<any[]> {
    const businesses = await locationRepository.findBusinessesByCitiesWithLocalizedTexts(
      cityIds,
      language,
      userLatitude,
      userLongitude
    );
    return businesses || [];
  }

  async getHostingByCities(cityIds: number[], language: string = 'pt', userLatitude?: number | null, userLongitude?: number | null): Promise<any[]> {
    const hosting = await locationRepository.findHostingByCitiesWithLocalizedTexts(
      cityIds,
      language,
      userLatitude,
      userLongitude
    );
    return hosting || [];
  }
}
