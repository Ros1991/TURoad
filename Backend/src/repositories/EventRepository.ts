import { BaseRepository } from '@/core/base/BaseRepository';
import { Event } from '@/entities/Event';
import { SelectQueryBuilder, FindManyOptions } from 'typeorm';
import { PaginationRequestVO, ListResponseVO } from '@/core/base/BaseVO';

export class EventRepository extends BaseRepository<Event> {
  constructor() {
    super(Event, 'eventId');
  }

  // Override findById to include city relations with localized text
  override async findById(id: number): Promise<Event | null> {
    const event = await this.repository.findOne({
      where: { eventId: id },
      relations: {
        city: true
      }
    });

    if (!event) return null;

    // Fetch localized text for city if it exists
    if (event.city?.nameTextRefId) {
      const localizedText = await this.repository.manager.query(
        `SELECT text_content 
         FROM localized_texts 
         WHERE reference_id = $1 AND language_code = $2`,
        [event.city.nameTextRefId, 'pt']
      );
      
      if (localizedText.length > 0) {
        (event.city as any).name = localizedText[0].text_content;
      }
    }

    return event;
  }

  // Override findWithPagination to always include city relations with localized text
  override async findWithPagination(
    pagination: PaginationRequestVO & { search?: any }, 
    options?: FindManyOptions<Event>,
  ): Promise<ListResponseVO<Event>> {
    // First get the events with city relations
    const optionsWithCity = {
      ...options,
      relations: {
        ...options?.relations,
        city: true
      }
    };
    
    const result = await super.findWithPagination(pagination, optionsWithCity);
    
    // Then fetch localized texts for cities
    const cityIds = result.items
      .map(event => event.city?.nameTextRefId)
      .filter(id => id !== undefined) as number[];
    
    if (cityIds.length > 0) {
      const localizedTexts = await this.repository.manager.query(
        `SELECT reference_id, text_content 
         FROM localized_texts 
         WHERE reference_id = ANY($1) AND language_code = $2`,
        [cityIds, 'pt']
      );
      
      // Map localized texts to cities
      const textMap = new Map<number, string>();
      localizedTexts.forEach((lt: any) => {
        textMap.set(lt.reference_id, lt.text_content);
      });
      
      // Add localized names to city objects
      result.items.forEach(event => {
        if (event.city?.nameTextRefId) {
          const localizedName = textMap.get(event.city.nameTextRefId);
          if (localizedName) {
            (event.city as any).name = localizedName;
          }
        }
      });
    }
    
    return result;
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
    if(search && search.cityId) {
      qb.andWhere('entity.city_id = :cityId', { cityId: search.cityId });
    }
  }
}

// Export singleton instance
export const eventRepository = new EventRepository();
