import { BaseService } from '@/core/base/BaseService';
import { FAQ } from '@/entities/FAQ';
import { faqRepository } from '@/repositories/FAQRepository';

export class FAQService extends BaseService<FAQ> {
  constructor() {
    super(FAQ);
    // Use the singleton instance that has the proper applySearch implementation
    this.repository = faqRepository;
  }
}
