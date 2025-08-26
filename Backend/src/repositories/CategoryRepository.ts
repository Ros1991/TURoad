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

  /**
   * Get categories with their routes (max 2 routes per category) and total route count
   */
  async findCategoriesWithRoutes(language: string = 'pt', userLatitude?: number, userLongitude?: number): Promise<any[]> {
    const query = `
      WITH route_metrics AS (
        SELECT 
          r.route_id,
          COALESCE(SUM(rc_city.distance_km), 0) as total_distance_km,
          COALESCE(SUM(rc_city.travel_time_minutes), 0) as total_time_minutes,
          COUNT(DISTINCT rc_city.city_id) as stops_count,
          (COUNT(DISTINCT sr.story_route_id) + COUNT(DISTINCT sc.story_city_id)) as stories_count
        FROM routes r
        LEFT JOIN route_cities rc_city ON rc_city.route_id = r.route_id
        LEFT JOIN story_routes sr ON sr.route_id = r.route_id
        LEFT JOIN story_cities sc ON sc.city_id = rc_city.city_id
        WHERE r."deletedAt" IS NULL
        GROUP BY r.route_id
      ),
      category_total_routes AS (
        SELECT 
          c.category_id,
          COUNT(DISTINCT r.route_id) as total_routes
        FROM categories c
        JOIN route_categories rc ON rc.category_id = c.category_id
        JOIN routes r ON r.route_id = rc.route_id
        WHERE c."deletedAt" IS NULL AND r."deletedAt" IS NULL
        GROUP BY c.category_id
      ),
      limited_routes AS (
        SELECT 
          c.category_id,
          r.route_id,
          COALESCE(lt_route_title_lang.text_content, lt_route_title_pt.text_content) as route_title,
          COALESCE(lt_route_desc_lang.text_content, lt_route_desc_pt.text_content) as route_description,
          r.image_url as route_image,
          rm.total_distance_km,
          rm.total_time_minutes,
          rm.stops_count,
          rm.stories_count,
          ROW_NUMBER() OVER (
            PARTITION BY c.category_id 
            ORDER BY 
              CASE 
                WHEN $2::numeric IS NOT NULL AND $3::numeric IS NOT NULL THEN
                  (6371 * acos(cos(radians($2)) * cos(radians(start_city.latitude)) * 
                   cos(radians(start_city.longitude) - radians($3)) + 
                   sin(radians($2)) * sin(radians(start_city.latitude))))
                ELSE r.route_id
              END
          ) as rn,
          CASE 
            WHEN $2::numeric IS NOT NULL AND $3::numeric IS NOT NULL THEN
              (6371 * acos(cos(radians($2)) * cos(radians(start_city.latitude)) * 
               cos(radians(start_city.longitude) - radians($3)) + 
               sin(radians($2)) * sin(radians(start_city.latitude))))
            ELSE r.route_id
          END as global_order
        FROM categories c
        JOIN route_categories rc ON rc.category_id = c.category_id
        JOIN routes r ON r.route_id = rc.route_id
        LEFT JOIN route_metrics rm ON rm.route_id = r.route_id
        LEFT JOIN route_cities rc_start ON rc_start.route_id = r.route_id AND rc_start."order" = 0
        LEFT JOIN cities start_city ON start_city.city_id = rc_start.city_id
        LEFT JOIN localized_texts lt_route_title_lang ON lt_route_title_lang.reference_id = r.title_text_ref_id AND lt_route_title_lang.language_code = $1
        LEFT JOIN localized_texts lt_route_title_pt ON lt_route_title_pt.reference_id = r.title_text_ref_id AND lt_route_title_pt.language_code = 'pt'
        LEFT JOIN localized_texts lt_route_desc_lang ON lt_route_desc_lang.reference_id = r.description_text_ref_id AND lt_route_desc_lang.language_code = $1
        LEFT JOIN localized_texts lt_route_desc_pt ON lt_route_desc_pt.reference_id = r.description_text_ref_id AND lt_route_desc_pt.language_code = 'pt'
        WHERE c."deletedAt" IS NULL AND r."deletedAt" IS NULL
      ),
      category_routes AS (
        SELECT 
          c.category_id,
          c.name_text_ref_id,
          c.description_text_ref_id,
          c.image_url,
          ctr.total_routes,
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', lr.route_id::text,
              'title', lr.route_title,
              'description', lr.route_description,
              'image', lr.route_image,
              'totalDistance', COALESCE(lr.total_distance_km, 0)::text || 'km',
              'totalTime', COALESCE(lr.total_time_minutes, 0)::text || 'min',
              'stops', COALESCE(lr.stops_count, 0),
              'stories', COALESCE(lr.stories_count, 0),
              'categories', ARRAY[]::text[]
            ) ORDER BY lr.global_order
          ) as routes
        FROM categories c
        JOIN category_total_routes ctr ON ctr.category_id = c.category_id
        LEFT JOIN limited_routes lr ON lr.category_id = c.category_id AND lr.rn <= 2
        WHERE c."deletedAt" IS NULL
        GROUP BY c.category_id, c.name_text_ref_id, c.description_text_ref_id, c.image_url, ctr.total_routes
      )
      SELECT 
        cr.category_id::text as id,
        COALESCE(lt_name_lang.text_content, lt_name_pt.text_content) as name,
        COALESCE(lt_desc_lang.text_content, lt_desc_pt.text_content) as description,
        cr.image_url as image,
        cr.total_routes as "totalRoutes",
        cr.routes
      FROM category_routes cr
      LEFT JOIN localized_texts lt_name_lang ON lt_name_lang.reference_id = cr.name_text_ref_id AND lt_name_lang.language_code = $1
      LEFT JOIN localized_texts lt_name_pt ON lt_name_pt.reference_id = cr.name_text_ref_id AND lt_name_pt.language_code = 'pt'
      LEFT JOIN localized_texts lt_desc_lang ON lt_desc_lang.reference_id = cr.description_text_ref_id AND lt_desc_lang.language_code = $1
      LEFT JOIN localized_texts lt_desc_pt ON lt_desc_pt.reference_id = cr.description_text_ref_id AND lt_desc_pt.language_code = 'pt'
      WHERE cr.total_routes > 0
      ORDER BY cr.total_routes DESC
    `;
    
    const result = await AppDataSource.query(query, [language, userLatitude, userLongitude]);
    return result;
  }
}

// Export singleton instance
export const categoryRepository = new CategoryRepository();
