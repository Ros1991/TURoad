import { api, PaginatedRequest, PaginatedResponse } from './api';

export interface LocalizedText {
  language: string;
  text: string;
}

export interface Category {
  categoryId: number;
  nameTextRefId: string;
  iconUrl?: string;
  color?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  nameTranslations?: LocalizedText[];
}

export interface CreateCategoryDto {
  nameTextRefId: string;
  iconUrl?: string;
  color?: string;
  isActive?: boolean;
  nameTranslations?: LocalizedText[];
}

export interface UpdateCategoryDto {
  nameTextRefId?: string;
  iconUrl?: string;
  color?: string;
  isActive?: boolean;
  nameTranslations?: LocalizedText[];
}

class CategoriesService {
  private basePath = '/categories';

  /**
   * Get paginated list of categories
   */
  async getCategories(params?: PaginatedRequest): Promise<PaginatedResponse<Category>> {
    return api.get<PaginatedResponse<Category>>(this.basePath, { params });
  }

  /**
   * Get all active categories
   */
  async getActiveCategories(): Promise<Category[]> {
    return api.get<Category[]>(`${this.basePath}/active`);
  }

  /**
   * Get category by ID
   */
  async getCategoryById(id: number): Promise<Category> {
    return api.get<Category>(`${this.basePath}/${id}`);
  }

  /**
   * Create new category
   */
  async createCategory(data: CreateCategoryDto): Promise<Category> {
    return api.post<Category>(this.basePath, data);
  }

  /**
   * Update category
   */
  async updateCategory(id: number, data: UpdateCategoryDto): Promise<Category> {
    return api.put<Category>(`${this.basePath}/${id}`, data);
  }

  /**
   * Delete category
   */
  async deleteCategory(id: number): Promise<void> {
    return api.delete<void>(`${this.basePath}/${id}`);
  }

  /**
   * Toggle category status
   */
  async toggleCategoryStatus(id: number): Promise<Category> {
    return api.patch<Category>(`${this.basePath}/${id}/toggle-status`);
  }

  /**
   * Upload category icon
   */
  async uploadIcon(id: number, file: File, onProgress?: (progress: number) => void): Promise<Category> {
    return api.upload<Category>(`${this.basePath}/${id}/icon`, file, onProgress);
  }

  /**
   * Get categories with routes count
   */
  async getCategoriesWithStats(): Promise<any[]> {
    return api.get<any[]>(`${this.basePath}/stats`);
  }
}

export const categoriesService = new CategoriesService();
export default categoriesService;
