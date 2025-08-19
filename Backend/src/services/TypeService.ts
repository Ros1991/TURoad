import { BaseService } from '@/core/base/BaseService';
import { Type } from '@/entities/Type';
import { typeRepository } from '@/repositories/TypeRepository';

export class TypeService extends BaseService<Type> {
  constructor() {
    super(Type);
    // Use the singleton instance that has the proper applySearch implementation
    this.repository = typeRepository;
  }
}
