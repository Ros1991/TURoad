import { api, PaginatedRequest, PaginatedResponse } from './api';

export interface LocalizedText {
  language: string;
  text: string;
}

export interface FAQ {
  faqId: number;
  questionTextRefId: number;
  answerTextRefId: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
  isDeleted: boolean;
  // Localized fields
  question?: string;
  answer?: string;
  // Legacy support for translations
  questionTranslations?: LocalizedText[];
  answerTranslations?: LocalizedText[];
}

export interface CreateFAQDto {
  questionTextRefId: number;
  answerTextRefId: number;
}

export interface UpdateFAQDto {
  questionTextRefId?: number;
  answerTextRefId?: number;
}

class FAQsService {
  private basePath = '/faqs';

  /**
   * Get paginated list of FAQs
   */
  async getFAQs(params?: PaginatedRequest): Promise<PaginatedResponse<FAQ>> {
    return api.get<PaginatedResponse<FAQ>>(this.basePath, { params });
  }

  /**
   * Get all active FAQs
   */
  async getActiveFAQs(): Promise<FAQ[]> {
    return api.get<FAQ[]>(`${this.basePath}/active`);
  }

  /**
   * Get FAQ by ID
   */
  async getFAQById(id: number): Promise<FAQ> {
    return api.get<FAQ>(`${this.basePath}/${id}`);
  }

  /**
   * Create new FAQ
   */
  async createFAQ(data: CreateFAQDto): Promise<FAQ> {
    return api.post<FAQ>(this.basePath, data);
  }

  /**
   * Update FAQ
   */
  async updateFAQ(id: number, data: UpdateFAQDto): Promise<FAQ> {
    return api.put<FAQ>(`${this.basePath}/${id}`, data);
  }

  /**
   * Delete FAQ
   */
  async deleteFAQ(id: number): Promise<void> {
    return api.delete<void>(`${this.basePath}/${id}`);
  }

  /**
   * Toggle FAQ status
   */
  async toggleFAQStatus(id: number): Promise<FAQ> {
    return api.patch<FAQ>(`${this.basePath}/${id}/toggle-status`);
  }

  /**
   * Get FAQs with stats
   */
  async getFAQsWithStats(): Promise<any[]> {
    return api.get<any[]>(`${this.basePath}/stats`);
  }
}

export const faqsService = new FAQsService();
export default faqsService;
