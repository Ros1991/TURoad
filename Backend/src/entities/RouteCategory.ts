import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Route } from './Route';
import { Category } from './Category';
import { BaseEntity } from '@/core/base/BaseEntity';

@Entity('route_categories')
@Index(['routeId', 'categoryId'], { unique: true })
export class RouteCategory extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { name: 'route_category_id' })
  routeCategoryId!: number;

  @Column({ name: 'route_id', type: 'integer' })
  routeId!: number;

  @Column({ name: 'category_id', type: 'integer' })
  categoryId!: number;

  // Relationships
  @ManyToOne(() => Route, (route) => route.routeCategories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'route_id' })
  route!: Route;

  @ManyToOne(() => Category, (category) => category.routeCategories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'category_id' })
  category!: Category;
}

