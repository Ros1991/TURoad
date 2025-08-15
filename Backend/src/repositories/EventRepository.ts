import { BaseRepository } from '@/core/base/BaseRepository';
import { Event } from '@/entities/Event';

export class EventRepository extends BaseRepository<Event> {
  constructor() {
    super(Event, 'eventId');
  }
}

// Export singleton instance
export const eventRepository = new EventRepository();
