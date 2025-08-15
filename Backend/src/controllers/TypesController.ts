import { Request, Response } from 'express';
import { BaseController } from '@/core/base/BaseController';
import { Type } from '@/entities/Type';

export class TypesController extends BaseController<Type> {
  constructor() {
    super(Type);
  }
}
