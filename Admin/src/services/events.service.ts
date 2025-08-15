import api, { PaginatedRequest, PaginatedResponse } from './api';

export interface StoryEvent {
  storyEventId?: number;
  eventId: number;
  nameTextRefId: number;
  descriptionTextRefId?: number;
  playCount?: number;
  audioUrlRefId?: number;
}

export interface Event {
  eventId?: number;
  cityId: number;
  nameTextRefId: number;
  descriptionTextRefId?: number;
  eventDate: string;
  eventTime: string;
  imageUrl?: string;
  city?: {
    cityId: number;
    nameTextRefId: number;
    state: string;
  };
  stories?: StoryEvent[];
}

export interface CreateEventDto {
  cityId: number;
  nameTextRefId: number;
  descriptionTextRefId?: number;
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
  async getEvents(filters?: EventFilters): Promise<PaginatedResponse<Event>> {
    const response = await api.get('/api/events', { params: filters });
    return response.data;
  }

  async getEvent(id: number): Promise<Event> {
    const response = await api.get(`/api/events/${id}`);
    return response.data;
  }

  async createEvent(data: CreateEventDto): Promise<Event> {
    const response = await api.post('/api/events', data);
    return response.data;
  }

  async updateEvent(id: number, data: UpdateEventDto): Promise<Event> {
    const response = await api.put(`/api/events/${id}`, data);
    return response.data;
  }

  async deleteEvent(id: number): Promise<void> {
    await api.delete(`/api/events/${id}`);
  }

  // Story management
  async getEventStories(eventId: number): Promise<StoryEvent[]> {
    const response = await api.get(`/api/events/${eventId}/stories`);
    return response.data;
  }

  async createEventStory(eventId: number, story: Omit<StoryEvent, 'eventId'>): Promise<StoryEvent> {
    const response = await api.post(`/api/events/${eventId}/stories`, story);
    return response.data;
  }

  async updateEventStory(eventId: number, storyId: number, story: Partial<StoryEvent>): Promise<StoryEvent> {
    const response = await api.put(`/api/events/${eventId}/stories/${storyId}`, story);
    return response.data;
  }

  async deleteEventStory(eventId: number, storyId: number): Promise<void> {
    await api.delete(`/api/events/${eventId}/stories/${storyId}`);
  }
}

export default new EventsService();
