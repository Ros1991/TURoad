import { BaseService } from '@/core/base/BaseService';
import { RouteCategory } from '@/entities/RouteCategory';
import { RouteCategoryRepository } from '@/repositories/RouteCategoryRepository';
import { categoryRepository } from '@/repositories/CategoryRepository';
import { routeRepository } from '@/repositories/RouteRepository';

export class RouteCategoryService extends BaseService<RouteCategory> {
  private routeCategoryRepository: RouteCategoryRepository;

  constructor() {
    super(RouteCategory);
    this.routeCategoryRepository = new RouteCategoryRepository();
    this.repository = this.routeCategoryRepository;
  }

  /**
   * Get all categories associated with a route
   */
  async getCategoriesByRoute(routeId: number) {
    // Verify route exists
    const route = await routeRepository.findById(routeId);
    if (!route) {
      throw new Error('Route not found');
    }

    const associations = await this.routeCategoryRepository.findByRouteId(routeId);
    
    // Return categories with localized text
    return Promise.all(
      associations.map(async (association) => {
        const categoryWithText = await this.fetchLocalizedTextForCategory(association.category);
        return {
          routeCategoryId: association.routeCategoryId,
          routeId: association.routeId,
          categoryId: association.categoryId,
          category: categoryWithText
        };
      })
    );
  }

  /**
   * Add category to route
   */
  async addCategoryToRoute(routeId: number, categoryId: number) {
    // Verify route exists
    const route = await routeRepository.findById(routeId);
    if (!route) {
      throw new Error('Route not found');
    }

    // Verify category exists
    const category = await categoryRepository.findById(categoryId);
    if (!category) {
      throw new Error('Category not found');
    }

    // Check if association already exists
    const existing = await this.routeCategoryRepository.findByRouteIdAndCategoryId(routeId, categoryId);
    if (existing) {
      throw new Error('Category already associated with this route');
    }

    // Create association
    const association = await this.routeCategoryRepository.createAssociation(routeId, categoryId);
    
    // Return with category details
    const categoryWithText = await this.fetchLocalizedTextForCategory(category);
    return {
      routeCategoryId: association.routeCategoryId,
      routeId: association.routeId,
      categoryId: association.categoryId,
      category: categoryWithText
    };
  }

  /**
   * Remove category from route
   */
  async removeCategoryFromRoute(routeId: number, categoryId: number) {
    // Verify association exists
    const association = await this.routeCategoryRepository.findByRouteIdAndCategoryId(routeId, categoryId);
    if (!association) {
      throw new Error('Category association not found');
    }

    return this.routeCategoryRepository.deleteAssociation(routeId, categoryId);
  }

  /**
   * Get available categories for a route (not already associated)
   */
  async getAvailableCategoriesForRoute(routeId: number) {
    // Verify route exists
    const route = await routeRepository.findById(routeId);
    if (!route) {
      throw new Error('Route not found');
    }

    // Get all categories
    const allCategories = await categoryRepository.findAll();
    
    // Get already associated categories
    const associations = await this.routeCategoryRepository.findByRouteId(routeId);
    const associatedCategoryIds = associations.map(a => a.categoryId);

    // Filter out already associated categories
    const availableCategories = allCategories.filter(
      category => !associatedCategoryIds.includes(category.categoryId)
    );

    // Return with localized text
    return Promise.all(
      availableCategories.map(category => this.fetchLocalizedTextForCategory(category))
    );
  }

  /**
   * Helper method to fetch localized text for category entities
   */
  private async fetchLocalizedTextForCategory(entity: any): Promise<any> {
    if (!entity) return entity;
    
    // Import CategoryService dynamically to avoid circular dependency
    const { CategoryService } = await import('@/services/CategoryService');
    const categoryService = new CategoryService();
    return (categoryService as any).fetchLocalizedTextForEntity(entity);
  }
}
