import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Event } from './Event';
import { Category } from './Category';
import { BaseEntity } from '@/core/base/BaseEntity';

@Entity('event_categories')
@Index(['eventId', 'categoryId'], { unique: true })
export class EventCategory extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { name: 'event_category_id' })
  eventCategoryId!: number;

  @Column({ name: 'event_id', type: 'integer' })
  eventId!: number;

  @Column({ name: 'category_id', type: 'integer' })
  categoryId!: number;

  // Relationships
  @ManyToOne(() => Event, (event) => event.eventCategories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_id' })
  event!: Event;

  @ManyToOne(() => Category, (category) => category.eventCategories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'category_id' })
  category!: Category;
}

