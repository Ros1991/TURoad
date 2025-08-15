import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { LocalizedTextRef } from '../decorators/LocalizedTextRef';
import { SoftDeleteBaseEntity } from '@/core/base/BaseEntity';

@Entity('faq')
export class FAQ extends SoftDeleteBaseEntity {
  @PrimaryGeneratedColumn('increment', { name: 'faq_id' })
  faqId!: number;

  @LocalizedTextRef
  @Column({ name: 'question_text_ref_id', type: 'integer' })
  questionTextRefId!: number;

  @LocalizedTextRef
  @Column({ name: 'answer_text_ref_id', type: 'integer' })
  answerTextRefId!: number;
}

