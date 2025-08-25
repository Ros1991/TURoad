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
  async findAllWithLocalizedTexts(language: string = 'pt', categoryId?: string, search?: string, cityId?: number): Promise<any[]> {
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
        'COUNT(DISTINCT sr.story_route_id) as stories',
        'ARRAY_AGG(DISTINCT rc_cat.category_id) FILTER (WHERE rc_cat.category_id IS NOT NULL) as categories'
      ])
      .from('routes', 'r')
      .leftJoin('localized_texts', 'lt_title_lang', 'lt_title_lang.reference_id = r.title_text_ref_id AND lt_title_lang.language_code = :language')
      .leftJoin('localized_texts', 'lt_title_pt', 'lt_title_pt.reference_id = r.title_text_ref_id AND lt_title_pt.language_code = \'pt\'')
      .leftJoin('localized_texts', 'lt_desc_lang', 'lt_desc_lang.reference_id = r.description_text_ref_id AND lt_desc_lang.language_code = :language')
      .leftJoin('localized_texts', 'lt_desc_pt', 'lt_desc_pt.reference_id = r.description_text_ref_id AND lt_desc_pt.language_code = \'pt\'')
      .leftJoin('route_cities', 'rc_city', 'rc_city.route_id = r.route_id')
      .leftJoin('story_routes', 'sr', 'sr.route_id = r.route_id')
      .leftJoin('route_categories', 'rc_cat', 'rc_cat.route_id = r.route_id')
      .where('r."deletedAt" IS NULL')
      .groupBy('r.route_id, lt_title_lang.text_content, lt_title_pt.text_content, lt_desc_lang.text_content, lt_desc_pt.text_content, r.image_url')
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
    
    return await qb.getRawMany();
  }
}

// Export singleton instance
export const routeRepository = new RouteRepository();
