import { BaseService } from '@/core/base/BaseService';
import { LocationCategory } from '@/entities/LocationCategory';
import { LocationCategoryRepository } from '@/repositories/LocationCategoryRepository';
import { categoryRepository } from '@/repositories/CategoryRepository';
import { locationRepository } from '@/repositories/LocationRepository';

export class LocationCategoryService extends BaseService<LocationCategory> {
  private locationCategoryRepository: LocationCategoryRepository;

  constructor() {
    super(LocationCategory);
    this.locationCategoryRepository = new LocationCategoryRepository();
    this.repository = this.locationCategoryRepository;
  }

  /**
   * Get all categories associated with a location
   */
  async getCategoriesByLocation(locationId: number) {
    // Verify location exists
    const location = await locationRepository.findById(locationId);
    if (!location) {
      throw new Error('Location not found');
    }

    const associations = await this.locationCategoryRepository.findByLocationId(locationId);
    
    // Return categories with localized text
    return Promise.all(
      associations.map(async (association) => {
        const categoryWithText = await this.fetchLocalizedTextForCategory(association.category);
        return {
          locationCategoryId: association.locationCategoryId,
          locationId: association.locationId,
          categoryId: association.categoryId,
          category: categoryWithText
        };
      })
    );
  }

  /**
   * Add category to location
   */
  async addCategoryToLocation(locationId: number, categoryId: number) {
    // Verify location exists
    const location = await locationRepository.findById(locationId);
    if (!location) {
      throw new Error('Location not found');
    }

    // Verify category exists
    const category = await categoryRepository.findById(categoryId);
    if (!category) {
      throw new Error('Category not found');
    }

    // Check if association already exists
    const existing = await this.locationCategoryRepository.findByLocationIdAndCategoryId(locationId, categoryId);
    if (existing) {
      throw new Error('Category already associated with this location');
    }

    // Create association
    const association = await this.locationCategoryRepository.createAssociation(locationId, categoryId);
    
    // Return with category details
    const categoryWithText = await this.fetchLocalizedTextForCategory(category);
    return {
      locationCategoryId: association.locationCategoryId,
      locationId: association.locationId,
      categoryId: association.categoryId,
      category: categoryWithText
    };
  }

  /**
   * Remove category from location
   */
  async removeCategoryFromLocation(locationId: number, categoryId: number) {
    // Verify association exists
    const association = await this.locationCategoryRepository.findByLocationIdAndCategoryId(locationId, categoryId);
    if (!association) {
      throw new Error('Category association not found');
    }

    return this.locationCategoryRepository.deleteAssociation(locationId, categoryId);
  }

  /**
   * Get available categories for a location (not already associated)
   */
  async getAvailableCategoriesForLocation(locationId: number) {
    // Verify location exists
    const location = await locationRepository.findById(locationId);
    if (!location) {
      throw new Error('Location not found');
    }

    // Get all categories
    const allCategories = await categoryRepository.findAll();
    
    // Get already associated categories
    const associations = await this.locationCategoryRepository.findByLocationId(locationId);
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
