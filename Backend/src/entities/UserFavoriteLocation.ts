import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from './User';
import { Location } from './Location';
import { BaseEntity } from '@/core/base/BaseEntity';

@Entity('user_favorite_locations')
@Index(['userId', 'locationId'], { unique: true })
export class UserFavoriteLocation extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { name: 'user_favorite_location_id' })
  userFavoriteLocationId!: number;

  @Column({ name: 'user_id', type: 'integer' })
  userId!: number;

  @Column({ name: 'location_id', type: 'integer' })
  locationId!: number;

  // Relationships
  @ManyToOne(() => User, (user) => user.favoriteLocations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => Location, (location) => location.userFavorites, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'location_id' })
  location!: Location;
}
