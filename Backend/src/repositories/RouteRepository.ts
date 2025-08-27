import { BaseRepository } from '@/core/base/BaseRepository';
import { Route } from '@/entities/Route';
import { SelectQueryBuilder } from 'typeorm';
import { AppDataSource } from '@/config/database';

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

  /**
   * Get all routes with localized texts using database JOINs
   * Falls back to Portuguese if the requested language doesn't exist
   */
  async findAllWithLocalizedTexts(language: string = 'pt', categoryId?: string, search?: string, cityId?: number, userLatitude?: number, userLongitude?: number): Promise<any[]> {
    const qb = AppDataSource
      .createQueryBuilder()
      .select([
        'r.route_id as id',
        'COALESCE(lt_title_lang.text_content, lt_title_pt.text_content) as title',
        'COALESCE(lt_desc_lang.text_content, lt_desc_pt.text_content) as description',
        'r.image_url as image',
        'COUNT(DISTINCT rc_city.city_id) as stops',
        'SUM(DISTINCT rc_city.distance_km) as totalDistance',
        'SUM(DISTINCT rc_city.travel_time_minutes) as totalTime',
        '(COUNT(DISTINCT sr.story_route_id) + COUNT(DISTINCT sc.story_city_id)) as stories',
        'ARRAY_AGG(DISTINCT COALESCE(lt_cat_lang.text_content, lt_cat_pt.text_content)) FILTER (WHERE rc_cat.category_id IS NOT NULL) as categories'
      ])
      .from('routes', 'r')
      .leftJoin('localized_texts', 'lt_title_lang', 'lt_title_lang.reference_id = r.title_text_ref_id AND lt_title_lang.language_code = :language')
      .leftJoin('localized_texts', 'lt_title_pt', 'lt_title_pt.reference_id = r.title_text_ref_id AND lt_title_pt.language_code = \'pt\'')
      .leftJoin('localized_texts', 'lt_desc_lang', 'lt_desc_lang.reference_id = r.description_text_ref_id AND lt_desc_lang.language_code = :language')
      .leftJoin('localized_texts', 'lt_desc_pt', 'lt_desc_pt.reference_id = r.description_text_ref_id AND lt_desc_pt.language_code = \'pt\'')
      .leftJoin('route_cities', 'rc_city', 'rc_city.route_id = r.route_id')
      .leftJoin('story_routes', 'sr', 'sr.route_id = r.route_id')
      .leftJoin('story_cities', 'sc', 'sc.city_id = rc_city.city_id')
      .leftJoin('route_categories', 'rc_cat', 'rc_cat.route_id = r.route_id')
      .leftJoin('categories', 'cat', 'cat.category_id = rc_cat.category_id AND cat."deletedAt" IS NULL')
      .leftJoin('localized_texts', 'lt_cat_lang', 'lt_cat_lang.reference_id = cat.name_text_ref_id AND lt_cat_lang.language_code = :language')
      .leftJoin('localized_texts', 'lt_cat_pt', 'lt_cat_pt.reference_id = cat.name_text_ref_id AND lt_cat_pt.language_code = \'pt\'')
      .leftJoin('cities', 'start_city', 'start_city.city_id = rc_city.city_id AND rc_city."order" = 0')
      .where('r."deletedAt" IS NULL')
      .groupBy('r.route_id, lt_title_lang.text_content, lt_title_pt.text_content, lt_desc_lang.text_content, lt_desc_pt.text_content, r.image_url, start_city.latitude, start_city.longitude')
      .setParameter('language', language);

    // Filter by category if provided
    if (categoryId && categoryId.trim()) {
      const categoryIdNum = parseInt(categoryId);
      if (!isNaN(categoryIdNum)) {
        qb.andWhere('EXISTS (SELECT 1 FROM route_categories WHERE route_id = r.route_id AND category_id = :categoryId)', 
          { categoryId: categoryIdNum });
      }
    }

    // Add search filter if provided
    if (search && search.trim()) {
      qb.andWhere(
        '(COALESCE(lt_title_lang.text_content, lt_title_pt.text_content) ILIKE :search OR COALESCE(lt_desc_lang.text_content, lt_desc_pt.text_content) ILIKE :search)',
        { search: `%${search.trim()}%` }
      );
    }

    // Filter by city if provided
    if (cityId) {
      qb.andWhere('EXISTS (SELECT 1 FROM route_cities WHERE route_id = r.route_id AND city_id = :cityId)', 
        { cityId });
    }

    // Add ordering by distance if user location is provided, otherwise by route ID
    if (userLatitude !== undefined && userLongitude !== undefined) {
      qb.orderBy(`(6371 * acos(cos(radians(:userLatitude)) * cos(radians(start_city.latitude)) * 
                   cos(radians(start_city.longitude) - radians(:userLongitude)) + 
                   sin(radians(:userLatitude)) * sin(radians(start_city.latitude))))`, 'ASC')
        .addOrderBy('r.route_id', 'ASC')
        .setParameter('userLatitude', userLatitude)
        .setParameter('userLongitude', userLongitude);
    } else {
      qb.orderBy('r.route_id', 'ASC');
    }
    
    return await qb.getRawMany();
  }

  async findByIdWithLocalizedTexts(routeId: number, language: string = 'pt'): Promise<any> {
    const query = `
      SELECT 
        r.route_id as id,
        COALESCE(lt_name_lang.text_content, lt_name_pt.text_content) as name,
        COALESCE(lt_desc_lang.text_content, lt_desc_pt.text_content) as description,
        COALESCE(lt_what_lang.text_content, lt_what_pt.text_content) as what_to_observe,
        r.image_url,
        COALESCE(SUM(rc.distance_km), 0) as total_distance,
        COALESCE(SUM(rc.travel_time_minutes), 0) as estimated_duration,
        array_agg(DISTINCT jsonb_build_object(
          'id', cat.category_id,
          'name', COALESCE(lt_cat_lang.text_content, lt_cat_pt.text_content)
        )) FILTER (WHERE cat.category_id IS NOT NULL) as categories,
        array_agg(jsonb_build_object(
          'id', c.city_id,
          'name', COALESCE(lt_city_lang.text_content, lt_city_pt.text_content) || ', ' || c.state,
          'state', c.state,
          'description', COALESCE(lt_city_desc_lang.text_content, lt_city_desc_pt.text_content),
          'what_to_observe', COALESCE(lt_city_what_lang.text_content, lt_city_what_pt.text_content),
          'image_url', c.image_url,
          'latitude', c.latitude,
          'longitude', c.longitude,
          'order', rc.order,
          'stories', city_stories.stories
        ) ORDER BY rc.order) FILTER (WHERE c.city_id IS NOT NULL) as cities,
        COUNT(DISTINCT sr.story_route_id) as story_count
      FROM routes r
      LEFT JOIN localized_texts lt_name_lang ON r.title_text_ref_id = lt_name_lang.reference_id AND lt_name_lang.language_code = $2
      LEFT JOIN localized_texts lt_name_pt ON r.title_text_ref_id = lt_name_pt.reference_id AND lt_name_pt.language_code = 'pt'
      LEFT JOIN localized_texts lt_desc_lang ON r.description_text_ref_id = lt_desc_lang.reference_id AND lt_desc_lang.language_code = $2
      LEFT JOIN localized_texts lt_desc_pt ON r.description_text_ref_id = lt_desc_pt.reference_id AND lt_desc_pt.language_code = 'pt'
      LEFT JOIN localized_texts lt_what_lang ON r.what_to_observe_text_ref_id = lt_what_lang.reference_id AND lt_what_lang.language_code = $2
      LEFT JOIN localized_texts lt_what_pt ON r.what_to_observe_text_ref_id = lt_what_pt.reference_id AND lt_what_pt.language_code = 'pt'
      LEFT JOIN route_categories rc_cat ON r.route_id = rc_cat.route_id
      LEFT JOIN categories cat ON rc_cat.category_id = cat.category_id AND cat."deletedAt" IS NULL
      LEFT JOIN localized_texts lt_cat_lang ON cat.name_text_ref_id = lt_cat_lang.reference_id AND lt_cat_lang.language_code = $2
      LEFT JOIN localized_texts lt_cat_pt ON cat.name_text_ref_id = lt_cat_pt.reference_id AND lt_cat_pt.language_code = 'pt'
      LEFT JOIN route_cities rc ON r.route_id = rc.route_id
      LEFT JOIN cities c ON rc.city_id = c.city_id
      LEFT JOIN localized_texts lt_city_lang ON c.name_text_ref_id = lt_city_lang.reference_id AND lt_city_lang.language_code = $2
      LEFT JOIN localized_texts lt_city_pt ON c.name_text_ref_id = lt_city_pt.reference_id AND lt_city_pt.language_code = 'pt'
      LEFT JOIN localized_texts lt_city_desc_lang ON c.description_text_ref_id = lt_city_desc_lang.reference_id AND lt_city_desc_lang.language_code = $2
      LEFT JOIN localized_texts lt_city_desc_pt ON c.description_text_ref_id = lt_city_desc_pt.reference_id AND lt_city_desc_pt.language_code = 'pt'
      LEFT JOIN localized_texts lt_city_what_lang ON c.what_to_observe_text_ref_id = lt_city_what_lang.reference_id AND lt_city_what_lang.language_code = $2
      LEFT JOIN localized_texts lt_city_what_pt ON c.what_to_observe_text_ref_id = lt_city_what_pt.reference_id AND lt_city_what_pt.language_code = 'pt'
      LEFT JOIN LATERAL (
        SELECT array_agg(jsonb_build_object(
          'id', sc.story_city_id,
          'title', COALESCE(lt_story_title_lang.text_content, lt_story_title_pt.text_content),
          'description', COALESCE(lt_story_desc_lang.text_content, lt_story_desc_pt.text_content),
          'durationSeconds', sc.duration_seconds,
          'audioUrl', COALESCE(lt_story_audio_lang.text_content, lt_story_audio_pt.text_content)
        ) ORDER BY sc.story_city_id) as stories
        FROM story_cities sc
        LEFT JOIN localized_texts lt_story_title_lang ON sc.name_text_ref_id = lt_story_title_lang.reference_id AND lt_story_title_lang.language_code = $2
        LEFT JOIN localized_texts lt_story_title_pt ON sc.name_text_ref_id = lt_story_title_pt.reference_id AND lt_story_title_pt.language_code = 'pt'
        LEFT JOIN localized_texts lt_story_desc_lang ON sc.description_text_ref_id = lt_story_desc_lang.reference_id AND lt_story_desc_lang.language_code = $2
        LEFT JOIN localized_texts lt_story_desc_pt ON sc.description_text_ref_id = lt_story_desc_pt.reference_id AND lt_story_desc_pt.language_code = 'pt'
        LEFT JOIN localized_texts lt_story_audio_lang ON sc.audio_url_ref_id = lt_story_audio_lang.reference_id AND lt_story_audio_lang.language_code = $2
        LEFT JOIN localized_texts lt_story_audio_pt ON sc.audio_url_ref_id = lt_story_audio_pt.reference_id AND lt_story_audio_pt.language_code = 'pt'
        WHERE sc.city_id = c.city_id
      ) city_stories ON true
      LEFT JOIN story_routes sr ON r.route_id = sr.route_id
      WHERE r.route_id = $1 AND r."deletedAt" IS NULL
      GROUP BY r.route_id, lt_name_lang.text_content, lt_name_pt.text_content, lt_desc_lang.text_content, lt_desc_pt.text_content, 
               lt_what_lang.text_content, lt_what_pt.text_content, r.image_url
    `;

    const results = await this.repository.manager.query(query, [routeId, language]);
    return results[0] || null;
  }
}

// Export singleton instance
export const routeRepository = new RouteRepository();
