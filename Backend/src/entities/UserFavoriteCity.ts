import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from './User';
import { City } from './City';
import { BaseEntity } from '@/core/base/BaseEntity';

@Entity('user_favorite_cities')
@Index(['userId', 'cityId'], { unique: true })
export class UserFavoriteCity extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { name: 'user_favorite_city_id' })
  userFavoriteCityId!: number;

  @Column({ name: 'user_id', type: 'integer' })
  userId!: number;

  @Column({ name: 'city_id', type: 'integer' })
  cityId!: number;

  // Relationships
  @ManyToOne(() => User, (user) => user.favoriteCities, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => City, (city) => city.userFavorites, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'city_id' })
  city!: City;
}

