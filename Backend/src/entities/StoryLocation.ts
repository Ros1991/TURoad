import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Location } from './Location';
import { LocalizedTextRef } from '../decorators/LocalizedTextRef';
import { BaseEntity } from '@/core/base/BaseEntity';

@Entity('story_locations')
export class StoryLocation extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { name: 'story_location_id' })
  storyLocationId!: number;

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

  @Column({ name: 'duration_seconds', type: 'integer', nullable: true })
  durationSeconds?: number;

  @Column({ name: 'location_id', type: 'integer' })
  locationId!: number;

  // Relationships
  @ManyToOne(() => Location, (location) => location.stories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'location_id' })
  location!: Location;
}

