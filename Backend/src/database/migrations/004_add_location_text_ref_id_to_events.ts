import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLocationTextRefIdToEvents1703000000004 implements MigrationInterface {
  name = 'AddLocationTextRefIdToEvents1703000000004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add location_text_ref_id field to events table
    await queryRunner.query(`
      ALTER TABLE "events" 
      ADD COLUMN "location_text_ref_id" INTEGER NULL
    `);

    // Add foreign key constraint to localized_texts table
    await queryRunner.query(`
      ALTER TABLE "events" 
      ADD CONSTRAINT "FK_events_location_text_ref_id" 
      FOREIGN KEY ("location_text_ref_id") 
      REFERENCES "localized_texts"("reference_id") 
      ON DELETE SET NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove foreign key constraint
    await queryRunner.query(`
      ALTER TABLE "events" 
      DROP CONSTRAINT IF EXISTS "FK_events_location_text_ref_id"
    `);

    // Remove location_text_ref_id field from events table
    await queryRunner.query(`
      ALTER TABLE "events" 
      DROP COLUMN IF EXISTS "location_text_ref_id"
    `);
  }
}
