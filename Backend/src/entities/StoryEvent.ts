import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Event } from './Event';
import { LocalizedTextRef } from '../decorators/LocalizedTextRef';

@Entity('story_events')
export class StoryEvent {
  @PrimaryGeneratedColumn('increment', { name: 'story_event_id' })
  storyEventId!: number;

  @LocalizedTextRef
  @Column({ name: 'name_text_ref_id', type: 'integer' })
  nameTextRefId!: number;

  @LocalizedTextRef
  @Column({ name: 'description_text_ref_id', type: 'integer', nullable: true })
  descriptionTextRefId?: number;

  @Column({ name: 'play_count', type: 'integer', default: 0 })
  playCount!: number;

  @LocalizedTextRef
  @Column({ name: 'audio_url_ref_id', type: 'integer', nullable: true })
  audioUrlRefId?: number;

  @Column({ name: 'event_id', type: 'integer' })
  eventId!: number;

  // Relationships
  @ManyToOne(() => Event, (event) => event.stories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_id' })
  event!: Event;
}

