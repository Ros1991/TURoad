import { Request, Response } from 'express';
import { BaseController } from '@/core/base/BaseController';
import { Route } from '@/entities/Route';
import { RouteMapper } from '@/mappers/RouteMapper';
import { RouteService } from '@/services/RouteService';

export class RoutesController extends BaseController<Route> {
  constructor() {
    super(Route, RouteMapper);
    this.service = new RouteService();
  }
}
