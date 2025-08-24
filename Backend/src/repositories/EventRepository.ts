import { BaseRepository } from '@/core/base/BaseRepository';
import { Event } from '@/entities/Event';
import { SelectQueryBuilder, FindManyOptions } from 'typeorm';
import { PaginationRequestVO, ListResponseVO } from '@/core/base/BaseVO';
import { AppDataSource } from '@/config/database';

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

  /**
   * Get all events with localized texts using database JOINs
   * Falls back to Portuguese if the requested language doesn't exist
   */
  async findAllWithLocalizedTexts(language: string = 'pt', cityId?: number, search?: string): Promise<any[]> {
    const qb = AppDataSource
      .createQueryBuilder()
      .select([
        'e.event_id as id',
        'COALESCE(lt_name_lang.text_content, lt_name_pt.text_content) as name',
        'COALESCE(lt_desc_lang.text_content, lt_desc_pt.text_content) as description',
        'COALESCE(lt_location_lang.text_content, lt_location_pt.text_content) as location',
        'COALESCE(lt_time_lang.text_content, lt_time_pt.text_content) as time',
        'e.event_date as eventDate',
        'e.image_url as image',
        'COALESCE(lt_cat_lang.text_content, lt_cat_pt.text_content, \'Evento\') as type'
      ])
      .from('events', 'e')
      .leftJoin('localized_texts', 'lt_name_lang', 'lt_name_lang.reference_id = e.name_text_ref_id AND lt_name_lang.language_code = :language')
      .leftJoin('localized_texts', 'lt_name_pt', 'lt_name_pt.reference_id = e.name_text_ref_id AND lt_name_pt.language_code = \'pt\'')
      .leftJoin('localized_texts', 'lt_desc_lang', 'lt_desc_lang.reference_id = e.description_text_ref_id AND lt_desc_lang.language_code = :language')
      .leftJoin('localized_texts', 'lt_desc_pt', 'lt_desc_pt.reference_id = e.description_text_ref_id AND lt_desc_pt.language_code = \'pt\'')
      .leftJoin('localized_texts', 'lt_location_lang', 'lt_location_lang.reference_id = e.location_text_ref_id AND lt_location_lang.language_code = :language')
      .leftJoin('localized_texts', 'lt_location_pt', 'lt_location_pt.reference_id = e.location_text_ref_id AND lt_location_pt.language_code = \'pt\'')
      .leftJoin('localized_texts', 'lt_time_lang', 'lt_time_lang.reference_id = e.time_text_ref_id AND lt_time_lang.language_code = :language')
      .leftJoin('localized_texts', 'lt_time_pt', 'lt_time_pt.reference_id = e.time_text_ref_id AND lt_time_pt.language_code = \'pt\'')
      .leftJoin('event_categories', 'ec', 'ec.event_id = e.event_id')
      .leftJoin('categories', 'cat', 'cat.category_id = ec.category_id')
      .leftJoin('localized_texts', 'lt_cat_lang', 'lt_cat_lang.reference_id = cat.name_text_ref_id AND lt_cat_lang.language_code = :language')
      .leftJoin('localized_texts', 'lt_cat_pt', 'lt_cat_pt.reference_id = cat.name_text_ref_id AND lt_cat_pt.language_code = \'pt\'')
      .where('e."deletedAt" IS NULL')
      .setParameter('language', language);

    // Filter by city if provided
    if (cityId) {
      qb.andWhere('e.city_id = :cityId', { cityId });
    }

    // Add search filter if provided
    if (search && search.trim()) {
      qb.andWhere(
        '(COALESCE(lt_name_lang.text_content, lt_name_pt.text_content) ILIKE :search OR COALESCE(lt_desc_lang.text_content, lt_desc_pt.text_content) ILIKE :search OR COALESCE(lt_location_lang.text_content, lt_location_pt.text_content) ILIKE :search)',
        { search: `%${search.trim()}%` }
      );
    }
    
    return await qb.getRawMany();
  }
}

// Export singleton instance
export const eventRepository = new EventRepository();
