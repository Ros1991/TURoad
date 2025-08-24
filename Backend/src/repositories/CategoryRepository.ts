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
  async findAllWithLocalizedTexts(language: string = 'pt', search?: string, showOnlyPrimary?: boolean): Promise<any[]> {
    const qb = AppDataSource
      .createQueryBuilder()
      .select([
        'c.category_id as id',
        'COALESCE(lt_name_lang.text_content, lt_name_pt.text_content) as name',
        'COALESCE(lt_desc_lang.text_content, lt_desc_pt.text_content) as description',
        'c.image_url as image',
        'COUNT(DISTINCT rc.route_id) as "routeCount"'
      ])
      .from('categories', 'c')
      .leftJoin('localized_texts', 'lt_name_lang', 'lt_name_lang.reference_id = c.name_text_ref_id AND lt_name_lang.language_code = :language')
      .leftJoin('localized_texts', 'lt_name_pt', 'lt_name_pt.reference_id = c.name_text_ref_id AND lt_name_pt.language_code = \'pt\'')
      .leftJoin('localized_texts', 'lt_desc_lang', 'lt_desc_lang.reference_id = c.description_text_ref_id AND lt_desc_lang.language_code = :language')
      .leftJoin('localized_texts', 'lt_desc_pt', 'lt_desc_pt.reference_id = c.description_text_ref_id AND lt_desc_pt.language_code = \'pt\'')
      .leftJoin('route_categories', 'rc', 'rc.category_id = c.category_id')
      .where('c."deletedAt" IS NULL')
      .groupBy('c.category_id, lt_name_lang.text_content, lt_name_pt.text_content, lt_desc_lang.text_content, lt_desc_pt.text_content, c.image_url')
      .setParameter('language', language);

    // Add search filter if provided
    if (search && search.trim()) {
      qb.andWhere(
        '(COALESCE(lt_name_lang.text_content, lt_name_pt.text_content) ILIKE :search OR COALESCE(lt_desc_lang.text_content, lt_desc_pt.text_content) ILIKE :search)',
        { search: `%${search.trim()}%` }
      );
    }
    
    return await qb.getRawMany();
  }
}

// Export singleton instance
export const categoryRepository = new CategoryRepository();
