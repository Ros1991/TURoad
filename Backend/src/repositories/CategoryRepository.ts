import { BaseRepository } from '@/core/base/BaseRepository';
import { Category } from '@/entities/Category';
import { SelectQueryBuilder } from 'typeorm';
import { AppDataSource } from '@/config/database';

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

  /**
   * Get all categories with localized texts using database JOINs
   * Falls back to Portuguese if the requested language doesn't exist
   */
  async findAllWithLocalizedTexts(language: string = 'pt', search?: string, showOnlyPrimary?: boolean, cityId?: number): Promise<any[]> {
    const qb = AppDataSource
      .createQueryBuilder()
      .select([
        'c.category_id as id',
        'COALESCE(lt_name_lang.text_content, lt_name_pt.text_content) as name',
        'COALESCE(lt_desc_lang.text_content, lt_desc_pt.text_content) as description',
        'c.image_url as image',
        'total_usage.total_occurrences as "totalUsage"',
        'COALESCE(route_count.route_count, 0) as "routeCount"'
      ])
      .from('categories', 'c')
      .leftJoin('localized_texts', 'lt_name_lang', 'lt_name_lang.reference_id = c.name_text_ref_id AND lt_name_lang.language_code = :language')
      .leftJoin('localized_texts', 'lt_name_pt', 'lt_name_pt.reference_id = c.name_text_ref_id AND lt_name_pt.language_code = \'pt\'')
      .leftJoin('localized_texts', 'lt_desc_lang', 'lt_desc_lang.reference_id = c.description_text_ref_id AND lt_desc_lang.language_code = :language')
      .leftJoin('localized_texts', 'lt_desc_pt', 'lt_desc_pt.reference_id = c.description_text_ref_id AND lt_desc_pt.language_code = \'pt\'')
      .leftJoin(
        `(
          SELECT 
            category_id,
            COUNT(category_id) AS total_occurrences
          FROM (
            SELECT category_id FROM city_categories
            UNION ALL
            SELECT category_id FROM route_categories
            UNION ALL
            SELECT category_id FROM event_categories
            UNION ALL
            SELECT category_id FROM location_categories
          ) AS all_categories
          GROUP BY category_id
        )`,
        'total_usage',
        'total_usage.category_id = c.category_id'
      )
      .leftJoin(
        `(
          SELECT 
            rc.category_id,
            COUNT(DISTINCT r.route_id) AS route_count
          FROM route_categories rc
          JOIN routes r ON r.route_id = rc.route_id
          WHERE r."deletedAt" IS NULL
          GROUP BY rc.category_id
        )`,
        'route_count',
        'route_count.category_id = c.category_id'
      )
      .where('c."deletedAt" IS NULL')
      .setParameter('language', language);

    // Filter by city if provided
    if (cityId) {
      qb.andWhere(`c.category_id IN (
        SELECT DISTINCT category_id FROM (
          -- Categories from city_categories
          SELECT cc.category_id 
          FROM city_categories cc 
          WHERE cc.city_id = :cityId
          
          UNION
          
          -- Categories from events in the city
          SELECT ec.category_id 
          FROM event_categories ec
          JOIN events e ON e.event_id = ec.event_id
          WHERE e.city_id = :cityId AND e."deletedAt" IS NULL
          
          UNION
          
          -- Categories from locations in the city
          SELECT lc.category_id 
          FROM location_categories lc
          JOIN locations l ON l.location_id = lc.location_id
          WHERE l.city_id = :cityId AND l."deletedAt" IS NULL
          
          UNION
          
          -- Categories from routes that include the city
          SELECT rc.category_id 
          FROM route_categories rc
          JOIN routes r ON r.route_id = rc.route_id
          JOIN route_cities rcity ON rcity.route_id = r.route_id
          WHERE rcity.city_id = :cityId AND r."deletedAt" IS NULL
        ) AS city_categories
      )`);
      qb.setParameter('cityId', cityId);
    }

    // Add search filter if provided
    if (search && search.trim()) {
      qb.andWhere(
        '(COALESCE(lt_name_lang.text_content, lt_name_pt.text_content) ILIKE :search OR COALESCE(lt_desc_lang.text_content, lt_desc_pt.text_content) ILIKE :search)',
        { search: `%${search.trim()}%` }
      );
    }

    // Order by total usage (most used first), treating NULL as 0
    qb.orderBy('COALESCE(total_usage.total_occurrences, 0)', 'DESC');
    
    return await qb.getRawMany();
  }
}

// Export singleton instance
export const categoryRepository = new CategoryRepository();
