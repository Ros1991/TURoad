import { BaseService } from '@/core/base/BaseService';
import { Route } from '@/entities/Route';
import { routeRepository } from '@/repositories/RouteRepository';

export class RouteService extends BaseService<Route> {
  constructor() {
    super(Route);
    this.repository = routeRepository;
  }
}
