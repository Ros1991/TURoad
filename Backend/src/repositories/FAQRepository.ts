import { BaseRepository } from '@/core/base/BaseRepository';
import { FAQ } from '@/entities/FAQ';
import { SelectQueryBuilder } from 'typeorm';

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
}

// Export singleton instance
export const faqRepository = new FAQRepository();
