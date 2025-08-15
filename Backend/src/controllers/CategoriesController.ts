import { Request, Response } from 'express';
import { BaseController } from '@/core/base/BaseController';
import { Category } from '@/entities/Category';
import { CategoryMapper } from '@/mappers/CategoryMapper';
import { CategoryService } from '@/services/CategoryService';

export class CategoriesController extends BaseController<Category> {
  constructor() {
    super(Category, CategoryMapper);
    // Override the generic service with our custom CategoryService
    this.service = new CategoryService();
  }
}
