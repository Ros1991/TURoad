import { BaseRepository } from '@/core/base/BaseRepository';
import { CityCategory } from '@/entities/CityCategory';

export class CityCategoryRepository extends BaseRepository<CityCategory> {
  constructor() {
    super(CityCategory);
  }

  /**
   * Find all categories for a city
   */
  async findByCityId(cityId: number): Promise<CityCategory[]> {
    return this.repository.find({
      where: { cityId },
      relations: ['category']
    });
  }

  /**
   * Find specific city-category association
   */
  async findByCityIdAndCategoryId(cityId: number, categoryId: number): Promise<CityCategory | null> {
    return this.repository.findOne({
      where: { cityId, categoryId }
    });
  }

  /**
   * Create city-category association
   */
  async createAssociation(cityId: number, categoryId: number): Promise<CityCategory> {
    const association = this.repository.create({
      cityId,
      categoryId
    });
    return this.repository.save(association);
  }

  /**
   * Delete city-category association
   */
  async deleteAssociation(cityId: number, categoryId: number): Promise<boolean> {
    const result = await this.repository.delete({ cityId, categoryId });
    return result.affected ? result.affected > 0 : false;
  }
}

// Create and export singleton instance
export const cityCategoryRepository = new CityCategoryRepository();
