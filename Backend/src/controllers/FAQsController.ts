import { Request, Response } from 'express';
import { BaseController } from '@/core/base/BaseController';
import { FAQ } from '@/entities/FAQ';

export class FAQsController extends BaseController<FAQ> {
  constructor() {
    super(FAQ);
  }
}
