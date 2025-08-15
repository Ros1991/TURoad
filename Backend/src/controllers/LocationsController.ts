import { Request, Response } from 'express';
import { BaseController } from '@/core/base/BaseController';
import { Location } from '@/entities/Location';
import { LocationMapper } from '@/mappers/LocationMapper';
import { LocationService } from '@/services/LocationService';

export class LocationsController extends BaseController<Location> {
  constructor() {
    super(Location, LocationMapper);
    this.service = new LocationService();
  }
}
