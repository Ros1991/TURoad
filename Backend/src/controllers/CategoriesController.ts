import { Request, Response } from 'express';
import { BaseController } from '@/core/base/BaseController';
import { Category } from '@/entities/Category';

export class CategoriesController extends BaseController<Category> {
  constructor() {
    super(Category);
  }
}
