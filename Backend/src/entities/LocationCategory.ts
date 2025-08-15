import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Location } from './Location';
import { Category } from './Category';
import { BaseEntity } from '@/core/base/BaseEntity';

@Entity('location_categories')
@Index(['locationId', 'categoryId'], { unique: true })
export class LocationCategory extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { name: 'location_category_id' })
  locationCategoryId!: number;

  @Column({ name: 'location_id', type: 'integer' })
  locationId!: number;

  @Column({ name: 'category_id', type: 'integer' })
  categoryId!: number;

  // Relationships
  @ManyToOne(() => Location, (location) => location.locationCategories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'location_id' })
  location!: Location;

  @ManyToOne(() => Category, (category) => category.locationCategories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'category_id' })
  category!: Category;
}

