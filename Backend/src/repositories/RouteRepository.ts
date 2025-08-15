import { BaseRepository } from '@/core/base/BaseRepository';
import { Route } from '@/entities/Route';
import { SelectQueryBuilder } from 'typeorm';

export class RouteRepository extends BaseRepository<Route> {
  constructor() {
    super(Route, 'routeId');
  }

  protected override applySearch(qb: SelectQueryBuilder<Route>, search: any): void {
    if(search && search.search && search.search.length > 0) {
      qb.distinct(true)
        .leftJoin('localized_texts', 'lt', 'lt.reference_id = entity.title_text_ref_id OR lt.reference_id = entity.description_text_ref_id OR lt.reference_id = entity.what_to_observe_text_ref_id')
        .andWhere('(lt.text_content ILIKE :search AND lt.language_code = :language)', { 
          search: `%${search.search}%`,
          language: 'pt'
        });
    }
  }
}

// Export singleton instance
export const routeRepository = new RouteRepository();
