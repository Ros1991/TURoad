import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { City } from './City';
import { Category } from './Category';

@Entity('city_categories')
@Index(['cityId', 'categoryId'], { unique: true })
export class CityCategory {
  @PrimaryGeneratedColumn('increment', { name: 'city_category_id' })
  cityCategoryId!: number;

  @Column({ name: 'city_id', type: 'integer' })
  cityId!: number;

  @Column({ name: 'category_id', type: 'integer' })
  categoryId!: number;

  // Relationships
  @ManyToOne(() => City, (city) => city.cityCategories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'city_id' })
  city!: City;

  @ManyToOne(() => Category, (category) => category.cityCategories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'category_id' })
  category!: Category;
}

