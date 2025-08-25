import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Route } from './Route';
import { LocalizedTextRef } from '../decorators/LocalizedTextRef';
import { BaseEntity } from '@/core/base/BaseEntity';

@Entity('story_routes')
export class StoryRoute extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { name: 'story_route_id' })
  storyRouteId!: number;

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

  @Column({ name: 'route_id', type: 'integer' })
  routeId!: number;

  // Relationships
  @ManyToOne(() => Route, (route) => route.stories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'route_id' })
  route!: Route;
}

