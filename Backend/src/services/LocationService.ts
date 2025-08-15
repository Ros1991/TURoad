import { BaseService } from '@/core/base/BaseService';
import { Location } from '@/entities/Location';
import { locationRepository } from '@/repositories/LocationRepository';

export class LocationService extends BaseService<Location> {
  constructor() {
    super(Location);
    this.repository = locationRepository;
  }
}
