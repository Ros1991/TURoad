import { api } from './api';
import { Category } from './categories.service';

export interface CategoryAssociation {
  cityCategoryId: number;
  cityId: number;
  categoryId: number;
  category: Category;
}

export interface AddCategoryRequest {
  categoryId: number;
}

class CategoryAssociationService {
  /**
   * Get all categories associated with an entity
   */
  async getAssociatedCategories(entityType: 'cities' | 'routes' | 'locations' | 'events', entityId: number): Promise<CategoryAssociation[]> {
    return api.get<CategoryAssociation[]>(`/${entityType}/${entityId}/categories`);
  }

  /**
   * Get available categories for an entity (not already associated)
   */
  async getAvailableCategories(entityType: 'cities' | 'routes' | 'locations' | 'events', entityId: number): Promise<Category[]> {
    return api.get<Category[]>(`/${entityType}/${entityId}/categories/available`);
  }

  /**
   * Add category to entity
   */
  async addCategory(entityType: 'cities' | 'routes' | 'locations' | 'events', entityId: number, data: AddCategoryRequest): Promise<CategoryAssociation> {
    return api.post<CategoryAssociation>(`/${entityType}/${entityId}/categories`, data);
  }

  /**
   * Remove category from entity
   */
  async removeCategory(entityType: 'cities' | 'routes' | 'locations' | 'events', entityId: number, categoryId: number): Promise<void> {
    return api.delete<void>(`/${entityType}/${entityId}/categories/${categoryId}`);
  }
}

export const categoryAssociationService = new CategoryAssociationService();
export default categoryAssociationService;
