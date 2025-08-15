import { Request, Response } from 'express';
import { BaseController } from '@/core/base/BaseController';
import { City } from '@/entities/City';

export class CitiesController extends BaseController<City> {
  constructor() {
    super(City);
  }
}
