import { Event } from "../types";
import { apiService } from './ApiService';

export const getEvents = async (search?: string, cityId?: string): Promise<Event[]> => {
  try {
    const params: any = {};
    if (search) {
      params.search = search;
    }
    if (cityId) {
      params.cityId = cityId;
    }
    
    const response = await apiService.get<Event[]>('/api/public/events', {
      params,
      includeAuth: false // Public endpoint doesn't need authentication
    });
    
    if (response.success && response.data) {
      return response.data;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
};

export const getEventById = async (id: string, language: string = 'pt'): Promise<Event | null> => {
  try {
    const response = await apiService.get<Event>(`/api/public/events/${id}`, {
      headers: { 'Accept-Language': language },
      includeAuth: false
    });
    
    if (response.success && response.data) {
      return response.data;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching event by id:', error);
    return null;
  }
};

export const getUpcomingEvents = async (language: string = 'pt', limit: number = 5): Promise<Event[]> => {
  try {
    const response = await apiService.get<Event[]>('/api/public/events/upcoming', {
      params: { limit: limit.toString() },
      headers: { 'Accept-Language': language },
      includeAuth: false
    });
    
    if (response.success && response.data) {
      return response.data;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    return [];
  }
};
