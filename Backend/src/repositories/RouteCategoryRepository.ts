import { BaseRepository } from '@/core/base/BaseRepository';
import { RouteCategory } from '@/entities/RouteCategory';
import { SelectQueryBuilder } from 'typeorm';

export class RouteCategoryRepository extends BaseRepository<RouteCategory> {
  constructor() {
    super(RouteCategory);
  }

  protected override applySearch(qb: SelectQueryBuilder<RouteCategory>, search: any): void {
    // RouteCategory doesn't need search functionality
  }

  /**
   * Find all categories associated with a route
   */
  async findByRouteId(routeId: number): Promise<RouteCategory[]> {
    return this.repository
      .createQueryBuilder('routeCategory')
      .leftJoinAndSelect('routeCategory.category', 'category')
      .where('routeCategory.routeId = :routeId', { routeId })
      .getMany();
  }

  /**
   * Find specific association between route and category
   */
  async findByRouteIdAndCategoryId(routeId: number, categoryId: number): Promise<RouteCategory | null> {
    return this.repository
      .createQueryBuilder('routeCategory')
      .leftJoinAndSelect('routeCategory.category', 'category')
      .where('routeCategory.routeId = :routeId', { routeId })
      .andWhere('routeCategory.categoryId = :categoryId', { categoryId })
      .getOne();
  }

  /**
   * Create association between route and category
   */
  async createAssociation(routeId: number, categoryId: number): Promise<RouteCategory> {
    const association = this.repository.create({
      routeId,
      categoryId
    });
    
    return this.repository.save(association);
  }

  /**
   * Delete association between route and category
   */
  async deleteAssociation(routeId: number, categoryId: number): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .delete()
      .from(RouteCategory)
      .where('routeId = :routeId', { routeId })
      .andWhere('categoryId = :categoryId', { categoryId })
      .execute();
  }
}

// Export singleton instance 
export const routeCategoryRepository = new RouteCategoryRepository();
