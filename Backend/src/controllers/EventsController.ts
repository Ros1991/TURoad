import { Request, Response } from 'express';
import { BaseController } from '@/core/base/BaseController';
import { Event } from '@/entities/Event';

export class EventsController extends BaseController<Event> {
  constructor() {
    super(Event);
  }
}
