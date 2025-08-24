import { BaseRepository } from '@/core/base/BaseRepository';
import { City } from '@/entities/City';
import { SelectQueryBuilder } from 'typeorm';
import { AppDataSource } from '@/config/database';

export class CityRepository extends BaseRepository<City> {
  constructor() {
    super(City, 'cityId');
  }

  protected override applySearch(qb: SelectQueryBuilder<City>, search: any): void {
    if(search && search.search && search.search.length > 0) {
      qb.distinct(true)
        .leftJoin('localized_texts', 'lt', 'lt.reference_id = entity.name_text_ref_id OR lt.reference_id = entity.description_text_ref_id')
        .andWhere('(lt.text_content ILIKE :search AND lt.language_code = :language)', { 
          search: `%${search.search}%`,
          language: 'pt'
        });
    }
  }

  /**
   * Get all cities with localized texts using database JOINs
   * Falls back to Portuguese if the requested language doesn't exist
   */
  async findAllWithLocalizedTexts(language: string = 'pt', search?: string): Promise<any[]> {
    const qb = AppDataSource
      .createQueryBuilder()
      .select([
        'c.city_id as id',
        'COALESCE(lt_name_lang.text_content, lt_name_pt.text_content) as name',
        'COALESCE(lt_desc_lang.text_content, lt_desc_pt.text_content) as description',
        'c.state as state',
        'c.image_url as image',
        'c.latitude as latitude',
        'c.longitude as longitude',
        'COUNT(DISTINCT sc.story_city_id) as stories',
        'COUNT(DISTINCT rc.route_id) as routes'
      ])
      .from('cities', 'c')
      .leftJoin('localized_texts', 'lt_name_lang', 'lt_name_lang.reference_id = c.name_text_ref_id AND lt_name_lang.language_code = :language')
      .leftJoin('localized_texts', 'lt_name_pt', 'lt_name_pt.reference_id = c.name_text_ref_id AND lt_name_pt.language_code = \'pt\'')
      .leftJoin('localized_texts', 'lt_desc_lang', 'lt_desc_lang.reference_id = c.description_text_ref_id AND lt_desc_lang.language_code = :language')
      .leftJoin('localized_texts', 'lt_desc_pt', 'lt_desc_pt.reference_id = c.description_text_ref_id AND lt_desc_pt.language_code = \'pt\'')
      .leftJoin('story_cities', 'sc', 'sc.city_id = c.city_id')
      .leftJoin('route_cities', 'rc', 'rc.city_id = c.city_id')
      .where('c."deletedAt" IS NULL')
      .groupBy('c.city_id, lt_name_lang.text_content, lt_name_pt.text_content, lt_desc_lang.text_content, lt_desc_pt.text_content, c.state, c.image_url, c.latitude, c.longitude')
      .setParameter('language', language);

    // Add search filter if provided
    if (search && search.trim()) {
      qb.andWhere(
        '(COALESCE(lt_name_lang.text_content, lt_name_pt.text_content) ILIKE :search OR COALESCE(lt_desc_lang.text_content, lt_desc_pt.text_content) ILIKE :search OR c.state ILIKE :search)',
        { search: `%${search.trim()}%` }
      );
    }
    
    return await qb.getRawMany();
  }
}

// Export singleton instance
export const cityRepository = new CityRepository();
