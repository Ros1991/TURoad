import { BaseService } from '@/core/base/BaseService';
import { Event } from '@/entities/Event';
import { eventRepository } from '@/repositories/EventRepository';

export class EventService extends BaseService<Event> {
  constructor() {
    super(Event);
    this.repository = eventRepository;
  }
}
