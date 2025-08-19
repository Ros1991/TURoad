import { api } from './api';

export interface LocationCategoryAssociation {
  locationCategoryId: number;
  locationId: number;
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

export const locationCategoryAssociationService = {
  // Get all categories associated with a location
  async getLocationCategories(locationId: number): Promise<LocationCategoryAssociation[]> {
    const response = await api.get(`/locations/${locationId}/categories`);
    return response.data.data;
  },

  // Get available categories for a location (not already associated)
  async getAvailableCategories(locationId: number): Promise<AvailableCategory[]> {
    const response = await api.get(`/locations/${locationId}/available-categories`);
    return response.data.data;
  },

  // Add category to location
  async addCategoryToLocation(locationId: number, categoryId: number): Promise<LocationCategoryAssociation> {
    const response = await api.post(`/locations/${locationId}/categories`, { categoryId });
    return response.data.data;
  },

  // Remove category from location
  async removeCategoryFromLocation(locationId: number, categoryId: number): Promise<void> {
    await api.delete(`/locations/${locationId}/categories/${categoryId}`);
  }
};
