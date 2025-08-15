import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Location } from './Location';
import { LocalizedTextRef } from '../decorators/LocalizedTextRef';
import { SoftDeleteBaseEntity } from '@/core/base/BaseEntity';

@Entity('types')
export class Type extends SoftDeleteBaseEntity {
  @PrimaryGeneratedColumn('increment', { name: 'type_id' })
  typeId!: number;

  @LocalizedTextRef
  @Column({ name: 'name_text_ref_id', type: 'integer' })
  nameTextRefId!: number;

  // Relationships
  @OneToMany(() => Location, (location) => location.type)
  locations!: Location[];
}

