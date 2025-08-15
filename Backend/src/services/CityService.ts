import { BaseService } from '@/core/base/BaseService';
import { City } from '@/entities/City';
import { cityRepository } from '@/repositories/CityRepository';

export class CityService extends BaseService<City> {
  constructor() {
    super(City);
    this.repository = cityRepository;
  }
}
