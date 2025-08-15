import { BaseRepository } from '@/core/base/BaseRepository';
import { Category } from '@/entities/Category';
import { SelectQueryBuilder } from 'typeorm';

export class CategoryRepository extends BaseRepository<Category> {
  constructor() {
    super(Category, 'categoryId');
  }

  protected override applySearch(qb: SelectQueryBuilder<Category>, search: any): void {
    if(search && search.search && search.search.length > 0) {
      console.log(JSON.stringify(search));
      qb.distinct(true)
        .leftJoin('localized_texts', 'lt', 'lt.reference_id = entity.name_text_ref_id')
        .andWhere('(lt.text_content ILIKE :search AND lt.language_code = :language)', { 
          search: `%${search.search}%`,
          language: 'pt' // Search in Portuguese by default, can be made dynamic later
        });
    }
  }
}

// Export singleton instance
export const categoryRepository = new CategoryRepository();
