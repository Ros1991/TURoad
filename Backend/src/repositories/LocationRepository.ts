import { BaseRepository } from '@/core/base/BaseRepository';
import { Location } from '@/entities/Location';

export class LocationRepository extends BaseRepository<Location> {
  constructor() {
    super(Location, 'locationId');
  }
}

// Export singleton instance
export const locationRepository = new LocationRepository();
