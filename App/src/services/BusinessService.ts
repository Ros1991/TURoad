import { Business } from "../types";
import { apiService } from './ApiService';

export const getBusinesses = async (search?: string, cityId?: string, locationId?: string): Promise<Business[]> => {
  try {
    const params: any = {};
    if (search) {
      params.search = search;
    }
    if (cityId) {
      params.cityId = cityId;
    }
    if (locationId) {
      params.locationId = locationId;
    }
    
    const response = await apiService.get<Business[]>('/api/public/locations/businesses', {
      params,
      includeAuth: false // Public endpoint doesn't need authentication
    });
    
    if (response.success && response.data) {
      return response.data;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching businesses:', error);
    return [];
  }
};

export const getHosting = async (search?: string, cityId?: string, locationId?: string): Promise<Business[]> => {
  try {
    const params: any = {};
    if (search) {
      params.search = search;
    }
    if (cityId) {
      params.cityId = cityId;
    }
    if (locationId) {
      params.locationId = locationId;
    }
    
    const response = await apiService.get<Business[]>('/api/public/locations/hosting', {
      params,
      includeAuth: false // Public endpoint doesn't need authentication
    });
    
    if (response.success && response.data) {
      return response.data;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching hosting:', error);
    return [];
  }
};

export const getBusinessById = async (id: string, language: string = 'pt'): Promise<Business | null> => {
  try {
    const response = await apiService.get<Business>(`/api/public/locations/businesses/${id}`, {
      headers: { 'Accept-Language': language },
      includeAuth: false
    });
    
    if (response.success && response.data) {
      return response.data;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching business by id:', error);
    return null;
  }
};

export const getBusinessesByType = async (type: string, language: string = 'pt'): Promise<Business[]> => {
  try {
    const response = await apiService.get<Business[]>('/api/public/locations/businesses', {
      params: { type },
      headers: { 'Accept-Language': language }
    });
    
    if (response.success && response.data) {
      return response.data;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching businesses by type:', error);
    return [];
  }
};

export const getFeaturedBusinesses = async (language: string = 'pt', limit: number = 5): Promise<Business[]> => {
  try {
    const response = await apiService.get<Business[]>('/api/public/locations/businesses/featured', {
      params: { limit: limit.toString() },
      headers: { 'Accept-Language': language },
      includeAuth: false
    });
    
    if (response.success && response.data) {
      return response.data;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching featured businesses:', error);
    return [];
  }
};
