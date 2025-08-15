import { BaseService } from '@/core/base/BaseService';
import { User } from '@/entities/User';

export class UserService extends BaseService<User> {
  constructor() {
    super(User);
  }
}

