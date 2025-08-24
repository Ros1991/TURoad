import { BaseService } from '@/core/base/BaseService';
import { Category } from '@/entities/Category';
import { categoryRepository } from '@/repositories/CategoryRepository';
import { SelectQueryBuilder } from 'typeorm';

export class CategoryService extends BaseService<Category> {
  constructor() {
    super(Category);
    // Use the singleton instance that has the proper applySearch implementation
    this.repository = categoryRepository;
  }

  async getAllWithLocalizedTexts(language: string = 'pt', search?: string): Promise<any[]> {
    return await categoryRepository.findAllWithLocalizedTexts(language, search);
  }
}
