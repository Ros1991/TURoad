import { api } from './api';

export interface UserVisitedRoute {
  userVisitedRouteId: number;
  userId: number;
  routeId: number;
  visitedAt: string;
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

export const userVisitedRoutesService = {
  async getUserVisitedRoutes(userId: number): Promise<UserVisitedRoute[]> {
    const response = await api.get(`/users/${userId}/visited-routes`) as any;
    
    // The axios interceptor is returning the data array directly
    // So response is actually the data array, not the full response object
    if (Array.isArray(response)) {
      return response;
    }
    
    // Fallback to normal response structure
    return response.data?.data || response.data || [];
  },

  async addVisitedRoute(userId: number, routeId: number, visitedAt?: Date): Promise<UserVisitedRoute> {
    const response = await api.post(`/users/${userId}/visited-routes`, {
      routeId,
      visitedAt: visitedAt?.toISOString()
    }) as any;
    return response.data?.data || response.data;
  },

  async removeVisitedRoute(userId: number, routeId: number): Promise<void> {
    await api.delete(`/users/${userId}/visited-routes/${routeId}`);
  },

  async getAvailableRoutes(userId: number): Promise<AvailableRoute[]> {
    const response = await api.get(`/users/${userId}/available-visited-routes`) as any;
    
    // The axios interceptor is returning the data array directly
    // So response is actually the data array, not the full response object
    if (Array.isArray(response)) {
      return response;
    }
    
    // Fallback to normal response structure
    return response.data?.data || response.data || [];
  }
};
