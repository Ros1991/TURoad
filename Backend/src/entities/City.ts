import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Location } from './Location';
import { Event } from './Event';
import { RouteCity } from './RouteCity';
import { CityCategory } from './CityCategory';
import { StoryCity } from './StoryCity';
import { UserFavoriteCity } from './UserFavoriteCity';
import { LocalizedTextRef } from '../decorators/LocalizedTextRef';
import { SoftDeleteBaseEntity } from '@/core/base/BaseEntity';

@Entity('cities')
export class City extends SoftDeleteBaseEntity {
  @PrimaryGeneratedColumn('increment', { name: 'city_id' })
  cityId!: number;

  @LocalizedTextRef
  @Column({ name: 'name_text_ref_id', type: 'integer' })
  nameTextRefId!: number;

  @LocalizedTextRef
  @Column({ name: 'description_text_ref_id', type: 'integer', nullable: true })
  descriptionTextRefId?: number;

  @Column({ name: 'latitude', type: 'decimal', precision: 9, scale: 6 })
  latitude!: number;

  @Column({ name: 'longitude', type: 'decimal', precision: 9, scale: 6 })
  longitude!: number;

  @Column({ name: 'state', type: 'varchar', length: 255 })
  state!: string;

  @Column({ name: 'image_url', type: 'varchar', length: 255, nullable: true })
  imageUrl?: string;

  @LocalizedTextRef
  @Column({ name: 'what_to_observe_text_ref_id', type: 'integer', nullable: true })
  whatToObserveTextRefId?: number;

  // Relationships
  @OneToMany(() => Location, (location) => location.city)
  locations!: Location[];

  @OneToMany(() => Event, (event) => event.city)
  events!: Event[];

  @OneToMany(() => RouteCity, (routeCity) => routeCity.city)
  routeCities!: RouteCity[];

  @OneToMany(() => CityCategory, (cityCategory) => cityCategory.city)
  cityCategories!: CityCategory[];

  @OneToMany(() => StoryCity, (storyCity) => storyCity.city)
  stories!: StoryCity[];

  @OneToMany(() => UserFavoriteCity, (favorite) => favorite.city)
  userFavorites!: UserFavoriteCity[];
}

