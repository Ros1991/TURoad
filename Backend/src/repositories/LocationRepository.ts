import { BaseRepository } from '@/core/base/BaseRepository';
import { Location } from '@/entities/Location';
import { SelectQueryBuilder, FindManyOptions } from 'typeorm';
import { PaginationRequestVO, ListResponseVO } from '@/core/base/BaseVO';
import { AppDataSource } from '@/config/database';

export class LocationRepository extends BaseRepository<Location> {
  constructor() {
    super(Location, 'locationId');
  }

  // Override findWithPagination to always include city and type relations with localized text
  override async findWithPagination(
    pagination: PaginationRequestVO & { search?: any }, 
    options?: FindManyOptions<Location>,
  ): Promise<ListResponseVO<Location>> {
    // First get the locations with city and type relations
    const optionsWithRelations = {
      ...options,
      relations: {
        ...options?.relations,
        city: true,
        type: true
      }
    };
    
    const result = await super.findWithPagination(pagination, optionsWithRelations);
    
    // Collect all text reference IDs
    const cityIds = result.items
      .map(location => location.city?.nameTextRefId)
      .filter(id => id !== undefined) as number[];
    
    const typeIds = result.items
      .map(location => location.type?.nameTextRefId)
      .filter(id => id !== undefined) as number[];
    
    const allTextRefIds = [...cityIds, ...typeIds];
    
    if (allTextRefIds.length > 0) {
      const localizedTexts = await this.repository.manager.query(
        `SELECT reference_id, text_content 
         FROM localized_texts 
         WHERE reference_id = ANY($1) AND language_code = $2`,
        [allTextRefIds, 'pt']
      );
      
      // Map localized texts
      const textMap = new Map<number, string>();
      localizedTexts.forEach((lt: any) => {
        textMap.set(lt.reference_id, lt.text_content);
      });
      
      // Add localized names to city and type objects
      result.items.forEach(location => {
        if (location.city?.nameTextRefId) {
          const localizedName = textMap.get(location.city.nameTextRefId);
          if (localizedName) {
            (location.city as any).name = localizedName;
          }
        }
        
        if (location.type?.nameTextRefId) {
          const localizedName = textMap.get(location.type.nameTextRefId);
          if (localizedName) {
            (location.type as any).name = localizedName;
          }
        }
      });
    }
    
    return result;
  }

  // Override findById to include city and type relations with localized text
  override async findById(id: number): Promise<Location | null> {
    const whereCondition = {} as any;
    whereCondition[this.primaryKeyFieldName] = id;
    if (this.isSoftDelete()) {
      whereCondition.isDeleted = false;
    }

    const location = await this.repository.findOne({
      where: whereCondition,
      relations: {
        city: true,
        type: true
      }
    });

    if (!location) {
      return null;
    }

    // Collect text reference IDs
    const textRefIds: number[] = [];
    if (location.city?.nameTextRefId) {
      textRefIds.push(location.city.nameTextRefId);
    }
    if (location.type?.nameTextRefId) {
      textRefIds.push(location.type.nameTextRefId);
    }

    if (textRefIds.length > 0) {
      const localizedTexts = await this.repository.manager.query(
        `SELECT reference_id, text_content 
         FROM localized_texts 
         WHERE reference_id = ANY($1) AND language_code = $2`,
        [textRefIds, 'pt']
      );

      // Map localized texts
      const textMap = new Map<number, string>();
      localizedTexts.forEach((lt: any) => {
        textMap.set(lt.reference_id, lt.text_content);
      });

      // Add localized names to city and type objects
      if (location.city?.nameTextRefId) {
        const localizedName = textMap.get(location.city.nameTextRefId);
        if (localizedName) {
          (location.city as any).name = localizedName;
        }
      }

      if (location.type?.nameTextRefId) {
        const localizedName = textMap.get(location.type.nameTextRefId);
        if (localizedName) {
          (location.type as any).name = localizedName;
        }
      }
    }

    return location;
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
    if(search && search.cityId) {
      qb.andWhere('entity.city_id = :cityId', { cityId: search.cityId });
    }
    if(search && search.typeId) {
      qb.andWhere('entity.type_id = :typeId', { typeId: search.typeId });
    }
  }

  /**
   * Get all businesses with localized texts using database JOINs
   * Falls back to Portuguese if the requested language doesn't exist
   */
  async findBusinessesWithLocalizedTexts(language: string = 'pt', search?: string, cityId?: number): Promise<any[]> {
    const qb = AppDataSource
      .createQueryBuilder()
      .select([
        'l.location_id as id',
        'COALESCE(lt_name_lang.text_content, lt_name_pt.text_content) as name',
        'COALESCE(lt_desc_lang.text_content, lt_desc_pt.text_content) as description',
        'l.image_url as image',
        'l.latitude as latitude',
        'l.longitude as longitude'
      ])
      .from('locations', 'l')
      .leftJoin('localized_texts', 'lt_name_lang', 'lt_name_lang.reference_id = l.name_text_ref_id AND lt_name_lang.language_code = :language')
      .leftJoin('localized_texts', 'lt_name_pt', 'lt_name_pt.reference_id = l.name_text_ref_id AND lt_name_pt.language_code = \'pt\'')
      .leftJoin('localized_texts', 'lt_desc_lang', 'lt_desc_lang.reference_id = l.description_text_ref_id AND lt_desc_lang.language_code = :language')
      .leftJoin('localized_texts', 'lt_desc_pt', 'lt_desc_pt.reference_id = l.description_text_ref_id AND lt_desc_pt.language_code = \'pt\'')
      .leftJoin('types', 't', 't.type_id = l.type_id')
      .where('l."deletedAt" IS NULL')
      .andWhere('t.type_id = :businessTypeId', { businessTypeId: 4 })
      .setParameter('language', language);

    // Add search filter if provided
    if (search && search.trim()) {
      qb.andWhere(
        '(COALESCE(lt_name_lang.text_content, lt_name_pt.text_content) ILIKE :search OR COALESCE(lt_desc_lang.text_content, lt_desc_pt.text_content) ILIKE :search)',
        { search: `%${search.trim()}%` }
      );
    }

    // Filter by city if provided
    if (cityId) {
      qb.andWhere('l.city_id = :cityId', { cityId });
    }
    
    return await qb.getRawMany();
  }

  /**
   * Get all historical places with localized texts using database JOINs
   * Falls back to Portuguese if the requested language doesn't exist
   */
  async findHistoricalPlacesWithLocalizedTexts(language: string = 'pt', search?: string, cityId?: number): Promise<any[]> {
    const qb = AppDataSource
      .createQueryBuilder()
      .select([
        'l.location_id as id',
        'COALESCE(lt_name_lang.text_content, lt_name_pt.text_content) as name',
        'COALESCE(lt_desc_lang.text_content, lt_desc_pt.text_content) as description',
        'l.image_url as image',
        'l.latitude as latitude',
        'l.longitude as longitude',
        'COUNT(DISTINCT sl.story_location_id) as "storiesCount"',
        'COALESCE(COALESCE(lt_city_lang.text_content, lt_city_pt.text_content) || \', \' || c.state, \'Location unknown\') as location'
      ])
      .from('locations', 'l')
      .leftJoin('localized_texts', 'lt_name_lang', 'lt_name_lang.reference_id = l.name_text_ref_id AND lt_name_lang.language_code = :language')
      .leftJoin('localized_texts', 'lt_name_pt', 'lt_name_pt.reference_id = l.name_text_ref_id AND lt_name_pt.language_code = \'pt\'')
      .leftJoin('localized_texts', 'lt_desc_lang', 'lt_desc_lang.reference_id = l.description_text_ref_id AND lt_desc_lang.language_code = :language')
      .leftJoin('localized_texts', 'lt_desc_pt', 'lt_desc_pt.reference_id = l.description_text_ref_id AND lt_desc_pt.language_code = \'pt\'')
      .leftJoin('cities', 'c', 'c.city_id = l.city_id')
      .leftJoin('localized_texts', 'lt_city_lang', 'lt_city_lang.reference_id = c.name_text_ref_id AND lt_city_lang.language_code = :language')
      .leftJoin('localized_texts', 'lt_city_pt', 'lt_city_pt.reference_id = c.name_text_ref_id AND lt_city_pt.language_code = \'pt\'')
      .leftJoin('story_locations', 'sl', 'sl.location_id = l.location_id')
      .leftJoin('types', 't', 't.type_id = l.type_id')
      .where('l."deletedAt" IS NULL')
      .andWhere('t.type_id = :historicalTypeId', { historicalTypeId: 3 })
      .groupBy('l.location_id, lt_name_lang.text_content, lt_name_pt.text_content, lt_desc_lang.text_content, lt_desc_pt.text_content, l.image_url, l.latitude, l.longitude, lt_city_lang.text_content, lt_city_pt.text_content, c.state')
      .setParameter('language', language);

    // Add search filter if provided
    if (search && search.trim()) {
      qb.andWhere(
        '(COALESCE(lt_name_lang.text_content, lt_name_pt.text_content) ILIKE :search OR COALESCE(lt_desc_lang.text_content, lt_desc_pt.text_content) ILIKE :search)',
        { search: `%${search.trim()}%` }
      );
    }

    // Filter by city if provided
    if (cityId) {
      qb.andWhere('l.city_id = :cityId', { cityId });
    }
    
    return await qb.getRawMany();
  }
}

// Export singleton instance
export const locationRepository = new LocationRepository();
