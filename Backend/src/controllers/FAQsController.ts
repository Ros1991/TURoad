import { Request, Response } from 'express';
import { BaseController } from '@/core/base/BaseController';
import { FAQ } from '@/entities/FAQ';
import { FAQMapper } from '@/mappers/FAQMapper';
import { FAQService } from '@/services/FAQService';

export class FAQsController extends BaseController<FAQ> {
  constructor() {
    super(FAQ, FAQMapper);
    // Override the generic service with our custom FAQService
    this.service = new FAQService();
  }
}
