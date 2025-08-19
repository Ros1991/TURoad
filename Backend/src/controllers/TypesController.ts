import { Request, Response } from 'express';
import { BaseController } from '@/core/base/BaseController';
import { Type } from '@/entities/Type';
import { TypeMapper } from '@/mappers/TypeMapper';
import { TypeService } from '@/services/TypeService';

export class TypesController extends BaseController<Type> {
  constructor() {
    super(Type, TypeMapper);
    // Override the generic service with our custom TypeService
    this.service = new TypeService();
  }
}
