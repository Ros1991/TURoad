import { BaseService } from '@/core/base/BaseService';
import { FAQ } from '@/entities/FAQ';
import { faqRepository } from '@/repositories/FAQRepository';

export class FAQService extends BaseService<FAQ> {
  constructor() {
    super(FAQ);
    // Use the singleton instance that has the proper applySearch implementation
    this.repository = faqRepository;
  }

  /**
   * Get all FAQs with localized texts using efficient database JOINs
   * @param language - Language code (falls back to 'pt' if not found)
   * @param search - Optional search term to filter FAQs
   * @returns Array of FAQs with localized question and answer texts
   */
  async getAllWithLocalizedTexts(language: string = 'pt', search?: string): Promise<any[]> {
    return await faqRepository.findAllWithLocalizedTexts(language, search);
  }
}

// Export singleton instance
export const faqService = new FAQService();
