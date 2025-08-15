import { BaseController } from '@/core/base/BaseController';
import { User } from '@/entities/User';
import { Request, Response } from 'express';

export class UsersController extends BaseController<User> {
  constructor() {
    super(User);
  }
}
