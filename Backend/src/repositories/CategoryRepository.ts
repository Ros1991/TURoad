import { BaseRepository } from '@/core/base/BaseRepository';
import { Category } from '@/entities/Category';

export class CategoryRepository extends BaseRepository<Category> {
  constructor() {
    super(Category, 'categoryId');
  }
}

// Export singleton instance
export const categoryRepository = new CategoryRepository();
