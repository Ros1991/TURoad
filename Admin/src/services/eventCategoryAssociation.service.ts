import { api } from './api';

export interface EventCategoryAssociation {
  eventCategoryId: number;
  eventId: number;
  categoryId: number;
  category: {
    categoryId: number;
    name: string;
  };
}

export interface AvailableCategory {
  categoryId: number;
  name: string;
}

export const eventCategoryAssociationService = {
  // Get all categories associated with an event
  async getEventCategories(eventId: number): Promise<EventCategoryAssociation[]> {
    const response = await api.get(`/events/${eventId}/categories`);
    return response.data.data;
  },

  // Get available categories for an event (not already associated)
  async getAvailableCategories(eventId: number): Promise<AvailableCategory[]> {
    const response = await api.get(`/events/${eventId}/available-categories`);
    return response.data.data;
  },

  // Add category to event
  async addCategoryToEvent(eventId: number, categoryId: number): Promise<EventCategoryAssociation> {
    const response = await api.post(`/events/${eventId}/categories`, { categoryId });
    return response.data.data;
  },

  // Remove category from event
  async removeCategoryFromEvent(eventId: number, categoryId: number): Promise<void> {
    await api.delete(`/events/${eventId}/categories/${categoryId}`);
  }
};
