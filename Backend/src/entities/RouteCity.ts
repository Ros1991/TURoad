import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Route } from './Route';
import { City } from './City';
import { BaseEntity } from '@/core/base/BaseEntity';

@Entity('route_cities')
@Index(['routeId', 'cityId', 'order'], { unique: true })
export class RouteCity extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { name: 'route_city_id' })
  routeCityId!: number;

  @Column({ name: 'route_id', type: 'integer' })
  routeId!: number;

  @Column({ name: 'city_id', type: 'integer' })
  cityId!: number;

  @Column({ name: 'order', type: 'integer' })
  order!: number;

  @Column({ 
    name: 'distance_km', 
    type: 'decimal', 
    precision: 8, 
    scale: 3, 
    nullable: true,
    comment: 'Distance in kilometers from the previous city in the route'
  })
  distanceKm?: number;

  @Column({ 
    name: 'travel_time_minutes', 
    type: 'integer', 
    nullable: true,
    comment: 'Travel time in minutes from the previous city in the route'
  })
  travelTimeMinutes?: number;

  // Relationships
  @ManyToOne(() => Route, (route) => route.routeCities, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'route_id' })
  route!: Route;

  @ManyToOne(() => City, (city) => city.routeCities, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'city_id' })
  city!: City;
}

