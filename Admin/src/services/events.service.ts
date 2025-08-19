import { api, PaginatedRequest, PaginatedResponse } from './api';
import { LocalizedText } from './categories.service';

export interface StoryEvent {
  storyEventId?: number;
  eventId: number;
  nameTextRefId: number;
  descriptionTextRefId?: number;
  playCount?: number;
  audioUrlRefId?: number;
}

export interface Event {
  eventId: number;
  cityId: number;
  nameTextRefId: number;
  descriptionTextRefId?: number;
  locationTextRefId?: number;
  eventDate: string;
  eventTime: string;
  imageUrl?: string;
  city?: {
    cityId: number;
    nameTextRefId: number;
    state: string;
    name?: string;
  };
  stories?: StoryEvent[];
  // Localized fields
  name?: string;
  description?: string;
  location?: string;

    // Legacy support for translations
  nameTranslations?: LocalizedText[];
  locationTranslations?: LocalizedText[];
}

export interface CreateEventDto {
  cityId: number;
  nameTextRefId: number;
  descriptionTextRefId?: number;
  locationTextRefId?: number;
  eventDate: string;
  eventTime: string;
  imageUrl?: string;
}

export interface UpdateEventDto extends Partial<CreateEventDto> {}

export interface EventFilters extends PaginatedRequest {
  search?: string;
  cityId?: number;
  startDate?: string;
  endDate?: string;
}

class EventsService {
  private basePath = '/events';

  /**
   * Get paginated list of events
   */
  async getEvents(params?: EventFilters): Promise<PaginatedResponse<Event>> {
    return api.get<PaginatedResponse<Event>>(this.basePath, { params });
  }

  /**
   * Get event by ID
   */
  async getEventById(id: number): Promise<Event> {
    return api.get<Event>(`${this.basePath}/${id}`);
  }

  /**
   * Get event by ID (legacy)
   */
  async getEvent(id: number): Promise<Event> {
    return this.getEventById(id);
  }

  /**
   * Create new event
   */
  async createEvent(data: CreateEventDto): Promise<Event> {
    return api.post<Event>(this.basePath, data);
  }

  /**
   * Update event
   */
  async updateEvent(id: number, data: UpdateEventDto): Promise<Event> {
    return api.put<Event>(`${this.basePath}/${id}`, data);
  }

  /**
   * Delete event
   */
  async deleteEvent(id: number): Promise<void> {
    return api.delete<void>(`${this.basePath}/${id}`);
  }

  /**
   * Toggle event status
   */
  async toggleEventStatus(id: number): Promise<Event> {
    return api.patch<Event>(`${this.basePath}/${id}/toggle-status`);
  }

  // Story management methods
  /**
   * Get stories for an event
   */
  async getStories(eventId: number): Promise<StoryEvent[]> {
    return api.get<StoryEvent[]>(`${this.basePath}/${eventId}/stories`);
  }

  /**
   * Get stories for an event (legacy)
   */
  async getEventStories(eventId: number): Promise<StoryEvent[]> {
    return this.getStories(eventId);
  }

  /**
   * Add story to event
   */
  async addStory(eventId: number, story: Omit<StoryEvent, 'storyEventId' | 'eventId'>): Promise<StoryEvent> {
    return api.post<StoryEvent>(`${this.basePath}/${eventId}/stories`, story);
  }

  /**
   * Create event story (legacy)
   */
  async createEventStory(eventId: number, story: Omit<StoryEvent, 'storyEventId' | 'eventId'>): Promise<StoryEvent> {
    return this.addStory(eventId, story);
  }

  /**
   * Update event story
   */
  async updateStory(eventId: number, storyId: number, story: Partial<Omit<StoryEvent, 'storyEventId' | 'eventId'>>): Promise<StoryEvent> {
    return api.put<StoryEvent>(`${this.basePath}/${eventId}/stories/${storyId}`, story);
  }

  /**
   * Update event story (legacy)
   */
  async updateEventStory(eventId: number, storyId: number, story: Partial<Omit<StoryEvent, 'storyEventId' | 'eventId'>>): Promise<StoryEvent> {
    return this.updateStory(eventId, storyId, story);
  }

  /**
   * Delete event story
   */
  async deleteStory(eventId: number, storyId: number): Promise<void> {
    return api.delete<void>(`${this.basePath}/${eventId}/stories/${storyId}`);
  }

  /**
   * Delete event story (legacy)
   */
  async deleteEventStory(eventId: number, storyId: number): Promise<void> {
    return this.deleteStory(eventId, storyId);
  }
}

export default new EventsService();
