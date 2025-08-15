import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';
import { City } from './City';
import { EventCategory } from './EventCategory';
import { StoryEvent } from './StoryEvent';
import { LocalizedTextRef } from '../decorators/LocalizedTextRef';

@Entity('events')
export class Event {
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

  @Column({ name: 'event_date', type: 'date' })
  eventDate!: Date;

  @Column({ name: 'event_time', type: 'time' })
  eventTime!: string;

  // Audit fields
  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt!: Date;

  // Soft delete fields
  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt!: Date | null;

  @Column({ name: 'is_deleted', type: 'boolean', default: false })
  isDeleted!: boolean;

  // Relationships
  @ManyToOne(() => City, (city) => city.events, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'city_id' })
  city!: City;

  @OneToMany(() => EventCategory, (eventCategory) => eventCategory.event)
  eventCategories!: EventCategory[];

  @OneToMany(() => StoryEvent, (storyEvent) => storyEvent.event)
  stories!: StoryEvent[];
}

