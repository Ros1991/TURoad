import { 
  PrimaryGeneratedColumn, 
  CreateDateColumn, 
  UpdateDateColumn, 
  DeleteDateColumn,
  Column,
  BaseEntity as TypeOrmBaseEntity 
} from 'typeorm';

/**
 * Base entity class with common fields for all entities
 * Includes soft delete functionality
 */
export abstract class BaseEntity extends TypeOrmBaseEntity {
  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt!: Date;
}

export abstract class SoftDeleteBaseEntity extends BaseEntity {
  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt!: Date | null;

  @Column({ type: 'boolean', default: false })
  isDeleted!: boolean;
}
