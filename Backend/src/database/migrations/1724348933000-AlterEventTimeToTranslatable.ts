import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterEventTimeToTranslatable1724348933000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Remove a coluna event_time atual
    await queryRunner.dropColumn('events', 'event_time');
    
    // Adiciona a nova coluna time_text_ref_id
    await queryRunner.addColumn('events', new TableColumn({
      name: 'time_text_ref_id',
      type: 'integer',
      isNullable: true
    }));
    
    // Adiciona foreign key constraint para a tabela localized_texts
    await queryRunner.query(`
      ALTER TABLE events 
      ADD CONSTRAINT FK_events_time_text_ref_id 
      FOREIGN KEY (time_text_ref_id) 
      REFERENCES localized_texts(text_ref_id) 
      ON DELETE SET NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove a foreign key constraint
    await queryRunner.query(`
      ALTER TABLE events 
      DROP CONSTRAINT FK_events_time_text_ref_id
    `);
    
    // Remove a coluna time_text_ref_id
    await queryRunner.dropColumn('events', 'time_text_ref_id');
    
    // Restaura a coluna event_time original
    await queryRunner.addColumn('events', new TableColumn({
      name: 'event_time',
      type: 'time',
      isNullable: false
    }));
  }
}
