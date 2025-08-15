import { BaseService } from '@/core/base/BaseService';
import { FAQ } from '@/entities/FAQ';

export class FAQService extends BaseService<FAQ> {
  constructor() {
    super(FAQ);
  }
}
