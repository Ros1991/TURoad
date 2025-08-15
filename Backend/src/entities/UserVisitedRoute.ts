import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index } from 'typeorm';
import { User } from './User';
import { Route } from './Route';

@Entity('user_visited_routes')
@Index(['userId', 'routeId'], { unique: true })
export class UserVisitedRoute {
  @PrimaryGeneratedColumn('increment', { name: 'user_visited_route_id' })
  userVisitedRouteId!: number;

  @Column({ name: 'user_id', type: 'integer' })
  userId!: number;

  @Column({ name: 'route_id', type: 'integer' })
  routeId!: number;

  @CreateDateColumn({ name: 'visited_at', type: 'timestamp' })
  visitedAt!: Date;

  // Relationships
  @ManyToOne(() => User, (user) => user.visitedRoutes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => Route, (route) => route.userVisited, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'route_id' })
  route!: Route;
}

