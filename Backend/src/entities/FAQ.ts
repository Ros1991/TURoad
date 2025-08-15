import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';
import { LocalizedTextRef } from '../decorators/LocalizedTextRef';

@Entity('faq')
export class FAQ {
  @PrimaryGeneratedColumn('increment', { name: 'faq_id' })
  faqId!: number;

  @LocalizedTextRef
  @Column({ name: 'question_text_ref_id', type: 'integer' })
  questionTextRefId!: number;

  @LocalizedTextRef
  @Column({ name: 'answer_text_ref_id', type: 'integer' })
  answerTextRefId!: number;

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
}

