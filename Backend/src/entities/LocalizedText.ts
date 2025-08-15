import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('localized_texts')
@Index(['referenceId', 'languageCode'], { unique: true })
export class LocalizedText {
  @PrimaryGeneratedColumn('increment', { name: 'text_id' })
  textId!: number;

  @Column({ name: 'reference_id', type: 'integer' })
  referenceId!: number;

  @Column({ name: 'language_code', type: 'varchar', length: 10 })
  languageCode!: string;

  @Column({ name: 'text_content', type: 'text' })
  textContent!: string;
}

