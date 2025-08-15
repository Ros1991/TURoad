import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddImageUrlFields1703000000003 implements MigrationInterface {
  name = 'AddImageUrlFields1703000000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add image_url field to locations table
    await queryRunner.query(`
      ALTER TABLE "locations" 
      ADD COLUMN "image_url" VARCHAR(255) NULL
    `);

    // Add image_url field to routes table
    await queryRunner.query(`
      ALTER TABLE "routes" 
      ADD COLUMN "image_url" VARCHAR(255) NULL
    `);

    // Add image_url field to events table
    await queryRunner.query(`
      ALTER TABLE "events" 
      ADD COLUMN "image_url" VARCHAR(255) NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove image_url field from events table
    await queryRunner.query(`
      ALTER TABLE "events" 
      DROP COLUMN IF EXISTS "image_url"
    `);

    // Remove image_url field from routes table
    await queryRunner.query(`
      ALTER TABLE "routes" 
      DROP COLUMN IF EXISTS "image_url"
    `);

    // Remove image_url field from locations table
    await queryRunner.query(`
      ALTER TABLE "locations" 
      DROP COLUMN IF EXISTS "image_url"
    `);
  }
}
