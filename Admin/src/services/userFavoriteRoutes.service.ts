import { api } from './api';

export interface UserFavoriteRoute {
  userFavoriteRouteId: number;
  userId: number;
  routeId: number;
  route: {
    routeId: number;
    name: string;
    description: string;
    imageUrl?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AvailableRoute {
  route_id: number;
  name: string;
  description: string;
  image_url?: string;
  localized_name: string;
  localized_title: string;
  localized_description: string;
}

export const userFavoriteRoutesService = {
  async getUserFavoriteRoutes(userId: number): Promise<UserFavoriteRoute[]> {
    const response = await api.get(`/users/${userId}/favorite-routes`) as any;
    
    // The axios interceptor is returning the data array directly
    // So response is actually the data array, not the full response object
    if (Array.isArray(response)) {
      return response;
    }
    
    // Fallback to normal response structure
    return response.data?.data || response.data || [];
  },

  async addFavoriteRoute(userId: number, routeId: number): Promise<UserFavoriteRoute> {
    const response = await api.post(`/users/${userId}/favorite-routes`, {
      routeId
    }) as any;
    return response.data?.data || response.data;
  },

  async removeFavoriteRoute(userId: number, routeId: number): Promise<void> {
    await api.delete(`/users/${userId}/favorite-routes/${routeId}`);
  },

  async getAvailableRoutes(userId: number): Promise<AvailableRoute[]> {
    const response = await api.get(`/users/${userId}/available-favorite-routes`) as any;
    
    // The axios interceptor is returning the data array directly
    // So response is actually the data array, not the full response object
    if (Array.isArray(response)) {
      return response;
    }
    
    // Fallback to normal response structure
    return response.data?.data || response.data || [];
  }
};
