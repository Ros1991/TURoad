import { BaseService } from '@/core/base/BaseService';
import { Event } from '@/entities/Event';
import { eventRepository } from '@/repositories/EventRepository';
import { StoryEvent } from '@/entities/StoryEvent';
import { StoryEventRepository } from '@/repositories/StoryEventRepository';
import { StoryEventService } from '@/services/StoryEventService';

export class EventService extends BaseService<Event> {
  private storyEventRepository: StoryEventRepository;
  private storyEventService: StoryEventService;

  constructor() {
    super(Event);
    this.repository = eventRepository;
    this.storyEventRepository = new StoryEventRepository();
    this.storyEventService = new StoryEventService();
  }

  // Helper method to fetch localized texts for story entities
  private async fetchLocalizedTextForStory(story: any): Promise<any> {
    return await (this.storyEventService as any).fetchLocalizedTextForEntity(story);
  }

  // Story CRUD methods
  async getStoriesByEventId(eventId: number, page?: number, limit?: number, search?: string) {
    // Verify event exists
    const event = await this.repository.findById(eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    if (page && limit) {
      const result = await this.storyEventRepository.findByEventIdWithPagination(eventId, page, limit, search);
      const itemsWithLocalizedText = await Promise.all(
        result.items.map(story => this.fetchLocalizedTextForStory(story))
      );
      return {
        ...result,
        items: itemsWithLocalizedText
      };
    }

    const stories = await this.storyEventRepository.findByEventId(eventId);
    return Promise.all(stories.map(story => this.fetchLocalizedTextForStory(story)));
  }

  async getStoryById(eventId: number, storyId: number) {
    const story = await this.storyEventRepository.findById(storyId);
    if (!story || story.eventId !== eventId) {
      throw new Error('Story not found');
    }
    return this.fetchLocalizedTextForStory(story);
  }

  async createStory(eventId: number, storyData: Partial<StoryEvent>) {
    // Verify event exists
    const event = await this.repository.findById(eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    const story = await this.storyEventRepository.create({
      ...storyData,
      eventId
    });
    return this.fetchLocalizedTextForStory(story);
  }

  async updateStory(eventId: number, storyId: number, storyData: Partial<StoryEvent>) {
    const story = await this.storyEventRepository.findById(storyId);
    if (!story || story.eventId !== eventId) {
      throw new Error('Story not found');
    }

    const updatedStory = await this.storyEventRepository.update(storyId, storyData);
    return this.fetchLocalizedTextForStory(updatedStory);
  }

  async deleteStory(eventId: number, storyId: number) {
    const story = await this.storyEventRepository.findById(storyId);
    if (!story || story.eventId !== eventId) {
      throw new Error('Story not found');
    }

    return this.storyEventRepository.delete(storyId);
  }

  async getAllWithLocalizedTexts(language: string = 'pt', cityId?: number, search?: string): Promise<any[]> {
    return await eventRepository.findAllWithLocalizedTexts(language, cityId, search);
  }
}
