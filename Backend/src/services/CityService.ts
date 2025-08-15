import { BaseService } from '@/core/base/BaseService';
import { City } from '@/entities/City';

export class CityService extends BaseService<City> {
  constructor() {
    super(City);
  }
}
