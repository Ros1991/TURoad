import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { City } from './City';
import { EventCategory } from './EventCategory';
import { StoryEvent } from './StoryEvent';
import { LocalizedTextRef } from '../decorators/LocalizedTextRef';
import { SoftDeleteBaseEntity } from '@/core/base/BaseEntity';

@Entity('events')
export class Event extends SoftDeleteBaseEntity {
  @PrimaryGeneratedColumn('increment', { name: 'event_id' })
  eventId!: number;

  @Column({ name: 'city_id', type: 'integer' })
  cityId!: number;

  @LocalizedTextRef
  @Column({ name: 'name_text_ref_id', type: 'integer' })
  nameTextRefId!: number;

  @LocalizedTextRef
  @Column({ name: 'description_text_ref_id', type: 'integer', nullable: true })
  descriptionTextRefId?: number;

  @LocalizedTextRef
  @Column({ name: 'location_text_ref_id', type: 'integer', nullable: true })
  locationTextRefId?: number;

  @Column({ name: 'event_date', type: 'date' })
  eventDate!: Date;

  @Column({ name: 'event_time', type: 'time' })
  eventTime!: string;

  @Column({ name: 'image_url', type: 'varchar', length: 255, nullable: true })
  imageUrl?: string;

  // Relationships
  @ManyToOne(() => City, (city) => city.events, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'city_id' })
  city!: City;

  @OneToMany(() => EventCategory, (eventCategory) => eventCategory.event)
  eventCategories!: EventCategory[];

  @OneToMany(() => StoryEvent, (storyEvent) => storyEvent.event)
  stories!: StoryEvent[];
}

