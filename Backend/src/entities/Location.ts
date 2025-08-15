import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';
import { City } from './City';
import { Type } from './Type';
import { LocationCategory } from './LocationCategory';
import { StoryLocation } from './StoryLocation';
import { LocalizedTextRef } from '../decorators/LocalizedTextRef';

@Entity('locations')
export class Location {
  @PrimaryGeneratedColumn('increment', { name: 'location_id' })
  locationId!: number;

  @Column({ name: 'city_id', type: 'integer' })
  cityId!: number;

  @LocalizedTextRef
  @Column({ name: 'name_text_ref_id', type: 'integer' })
  nameTextRefId!: number;

  @LocalizedTextRef
  @Column({ name: 'description_text_ref_id', type: 'integer', nullable: true })
  descriptionTextRefId?: number;

  @Column({ name: 'latitude', type: 'decimal', precision: 9, scale: 6, nullable: true })
  latitude?: number;

  @Column({ name: 'longitude', type: 'decimal', precision: 9, scale: 6, nullable: true })
  longitude?: number;

  @Column({ name: 'type_id', type: 'integer', nullable: true })
  typeId?: number;

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
  @ManyToOne(() => City, (city) => city.locations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'city_id' })
  city!: City;

  @ManyToOne(() => Type, (type) => type.locations, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'type_id' })
  type?: Type;

  @OneToMany(() => LocationCategory, (locationCategory) => locationCategory.location)
  locationCategories!: LocationCategory[];

  @OneToMany(() => StoryLocation, (storyLocation) => storyLocation.location)
  stories!: StoryLocation[];
}

