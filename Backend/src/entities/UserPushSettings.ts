import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { User } from './User';

@Entity('user_push_settings')
export class UserPushSettings {
  @PrimaryColumn({ name: 'user_id', type: 'integer' })
  userId!: number;

  @Column({ name: 'active_route_notifications', type: 'boolean', default: true })
  activeRouteNotifications!: boolean;

  @Column({ name: 'travel_tips_notifications', type: 'boolean', default: true })
  travelTipsNotifications!: boolean;

  @Column({ name: 'nearby_events_notifications', type: 'boolean', default: true })
  nearbyEventsNotifications!: boolean;

  @Column({ name: 'available_narratives_notifications', type: 'boolean', default: true })
  availableNarrativesNotifications!: boolean;

  @Column({ name: 'local_offers_notifications', type: 'boolean', default: true })
  localOffersNotifications!: boolean;

  // Relationships
  @OneToOne(() => User, (user) => user.pushSettings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;
}

