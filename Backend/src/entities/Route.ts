import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { RouteCity } from './RouteCity';
import { RouteCategory } from './RouteCategory';
import { StoryRoute } from './StoryRoute';
import { UserFavoriteRoute } from './UserFavoriteRoute';
import { UserVisitedRoute } from './UserVisitedRoute';
import { LocalizedTextRef } from '../decorators/LocalizedTextRef';
import { SoftDeleteBaseEntity } from '@/core/base/BaseEntity';

@Entity('routes')
export class Route extends SoftDeleteBaseEntity {
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

