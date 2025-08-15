import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';
import { Location } from './Location';
import { LocalizedTextRef } from '../decorators/LocalizedTextRef';

@Entity('types')
export class Type {
  @PrimaryGeneratedColumn('increment', { name: 'type_id' })
  typeId!: number;

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
  @OneToMany(() => Location, (location) => location.type)
  locations!: Location[];
}

