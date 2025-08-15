import { BaseService } from '@/core/base/BaseService';
import { Location } from '@/entities/Location';

export class LocationService extends BaseService<Location> {
  constructor() {
    super(Location);
  }
}
