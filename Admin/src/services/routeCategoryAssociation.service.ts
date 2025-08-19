import { api } from './api';

export interface RouteCategoryAssociation {
  routeCategoryId: number;
  routeId: number;
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

export const routeCategoryAssociationService = {
  // Get all categories associated with a route
  async getRouteCategories(routeId: number): Promise<RouteCategoryAssociation[]> {
    const response = await api.get(`/routes/${routeId}/categories`);
    return response.data.data;
  },

  // Get available categories for a route (not already associated)
  async getAvailableCategories(routeId: number): Promise<AvailableCategory[]> {
    const response = await api.get(`/routes/${routeId}/available-categories`);
    return response.data.data;
  },

  // Add category to route
  async addCategoryToRoute(routeId: number, categoryId: number): Promise<RouteCategoryAssociation> {
    const response = await api.post(`/routes/${routeId}/categories`, { categoryId });
    return response.data.data;
  },

  // Remove category from route
  async removeCategoryFromRoute(routeId: number, categoryId: number): Promise<void> {
    await api.delete(`/routes/${routeId}/categories/${categoryId}`);
  }
};
