import { HistoricalPlace } from "../types";
import { apiService } from './ApiService';

export const getHistoricalPlaces = async (language: string = 'pt'): Promise<HistoricalPlace[]> => {
  try {
    const response = await apiService.get<HistoricalPlace[]>('/api/public/locations/historical', {
      headers: { 'Accept-Language': language },
      includeAuth: false
    });
    
    if (response.success && response.data) {
      return response.data;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching historical places:', error);
    return [];
  }
};

export const getHistoricalPlaceById = async (id: string, language: string = 'pt'): Promise<HistoricalPlace | null> => {
  try {
    const response = await apiService.get<HistoricalPlace>(`/api/public/locations/historical/${id}`, {
      headers: { 'Accept-Language': language },
      includeAuth: false
    });
    
    if (response.success && response.data) {
      return response.data;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching historical place by id:', error);
    return null;
  }
};

export const getHistoricalPlacesByCity = async (cityId: string, language: string = 'pt'): Promise<HistoricalPlace[]> => {
  try {
    const response = await apiService.get<HistoricalPlace[]>('/api/public/locations/historical', {
      params: { cityId },
      headers: { 'Accept-Language': language }
    });
    
    if (response.success && response.data) {
      return response.data;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching historical places by city:', error);
    return [];
  }
};

export const getFeaturedHistoricalPlaces = async (language: string = 'pt', limit: number = 5): Promise<HistoricalPlace[]> => {
  try {
    const response = await apiService.get<HistoricalPlace[]>('/api/public/locations/historical/featured', {
      params: { limit: limit.toString() },
      headers: { 'Accept-Language': language },
      includeAuth: false
    });
    
    if (response.success && response.data) {
      return response.data;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching featured historical places:', error);
    return [];
  }
};
