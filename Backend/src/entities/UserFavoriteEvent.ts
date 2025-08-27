import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from './User';
import { Event } from './Event';
import { BaseEntity } from '@/core/base/BaseEntity';

@Entity('user_favorite_events')
@Index(['userId', 'eventId'], { unique: true })
export class UserFavoriteEvent extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { name: 'user_favorite_event_id' })
  userFavoriteEventId!: number;

  @Column({ name: 'user_id', type: 'integer' })
  userId!: number;

  @Column({ name: 'event_id', type: 'integer' })
  eventId!: number;

  // Relationships
  @ManyToOne(() => User, (user) => user.favoriteEvents, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => Event, (event) => event.userFavorites, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_id' })
  event!: Event;
}
