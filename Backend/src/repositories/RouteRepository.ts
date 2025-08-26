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
}

// Export singleton instance
export const routeRepository = new RouteRepository();
