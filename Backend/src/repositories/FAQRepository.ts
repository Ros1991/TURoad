import { BaseRepository } from '@/core/base/BaseRepository';
import { FAQ } from '@/entities/FAQ';
import { SelectQueryBuilder } from 'typeorm';
import { AppDataSource } from '@/config/database';

export class FAQRepository extends BaseRepository<FAQ> {
  constructor() {
    super(FAQ, 'faqId');
  }

  protected override applySearch(qb: SelectQueryBuilder<FAQ>, search: any): void {
    if(search && search.search && search.search.length > 0) {
      console.log(JSON.stringify(search));
      qb.distinct(true)
        .leftJoin('localized_texts', 'lt_question', 'lt_question.reference_id = entity.question_text_ref_id')
        .leftJoin('localized_texts', 'lt_answer', 'lt_answer.reference_id = entity.answer_text_ref_id')
        .andWhere('((lt_question.text_content ILIKE :search AND lt_question.language_code = :language) OR (lt_answer.text_content ILIKE :search AND lt_answer.language_code = :language))', { 
          search: `%${search.search}%`,
          language: 'pt' // Search in Portuguese by default, can be made dynamic later
        });
    }
  }

  /**
   * Get all FAQs with localized texts using database JOINs
   * Falls back to Portuguese if the requested language doesn't exist
   */
  async findAllWithLocalizedTexts(language: string = 'pt', search?: string): Promise<any[]> {
    const qb = AppDataSource
      .createQueryBuilder()
      .select([
        'faq.faq_id as id',
        'COALESCE(lt_question_lang.text_content, lt_question_pt.text_content) as question',
        'COALESCE(lt_answer_lang.text_content, lt_answer_pt.text_content) as answer'
      ])
      .from('faq', 'faq')
      .leftJoin(
        'localized_texts', 
        'lt_question_lang', 
        'lt_question_lang.reference_id = faq.question_text_ref_id AND lt_question_lang.language_code = :language'
      )
      .leftJoin(
        'localized_texts', 
        'lt_question_pt', 
        'lt_question_pt.reference_id = faq.question_text_ref_id AND lt_question_pt.language_code = \'pt\''
      )
      .leftJoin(
        'localized_texts', 
        'lt_answer_lang', 
        'lt_answer_lang.reference_id = faq.answer_text_ref_id AND lt_answer_lang.language_code = :language'
      )
      .leftJoin(
        'localized_texts', 
        'lt_answer_pt', 
        'lt_answer_pt.reference_id = faq.answer_text_ref_id AND lt_answer_pt.language_code = \'pt\''
      )
      .where('faq.deletedAt IS NULL')
      .setParameter('language', language);

    // Add search filter if provided
    if (search && search.trim()) {
      qb.andWhere(
        '(COALESCE(lt_question_lang.text_content, lt_question_pt.text_content) ILIKE :search OR COALESCE(lt_answer_lang.text_content, lt_answer_pt.text_content) ILIKE :search)',
        { search: `%${search.trim()}%` }
      );
    }
    return await qb.getRawMany();
  }
}

// Export singleton instance
export const faqRepository = new FAQRepository();
