import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';
import { LocalizedTextRef } from '../decorators/LocalizedTextRef';
import { BaseEntity } from '@/core/base/BaseEntity';

@Entity('push_notification_log')
export class PushNotificationLog extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { name: 'log_id' })
  logId!: number;

  @Column({ name: 'user_id', type: 'integer', nullable: true })
  userId?: number;

  @Column({ name: 'notification_type', type: 'varchar', length: 50 })
  notificationType!: string;

  @LocalizedTextRef
  @Column({ name: 'message_text_ref_id', type: 'integer', nullable: true })
  messageTextRefId?: number;

  @Column({ name: 'sent_at', type: 'timestamp' })
  sentAt!: Date;

  @Column({ name: 'status', type: 'varchar', length: 50, nullable: true })
  status?: string;

  // Relationships
  @ManyToOne(() => User, (user) => user.notificationLogs, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user?: User;
}

