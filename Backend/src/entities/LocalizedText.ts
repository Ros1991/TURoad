import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';
import { BaseEntity } from '@/core/base/BaseEntity';

@Entity('localized_texts')
@Index(['referenceId', 'languageCode'], { unique: true })
export class LocalizedText extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { name: 'text_id' })
  textId!: number;

  @Column({ name: 'reference_id', type: 'integer' })
  referenceId!: number;

  @Column({ name: 'language_code', type: 'varchar', length: 10 })
  languageCode!: string;

  @Column({ name: 'text_content', type: 'text' })
  textContent!: string;
}

