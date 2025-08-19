import { BaseRepository } from '@/core/base/BaseRepository';
import { EventCategory } from '@/entities/EventCategory';
import { SelectQueryBuilder } from 'typeorm';

export class EventCategoryRepository extends BaseRepository<EventCategory> {
  constructor() {
    super(EventCategory);
  }

  protected override applySearch(qb: SelectQueryBuilder<EventCategory>, search: any): void {
    // EventCategory doesn't need search functionality
  }

  /**
   * Find all categories associated with an event
   */
  async findByEventId(eventId: number): Promise<EventCategory[]> {
    return this.repository
      .createQueryBuilder('eventCategory')
      .leftJoinAndSelect('eventCategory.category', 'category')
      .where('eventCategory.eventId = :eventId', { eventId })
      .getMany();
  }

  /**
   * Find specific association between event and category
   */
  async findByEventIdAndCategoryId(eventId: number, categoryId: number): Promise<EventCategory | null> {
    return this.repository
      .createQueryBuilder('eventCategory')
      .leftJoinAndSelect('eventCategory.category', 'category')
      .where('eventCategory.eventId = :eventId', { eventId })
      .andWhere('eventCategory.categoryId = :categoryId', { categoryId })
      .getOne();
  }

  /**
   * Create association between event and category
   */
  async createAssociation(eventId: number, categoryId: number): Promise<EventCategory> {
    const association = this.repository.create({
      eventId,
      categoryId
    });
    
    return this.repository.save(association);
  }

  /**
   * Delete association between event and category
   */
  async deleteAssociation(eventId: number, categoryId: number): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .delete()
      .from(EventCategory)
      .where('eventId = :eventId', { eventId })
      .andWhere('categoryId = :categoryId', { categoryId })
      .execute();
  }
}

// Export singleton instance 
export const eventCategoryRepository = new EventCategoryRepository();
