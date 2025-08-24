import { apiService } from './ApiService';

export interface FAQ {
  id: number;
  question: string;
  answer: string;
}

class FAQService {
  /**
   * Get all FAQs
   */
  async getFAQs(): Promise<FAQ[]> {
    try {
      const response = await apiService.get<FAQ[]>('/api/public/faqs');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      throw error;
    }
  }

  /**
   * Search FAQs by query
   */
  async searchFAQs(query: string): Promise<FAQ[]> {
    try {
      const response = await apiService.get<FAQ[]>('/api/public/faqs', {
        params: { search: query }
      });
      return response.data || [];
    } catch (error) {
      console.error('Error searching FAQs:', error);
      throw error;
    }
  }
}

export default new FAQService();
