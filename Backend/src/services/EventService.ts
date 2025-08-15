import { BaseService } from '@/core/base/BaseService';
import { Event } from '@/entities/Event';

export class EventService extends BaseService<Event> {
  constructor() {
    super(Event);
  }
}
