import { BaseRepository } from '@/core/base/BaseRepository';
import { Event } from '@/entities/Event';
import { SelectQueryBuilder } from 'typeorm';

export class EventRepository extends BaseRepository<Event> {
  constructor() {
    super(Event, 'eventId');
  }

  protected override applySearch(qb: SelectQueryBuilder<Event>, search: any): void {
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
export const eventRepository = new EventRepository();
