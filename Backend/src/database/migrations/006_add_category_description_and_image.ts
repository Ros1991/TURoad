import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCategoryDescriptionAndImage1703000000006 implements MigrationInterface {
  name = 'AddCategoryDescriptionAndImage1703000000006';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add description_text_ref_id field to categories table
    await queryRunner.query(`
      ALTER TABLE "categories" 
      ADD COLUMN "description_text_ref_id" INTEGER NULL
    `);

    // Add image_url field to categories table
    await queryRunner.query(`
      ALTER TABLE "categories" 
      ADD COLUMN "image_url" VARCHAR(255) NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove image_url field from categories table
    await queryRunner.query(`
      ALTER TABLE "categories" 
      DROP COLUMN IF EXISTS "image_url"
    `);

    // Remove description_text_ref_id field from categories table
    await queryRunner.query(`
      ALTER TABLE "categories" 
      DROP COLUMN IF EXISTS "description_text_ref_id"
    `);
  }
}
