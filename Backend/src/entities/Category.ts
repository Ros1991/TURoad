import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { EventCategory } from './EventCategory';
import { LocationCategory } from './LocationCategory';
import { CityCategory } from './CityCategory';
import { RouteCategory } from './RouteCategory';
import { LocalizedTextRef } from '../decorators/LocalizedTextRef';
import { SoftDeleteBaseEntity } from '@/core/base/BaseEntity';

@Entity('categories')
export class Category extends SoftDeleteBaseEntity {
  @PrimaryGeneratedColumn('increment', { name: 'category_id' })
  categoryId!: number;

  @LocalizedTextRef
  @Column({ name: 'name_text_ref_id', type: 'integer' })
  nameTextRefId!: number;

  // Relationships
  @OneToMany(() => EventCategory, (eventCategory) => eventCategory.category)
  eventCategories!: EventCategory[];

  @OneToMany(() => LocationCategory, (locationCategory) => locationCategory.category)
  locationCategories!: LocationCategory[];

  @OneToMany(() => CityCategory, (cityCategory) => cityCategory.category)
  cityCategories!: CityCategory[];

  @OneToMany(() => RouteCategory, (routeCategory) => routeCategory.category)
  routeCategories!: RouteCategory[];
}

