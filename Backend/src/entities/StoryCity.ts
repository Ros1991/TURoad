import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { City } from './City';
import { LocalizedTextRef } from '../decorators/LocalizedTextRef';
import { BaseEntity } from '@/core/base/BaseEntity';

@Entity('story_cities')
export class StoryCity extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { name: 'story_city_id' })
  storyCityId!: number;

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

  @Column({ name: 'city_id', type: 'integer' })
  cityId!: number;

  // Relationships
  @ManyToOne(() => City, (city) => city.stories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'city_id' })
  city!: City;
}

