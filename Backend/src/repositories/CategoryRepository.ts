import { BaseRepository } from '@/core/base/BaseRepository';
import { Category } from '@/entities/Category';
import { SelectQueryBuilder } from 'typeorm';

export class CategoryRepository extends BaseRepository<Category> {
  constructor() {
    super(Category, 'categoryId');
  }

  protected override applySearch(qb: SelectQueryBuilder<Category>, search: any): void {
    if(search && search.search && search.search.length > 0) {
      qb.andWhere('entity.nameTextRefId ILIKE :search', { search: `%${search.search}%` });
    }
    if(search && search.isActive !== undefined){
      qb.andWhere('entity.isActive = :isActive', { isActive: search.isActive });
    }
  }
}

// Export singleton instance
export const categoryRepository = new CategoryRepository();
