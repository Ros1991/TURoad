import { BaseRepository } from '@/core/base/BaseRepository';
import { FAQ } from '@/entities/FAQ';

export class FAQRepository extends BaseRepository<FAQ> {
  constructor() {
    super(FAQ, 'faqId');
  }
}

// Export singleton instance
export const faqRepository = new FAQRepository();
