import { BaseService } from '@/core/base/BaseService';
import { Category } from '@/entities/Category';

export class CategoryService extends BaseService<Category> {
  constructor() {
    super(Category);
  }
}
