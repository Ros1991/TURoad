import { BaseRepository } from '@/core/base/BaseRepository';
import { Location } from '@/entities/Location';
import { SelectQueryBuilder } from 'typeorm';

export class LocationRepository extends BaseRepository<Location> {
  constructor() {
    super(Location, 'locationId');
  }

  protected override applySearch(qb: SelectQueryBuilder<Location>, search: any): void {
    if(search && search.search && search.search.length > 0) {
      qb.distinct(true)
        .leftJoin('localized_texts', 'lt', 'lt.reference_id = entity.name_text_ref_id OR lt.reference_id = entity.description_text_ref_id')
        .andWhere('(lt.text_content ILIKE :search AND lt.language_code = :language)', { 
          search: `%${search.search}%`,
          language: 'pt'
        });
    }
  }
}

// Export singleton instance
export const locationRepository = new LocationRepository();
