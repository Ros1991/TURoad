import { BaseService } from '@/core/base/BaseService';
import { EventCategory } from '@/entities/EventCategory';
import { EventCategoryRepository } from '@/repositories/EventCategoryRepository';
import { categoryRepository } from '@/repositories/CategoryRepository';
import { eventRepository } from '@/repositories/EventRepository';

export class EventCategoryService extends BaseService<EventCategory> {
  private eventCategoryRepository: EventCategoryRepository;

  constructor() {
    super(EventCategory);
    this.eventCategoryRepository = new EventCategoryRepository();
    this.repository = this.eventCategoryRepository;
  }

  /**
   * Get all categories associated with an event
   */
  async getCategoriesByEvent(eventId: number) {
    // Verify event exists
    const event = await eventRepository.findById(eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    const associations = await this.eventCategoryRepository.findByEventId(eventId);
    
    // Return categories with localized text
    return Promise.all(
      associations.map(async (association) => {
        const categoryWithText = await this.fetchLocalizedTextForCategory(association.category);
        return {
          eventCategoryId: association.eventCategoryId,
          eventId: association.eventId,
          categoryId: association.categoryId,
          category: categoryWithText
        };
      })
    );
  }

  /**
   * Add category to event
   */
  async addCategoryToEvent(eventId: number, categoryId: number) {
    // Verify event exists
    const event = await eventRepository.findById(eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    // Verify category exists
    const category = await categoryRepository.findById(categoryId);
    if (!category) {
      throw new Error('Category not found');
    }

    // Check if association already exists
    const existing = await this.eventCategoryRepository.findByEventIdAndCategoryId(eventId, categoryId);
    if (existing) {
      throw new Error('Category already associated with this event');
    }

    // Create association
    const association = await this.eventCategoryRepository.createAssociation(eventId, categoryId);
    
    // Return with category details
    const categoryWithText = await this.fetchLocalizedTextForCategory(category);
    return {
      eventCategoryId: association.eventCategoryId,
      eventId: association.eventId,
      categoryId: association.categoryId,
      category: categoryWithText
    };
  }

  /**
   * Remove category from event
   */
  async removeCategoryFromEvent(eventId: number, categoryId: number) {
    // Verify association exists
    const association = await this.eventCategoryRepository.findByEventIdAndCategoryId(eventId, categoryId);
    if (!association) {
      throw new Error('Category association not found');
    }

    return this.eventCategoryRepository.deleteAssociation(eventId, categoryId);
  }

  /**
   * Get available categories for an event (not already associated)
   */
  async getAvailableCategoriesForEvent(eventId: number) {
    // Verify event exists
    const event = await eventRepository.findById(eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    // Get all categories
    const allCategories = await categoryRepository.findAll();
    
    // Get already associated categories
    const associations = await this.eventCategoryRepository.findByEventId(eventId);
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
