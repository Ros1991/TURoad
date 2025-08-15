import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from './User';
import { Route } from './Route';
import { BaseEntity } from '@/core/base/BaseEntity';

@Entity('user_visited_routes')
@Index(['userId', 'routeId'], { unique: true })
export class UserVisitedRoute extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { name: 'user_visited_route_id' })
  userVisitedRouteId!: number;

  @Column({ name: 'user_id', type: 'integer' })
  userId!: number;

  @Column({ name: 'route_id', type: 'integer' })
  routeId!: number;

  @Column({ name: 'visited_at', type: 'timestamp' })
  visitedAt!: Date;

  // Relationships
  @ManyToOne(() => User, (user) => user.visitedRoutes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => Route, (route) => route.userVisited, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'route_id' })
  route!: Route;
}

