import { BaseService } from '@/core/base/BaseService';
import { Route } from '@/entities/Route';

export class RouteService extends BaseService<Route> {
  constructor() {
    super(Route);
  }
}
