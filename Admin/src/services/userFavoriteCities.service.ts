import { api } from './api';

export interface UserFavoriteCity {
  userFavoriteCityId: number;
  userId: number;
  cityId: number;
  city: {
    cityId: number;
    name: string;
    country: string;
    state: string;
    latitude: number;
    longitude: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AvailableCity {
  city_id: number;
  name: string;
  country: string;
  state: string;
  latitude: number;
  longitude: number;
  localized_name: string;
}

export const userFavoriteCitiesService = {
  async getUserFavoriteCities(userId: number): Promise<UserFavoriteCity[]> {
    const response = await api.get(`/users/${userId}/favorite-cities`) as any;
    
    // The axios interceptor is returning the data array directly
    // So response is actually the data array, not the full response object
    if (Array.isArray(response)) {
      return response;
    }
    
    // Fallback to normal response structure
    return response.data?.data || response.data || [];
  },

  async addFavoriteCity(userId: number, cityId: number): Promise<UserFavoriteCity> {
    const response = await api.post(`/users/${userId}/favorite-cities`, {
      cityId
    }) as any;
    return response.data?.data || response.data;
  },

  async removeFavoriteCity(userId: number, cityId: number): Promise<void> {
    await api.delete(`/users/${userId}/favorite-cities/${cityId}`);
  },

  async getAvailableCities(userId: number): Promise<AvailableCity[]> {
    const response = await api.get(`/users/${userId}/available-cities`) as any;
    
    // The axios interceptor is returning the data array directly
    // So response is actually the data array, not the full response object
    if (Array.isArray(response)) {
      return response;
    }
    
    // Fallback to normal response structure
    return response.data?.data || response.data || [];
  }
};
