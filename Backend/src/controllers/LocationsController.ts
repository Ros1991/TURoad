import { Request, Response } from 'express';
import { BaseController } from '@/core/base/BaseController';
import { Location } from '@/entities/Location';

export class LocationsController extends BaseController<Location> {
  constructor() {
    super(Location);
  }
}
