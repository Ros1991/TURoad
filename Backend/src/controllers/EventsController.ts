import { Request, Response } from 'express';
import { BaseController } from '@/core/base/BaseController';
import { Event } from '@/entities/Event';
import { EventMapper } from '@/mappers/EventMapper';
import { EventService } from '@/services/EventService';

export class EventsController extends BaseController<Event> {
  constructor() {
    super(Event, EventMapper);
    this.service = new EventService();
  }
}
