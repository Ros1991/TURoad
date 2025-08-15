import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index } from 'typeorm';
import { User } from './User';
import { Route } from './Route';

@Entity('user_favorite_routes')
@Index(['userId', 'routeId'], { unique: true })
export class UserFavoriteRoute {
  @PrimaryGeneratedColumn('increment', { name: 'user_favorite_route_id' })
  userFavoriteRouteId!: number;

  @Column({ name: 'user_id', type: 'integer' })
  userId!: number;

  @Column({ name: 'route_id', type: 'integer' })
  routeId!: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  // Relationships
  @ManyToOne(() => User, (user) => user.favoriteRoutes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => Route, (route) => route.userFavorites, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'route_id' })
  route!: Route;
}

