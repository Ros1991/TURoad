import { BaseService } from '@/core/base/BaseService';
import { CityCategory } from '@/entities/CityCategory';
import { CityCategoryRepository } from '@/repositories/CityCategoryRepository';
import { categoryRepository } from '@/repositories/CategoryRepository';
import { cityRepository } from '@/repositories/CityRepository';

export class CityCategoryService extends BaseService<CityCategory> {
  private cityCategoryRepository: CityCategoryRepository;

  constructor() {
    super(CityCategory);
    this.cityCategoryRepository = new CityCategoryRepository();
    this.repository = this.cityCategoryRepository;
  }

  /**
   * Get all categories associated with a city
   */
  async getCategoriesByCity(cityId: number) {
    // Verify city exists
    const city = await cityRepository.findById(cityId);
    if (!city) {
      throw new Error('City not found');
    }

    const associations = await this.cityCategoryRepository.findByCityId(cityId);
    
    // Return categories with localized text
    return Promise.all(
      associations.map(async (association) => {
        const categoryWithText = await this.fetchLocalizedTextForCategory(association.category);
        return {
          cityCategoryId: association.cityCategoryId,
          cityId: association.cityId,
          categoryId: association.categoryId,
          category: categoryWithText
        };
      })
    );
  }

  /**
   * Add category to city
   */
  async addCategoryToCity(cityId: number, categoryId: number) {
    // Verify city exists
    const city = await cityRepository.findById(cityId);
    if (!city) {
      throw new Error('City not found');
    }

    // Verify category exists
    const category = await categoryRepository.findById(categoryId);
    if (!category) {
      throw new Error('Category not found');
    }

    // Check if association already exists
    const existing = await this.cityCategoryRepository.findByCityIdAndCategoryId(cityId, categoryId);
    if (existing) {
      throw new Error('Category already associated with this city');
    }

    // Create association
    const association = await this.cityCategoryRepository.createAssociation(cityId, categoryId);
    
    // Return with category details
    const categoryWithText = await this.fetchLocalizedTextForCategory(category);
    return {
      cityCategoryId: association.cityCategoryId,
      cityId: association.cityId,
      categoryId: association.categoryId,
      category: categoryWithText
    };
  }

  /**
   * Remove category from city
   */
  async removeCategoryFromCity(cityId: number, categoryId: number) {
    // Verify association exists
    const association = await this.cityCategoryRepository.findByCityIdAndCategoryId(cityId, categoryId);
    if (!association) {
      throw new Error('Category association not found');
    }

    return this.cityCategoryRepository.deleteAssociation(cityId, categoryId);
  }

  /**
   * Get available categories for a city (not already associated)
   */
  async getAvailableCategoriesForCity(cityId: number) {
    // Verify city exists
    const city = await cityRepository.findById(cityId);
    if (!city) {
      throw new Error('City not found');
    }

    // Get all categories
    const allCategories = await categoryRepository.findAll();
    
    // Get already associated categories
    const associations = await this.cityCategoryRepository.findByCityId(cityId);
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
