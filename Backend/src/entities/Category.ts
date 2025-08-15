import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';
import { EventCategory } from './EventCategory';
import { LocationCategory } from './LocationCategory';
import { CityCategory } from './CityCategory';
import { RouteCategory } from './RouteCategory';
import { LocalizedTextRef } from '../decorators/LocalizedTextRef';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('increment', { name: 'category_id' })
  categoryId!: number;

  @LocalizedTextRef
  @Column({ name: 'name_text_ref_id', type: 'integer' })
  nameTextRefId!: number;

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
  @OneToMany(() => EventCategory, (eventCategory) => eventCategory.category)
  eventCategories!: EventCategory[];

  @OneToMany(() => LocationCategory, (locationCategory) => locationCategory.category)
  locationCategories!: LocationCategory[];

  @OneToMany(() => CityCategory, (cityCategory) => cityCategory.category)
  cityCategories!: CityCategory[];

  @OneToMany(() => RouteCategory, (routeCategory) => routeCategory.category)
  routeCategories!: RouteCategory[];
}

