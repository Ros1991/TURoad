import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';
import { RouteCity } from './RouteCity';
import { RouteCategory } from './RouteCategory';
import { StoryRoute } from './StoryRoute';
import { UserFavoriteRoute } from './UserFavoriteRoute';
import { UserVisitedRoute } from './UserVisitedRoute';
import { LocalizedTextRef } from '../decorators/LocalizedTextRef';

@Entity('routes')
export class Route {
  @PrimaryGeneratedColumn('increment', { name: 'route_id' })
  routeId!: number;

  @LocalizedTextRef
  @Column({ name: 'title_text_ref_id', type: 'integer' })
  titleTextRefId!: number;

  @LocalizedTextRef
  @Column({ name: 'description_text_ref_id', type: 'integer', nullable: true })
  descriptionTextRefId?: number;

  @LocalizedTextRef
  @Column({ name: 'what_to_observe_text_ref_id', type: 'integer', nullable: true })
  whatToObserveTextRefId?: number;

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
  @OneToMany(() => RouteCity, (routeCity) => routeCity.route)
  routeCities!: RouteCity[];

  @OneToMany(() => RouteCategory, (routeCategory) => routeCategory.route)
  routeCategories!: RouteCategory[];

  @OneToMany(() => StoryRoute, (storyRoute) => storyRoute.route)
  stories!: StoryRoute[];

  @OneToMany(() => UserFavoriteRoute, (favorite) => favorite.route)
  userFavorites!: UserFavoriteRoute[];

  @OneToMany(() => UserVisitedRoute, (visited) => visited.route)
  userVisited!: UserVisitedRoute[];
}

