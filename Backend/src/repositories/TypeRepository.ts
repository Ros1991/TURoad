import { BaseRepository } from '@/core/base/BaseRepository';
import { Type } from '@/entities/Type';
import { SelectQueryBuilder } from 'typeorm';

export class TypeRepository extends BaseRepository<Type> {
  constructor() {
    super(Type, 'typeId');
  }

  protected override applySearch(qb: SelectQueryBuilder<Type>, search: any): void {
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
export const typeRepository = new TypeRepository();
