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
  async findBusinessesWithLocalizedTexts(language: string = 'pt', search?: string, cityId?: number, userLatitude?: number, userLongitude?: number): Promise<any[]> {
    const selectFields = [
      'l.location_id as id',
      'COALESCE(lt_name_lang.text_content, lt_name_pt.text_content) as name',
      'COALESCE(lt_desc_lang.text_content, lt_desc_pt.text_content) as description',
      'l.image_url as image',
      'l.latitude as latitude',
      'l.longitude as longitude',
      'COUNT(DISTINCT sl.story_location_id) as "storiesCount"',
      'ARRAY_AGG(DISTINCT COALESCE(lt_cat_lang.text_content, lt_cat_pt.text_content)) FILTER (WHERE lc.category_id IS NOT NULL) as categories'
    ];

    // Add distance calculation if user location is provided
    if (userLatitude !== undefined && userLongitude !== undefined) {
      selectFields.push(
        `(
          6371 * acos(
            LEAST(1.0, GREATEST(-1.0,
              cos(radians(:userLat)) * cos(radians(l.latitude)) *
              cos(radians(l.longitude) - radians(:userLng)) +
              sin(radians(:userLat)) * sin(radians(l.latitude))
            ))
          )
        ) as distance`
      );
    }

    const qb = AppDataSource
      .createQueryBuilder()
      .select(selectFields)
      .from('locations', 'l')
      .leftJoin('localized_texts', 'lt_name_lang', 'lt_name_lang.reference_id = l.name_text_ref_id AND lt_name_lang.language_code = :language')
      .leftJoin('localized_texts', 'lt_name_pt', 'lt_name_pt.reference_id = l.name_text_ref_id AND lt_name_pt.language_code = \'pt\'')
      .leftJoin('localized_texts', 'lt_desc_lang', 'lt_desc_lang.reference_id = l.description_text_ref_id AND lt_desc_lang.language_code = :language')
      .leftJoin('localized_texts', 'lt_desc_pt', 'lt_desc_pt.reference_id = l.description_text_ref_id AND lt_desc_pt.language_code = \'pt\'')
      .leftJoin('story_locations', 'sl', 'sl.location_id = l.location_id')
      .leftJoin('types', 't', 't.type_id = l.type_id')
      .leftJoin('location_categories', 'lc', 'lc.location_id = l.location_id')
      .leftJoin('categories', 'cat', 'cat.category_id = lc.category_id AND cat."deletedAt" IS NULL')
      .leftJoin('localized_texts', 'lt_cat_lang', 'lt_cat_lang.reference_id = cat.name_text_ref_id AND lt_cat_lang.language_code = :language')
      .leftJoin('localized_texts', 'lt_cat_pt', 'lt_cat_pt.reference_id = cat.name_text_ref_id AND lt_cat_pt.language_code = \'pt\'')
      .where('l."deletedAt" IS NULL')
      .groupBy('l.location_id, lt_name_lang.text_content, lt_name_pt.text_content, lt_desc_lang.text_content, lt_desc_pt.text_content, l.image_url, l.latitude, l.longitude')
      .andWhere('t.type_id = :businessTypeId', { businessTypeId: 4 })
      .setParameter('language', language);

    // Set location parameters if provided
    if (userLatitude !== undefined && userLongitude !== undefined) {
      qb.setParameter('userLat', userLatitude)
        .setParameter('userLng', userLongitude);
    }

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
    
    // Order by distance if user location is provided, otherwise by name
    if (userLatitude !== undefined && userLongitude !== undefined) {
      qb.orderBy('distance', 'ASC');
    } else {
      qb.orderBy('COALESCE(lt_name_lang.text_content, lt_name_pt.text_content)', 'ASC');
    }
    
    return await qb.getRawMany();
  }

  /**
   * Get all historical places with localized texts using database JOINs
   * Falls back to Portuguese if the requested language doesn't exist
   */
  async findHistoricalPlacesWithLocalizedTexts(language: string = 'pt', search?: string, cityId?: number, userLatitude?: number, userLongitude?: number): Promise<any[]> {
    const selectFields = [
      'l.location_id as id',
      'COALESCE(lt_name_lang.text_content, lt_name_pt.text_content) as name',
      'COALESCE(lt_desc_lang.text_content, lt_desc_pt.text_content) as description',
      'l.image_url as image',
      'l.latitude as latitude',
      'l.longitude as longitude',
      'COUNT(DISTINCT sl.story_location_id) as "storiesCount"',
      'ARRAY_AGG(DISTINCT COALESCE(lt_cat_lang.text_content, lt_cat_pt.text_content)) FILTER (WHERE lc.category_id IS NOT NULL) as categories'
    ];

    // Add distance calculation if user location is provided
    if (userLatitude !== undefined && userLongitude !== undefined) {
      selectFields.push(
        `(
          6371 * acos(
            LEAST(1.0, GREATEST(-1.0,
              cos(radians(:userLat)) * cos(radians(l.latitude)) *
              cos(radians(l.longitude) - radians(:userLng)) +
              sin(radians(:userLat)) * sin(radians(l.latitude))
            ))
          )
        ) as distance`
      );
    }

    const qb = AppDataSource
      .createQueryBuilder()
      .select(selectFields)
      .from('locations', 'l')
      .leftJoin('localized_texts', 'lt_name_lang', 'lt_name_lang.reference_id = l.name_text_ref_id AND lt_name_lang.language_code = :language')
      .leftJoin('localized_texts', 'lt_name_pt', 'lt_name_pt.reference_id = l.name_text_ref_id AND lt_name_pt.language_code = \'pt\'')
      .leftJoin('localized_texts', 'lt_desc_lang', 'lt_desc_lang.reference_id = l.description_text_ref_id AND lt_desc_lang.language_code = :language')
      .leftJoin('localized_texts', 'lt_desc_pt', 'lt_desc_pt.reference_id = l.description_text_ref_id AND lt_desc_pt.language_code = \'pt\'')
      .leftJoin('story_locations', 'sl', 'sl.location_id = l.location_id')
      .leftJoin('types', 't', 't.type_id = l.type_id')
      .leftJoin('location_categories', 'lc', 'lc.location_id = l.location_id')
      .leftJoin('categories', 'cat', 'cat.category_id = lc.category_id AND cat."deletedAt" IS NULL')
      .leftJoin('localized_texts', 'lt_cat_lang', 'lt_cat_lang.reference_id = cat.name_text_ref_id AND lt_cat_lang.language_code = :language')
      .leftJoin('localized_texts', 'lt_cat_pt', 'lt_cat_pt.reference_id = cat.name_text_ref_id AND lt_cat_pt.language_code = \'pt\'')
      .where('l."deletedAt" IS NULL')
      .andWhere('t.type_id = :historicalTypeId', { historicalTypeId: 3 })
      .groupBy('l.location_id, lt_name_lang.text_content, lt_name_pt.text_content, lt_desc_lang.text_content, lt_desc_pt.text_content, l.image_url, l.latitude, l.longitude')
      .setParameter('language', language);

    // Set location parameters if provided
    if (userLatitude !== undefined && userLongitude !== undefined) {
      qb.setParameter('userLat', userLatitude)
        .setParameter('userLng', userLongitude);
    }

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
    
    // Order by distance if user location is provided, otherwise by name
    if (userLatitude !== undefined && userLongitude !== undefined) {
      qb.orderBy('distance', 'ASC');
    } else {
      qb.orderBy('COALESCE(lt_name_lang.text_content, lt_name_pt.text_content)', 'ASC');
    }
    
    return await qb.getRawMany();
  }

  /**
   * Get all hosting places with localized texts using database JOINs
   * Falls back to Portuguese if the requested language doesn't exist
   */
  async findHostingWithLocalizedTexts(language: string = 'pt', search?: string, cityId?: number, userLatitude?: number, userLongitude?: number): Promise<any[]> {
    const selectFields = [
      'l.location_id as id',
      'COALESCE(lt_name_lang.text_content, lt_name_pt.text_content) as name',
      'COALESCE(lt_desc_lang.text_content, lt_desc_pt.text_content) as description',
      'l.image_url as image',
      'l.latitude as latitude',
      'l.longitude as longitude',
      'COUNT(DISTINCT sl.story_location_id) as "storiesCount"',
      'ARRAY_AGG(DISTINCT COALESCE(lt_cat_lang.text_content, lt_cat_pt.text_content)) FILTER (WHERE lc.category_id IS NOT NULL) as categories'
    ];

    // Add distance calculation if user location is provided
    if (userLatitude !== undefined && userLongitude !== undefined) {
      selectFields.push(
        `(
          6371 * acos(
            LEAST(1.0, GREATEST(-1.0,
              cos(radians(:userLat)) * cos(radians(l.latitude)) *
              cos(radians(l.longitude) - radians(:userLng)) +
              sin(radians(:userLat)) * sin(radians(l.latitude))
            ))
          )
        ) as distance`
      );
    }

    const qb = AppDataSource
      .createQueryBuilder()
      .select(selectFields)
      .from('locations', 'l')
      .leftJoin('localized_texts', 'lt_name_lang', 'lt_name_lang.reference_id = l.name_text_ref_id AND lt_name_lang.language_code = :language')
      .leftJoin('localized_texts', 'lt_name_pt', 'lt_name_pt.reference_id = l.name_text_ref_id AND lt_name_pt.language_code = \'pt\'')
      .leftJoin('localized_texts', 'lt_desc_lang', 'lt_desc_lang.reference_id = l.description_text_ref_id AND lt_desc_lang.language_code = :language')
      .leftJoin('localized_texts', 'lt_desc_pt', 'lt_desc_pt.reference_id = l.description_text_ref_id AND lt_desc_pt.language_code = \'pt\'')
      .leftJoin('story_locations', 'sl', 'sl.location_id = l.location_id')
      .leftJoin('types', 't', 't.type_id = l.type_id')
      .leftJoin('location_categories', 'lc', 'lc.location_id = l.location_id')
      .leftJoin('categories', 'cat', 'cat.category_id = lc.category_id AND cat."deletedAt" IS NULL')
      .leftJoin('localized_texts', 'lt_cat_lang', 'lt_cat_lang.reference_id = cat.name_text_ref_id AND lt_cat_lang.language_code = :language')
      .leftJoin('localized_texts', 'lt_cat_pt', 'lt_cat_pt.reference_id = cat.name_text_ref_id AND lt_cat_pt.language_code = \'pt\'')
      .where('l."deletedAt" IS NULL')
      .groupBy('l.location_id, lt_name_lang.text_content, lt_name_pt.text_content, lt_desc_lang.text_content, lt_desc_pt.text_content, l.image_url, l.latitude, l.longitude')
      .andWhere('t.type_id = :hostingTypeId', { hostingTypeId: 5 })
      .setParameter('language', language);

    // Set location parameters if provided
    if (userLatitude !== undefined && userLongitude !== undefined) {
      qb.setParameter('userLat', userLatitude)
        .setParameter('userLng', userLongitude);
    }

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
    
    // Order by distance if user location is provided, otherwise by name
    if (userLatitude !== undefined && userLongitude !== undefined) {
      qb.orderBy('distance', 'ASC');
    } else {
      qb.orderBy('COALESCE(lt_name_lang.text_content, lt_name_pt.text_content)', 'ASC');
    }
    
    return await qb.getRawMany();
  }

  async findByIdWithLocalizedTexts(locationId: number, language: string = 'pt', userLatitude?: number, userLongitude?: number): Promise<any> {
    const distanceFormula = userLatitude !== undefined && userLongitude !== undefined 
      ? `ROUND(CAST((6371 * acos(cos(radians(${userLatitude})) * cos(radians(l.latitude)) * cos(radians(l.longitude) - radians(${userLongitude})) + sin(radians(${userLatitude})) * sin(radians(l.latitude)))) AS numeric), 2)` 
      : 'NULL';

    const query = `
      SELECT 
        l.location_id as id,
        COALESCE(lt_name_lang.text_content, lt_name_pt.text_content) as name,
        COALESCE(lt_desc_lang.text_content, lt_desc_pt.text_content) as description,
        NULL as location,
        l.image_url as image,
        l.latitude,
        l.longitude,
        l.city_id as "cityId",
        COALESCE(lt_city_lang.text_content, lt_city_pt.text_content) as city,
        c.state as state,
        ${distanceFormula} as distance,
        ARRAY_AGG(DISTINCT COALESCE(lt_cat_lang.text_content, lt_cat_pt.text_content)) FILTER (WHERE lc.category_id IS NOT NULL) as categories,
        COUNT(DISTINCT sl.story_location_id) as "storiesCount"
      FROM locations l
      LEFT JOIN localized_texts lt_name_lang ON l.name_text_ref_id = lt_name_lang.reference_id AND lt_name_lang.language_code = $2
      LEFT JOIN localized_texts lt_name_pt ON l.name_text_ref_id = lt_name_pt.reference_id AND lt_name_pt.language_code = 'pt'
      LEFT JOIN localized_texts lt_desc_lang ON l.description_text_ref_id = lt_desc_lang.reference_id AND lt_desc_lang.language_code = $2
      LEFT JOIN localized_texts lt_desc_pt ON l.description_text_ref_id = lt_desc_pt.reference_id AND lt_desc_pt.language_code = 'pt'
      LEFT JOIN cities c ON l.city_id = c.city_id
      LEFT JOIN localized_texts lt_city_lang ON c.name_text_ref_id = lt_city_lang.reference_id AND lt_city_lang.language_code = $2
      LEFT JOIN localized_texts lt_city_pt ON c.name_text_ref_id = lt_city_pt.reference_id AND lt_city_pt.language_code = 'pt'
      LEFT JOIN location_categories lc ON l.location_id = lc.location_id
      LEFT JOIN categories cat ON lc.category_id = cat.category_id AND cat."deletedAt" IS NULL
      LEFT JOIN localized_texts lt_cat_lang ON cat.name_text_ref_id = lt_cat_lang.reference_id AND lt_cat_lang.language_code = $2
      LEFT JOIN localized_texts lt_cat_pt ON cat.name_text_ref_id = lt_cat_pt.reference_id AND lt_cat_pt.language_code = 'pt'
      LEFT JOIN story_locations sl ON l.location_id = sl.location_id
      WHERE l.location_id = $1 AND l."deletedAt" IS NULL
      GROUP BY l.location_id, lt_name_lang.text_content, lt_name_pt.text_content, lt_desc_lang.text_content, lt_desc_pt.text_content, l.image_url, l.latitude, l.longitude, lt_city_lang.text_content, lt_city_pt.text_content, c.state
    `;

    const results = await this.repository.manager.query(query, [locationId, language]);
    return results[0] || null;
  }
}

// Export singleton instance
export const locationRepository = new LocationRepository();
