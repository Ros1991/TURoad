import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';
import { BaseEntity } from '@/core/base/BaseEntity';

@Entity('jwt_tokens')
export class JwtToken extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { name: 'token_id' })
  tokenId!: number;

  @Column({ name: 'user_id', type: 'integer' })
  userId!: number;

  @Column({ name: 'token_hash', type: 'varchar', length: 255, unique: true })
  tokenHash!: string;

  @Column({ name: 'expiration_date', type: 'timestamp' })
  expirationDate!: Date;

  // Relationships
  @ManyToOne(() => User, (user) => user.tokens, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;
}

