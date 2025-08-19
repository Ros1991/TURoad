import { BaseRepository } from '@/core/base/BaseRepository';
import { LocationCategory } from '@/entities/LocationCategory';
import { SelectQueryBuilder } from 'typeorm';

export class LocationCategoryRepository extends BaseRepository<LocationCategory> {
  constructor() {
    super(LocationCategory);
  }

  protected override applySearch(qb: SelectQueryBuilder<LocationCategory>, search: any): void {
    // LocationCategory doesn't need search functionality
  }

  /**
   * Find all categories associated with a location
   */
  async findByLocationId(locationId: number): Promise<LocationCategory[]> {
    return this.repository
      .createQueryBuilder('locationCategory')
      .leftJoinAndSelect('locationCategory.category', 'category')
      .where('locationCategory.locationId = :locationId', { locationId })
      .getMany();
  }

  /**
   * Find specific association between location and category
   */
  async findByLocationIdAndCategoryId(locationId: number, categoryId: number): Promise<LocationCategory | null> {
    return this.repository
      .createQueryBuilder('locationCategory')
      .leftJoinAndSelect('locationCategory.category', 'category')
      .where('locationCategory.locationId = :locationId', { locationId })
      .andWhere('locationCategory.categoryId = :categoryId', { categoryId })
      .getOne();
  }

  /**
   * Create association between location and category
   */
  async createAssociation(locationId: number, categoryId: number): Promise<LocationCategory> {
    const association = this.repository.create({
      locationId,
      categoryId
    });
    
    return this.repository.save(association);
  }

  /**
   * Delete association between location and category
   */
  async deleteAssociation(locationId: number, categoryId: number): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .delete()
      .from(LocationCategory)
      .where('locationId = :locationId', { locationId })
      .andWhere('categoryId = :categoryId', { categoryId })
      .execute();
  }
}

// Export singleton instance 
export const locationCategoryRepository = new LocationCategoryRepository();
