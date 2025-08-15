import { BaseRepository } from '@/core/base/BaseRepository';
import { Type } from '@/entities/Type';

export class TypeRepository extends BaseRepository<Type> {
  constructor() {
    super(Type, 'typeId');
  }
}

// Export singleton instance
export const typeRepository = new TypeRepository();
