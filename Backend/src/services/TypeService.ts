import { BaseService } from '@/core/base/BaseService';
import { Type } from '@/entities/Type';

export class TypeService extends BaseService<Type> {
  constructor() {
    super(Type);
  }
}
