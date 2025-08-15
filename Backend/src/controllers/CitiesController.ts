import { Request, Response } from 'express';
import { BaseController } from '@/core/base/BaseController';
import { City } from '@/entities/City';
import { CityMapper } from '@/mappers/CityMapper';
import { CityService } from '@/services/CityService';

export class CitiesController extends BaseController<City> {
  constructor() {
    super(City, CityMapper);
    this.service = new CityService();
  }
}
