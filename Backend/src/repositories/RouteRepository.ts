import { BaseRepository } from '@/core/base/BaseRepository';
import { Route } from '@/entities/Route';

export class RouteRepository extends BaseRepository<Route> {
  constructor() {
    super(Route, 'routeId');
  }
}

// Export singleton instance
export const routeRepository = new RouteRepository();
