import { Request, Response } from 'express';
import { BaseController } from '@/core/base/BaseController';
import { Route } from '@/entities/Route';

export class RoutesController extends BaseController<Route> {
  constructor() {
    super(Route);
  }
}
