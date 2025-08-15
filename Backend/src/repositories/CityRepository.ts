import { BaseRepository } from '@/core/base/BaseRepository';
import { City } from '@/entities/City';

export class CityRepository extends BaseRepository<City> {
  constructor() {
    super(City, 'cityId');
  }
}

// Export singleton instance
export const cityRepository = new CityRepository();
