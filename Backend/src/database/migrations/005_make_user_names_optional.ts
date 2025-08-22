import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeUserNamesOptional1735232135000 implements MigrationInterface {
  name = 'MakeUserNamesOptional1735232135000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Make first_name and last_name nullable in users table
    await queryRunner.query(`
      ALTER TABLE "users" 
      ALTER COLUMN "first_name" DROP NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "users" 
      ALTER COLUMN "last_name" DROP NOT NULL
    `);

    // Update existing users with empty names to NULL (optional cleanup)
    await queryRunner.query(`
      UPDATE "users" 
      SET "first_name" = NULL 
      WHERE "first_name" = '' OR "first_name" IS NULL
    `);

    await queryRunner.query(`
      UPDATE "users" 
      SET "last_name" = NULL 
      WHERE "last_name" = '' OR "last_name" IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Set default values for NULL names before making them NOT NULL again
    await queryRunner.query(`
      UPDATE "users" 
      SET "first_name" = 'User' 
      WHERE "first_name" IS NULL
    `);

    await queryRunner.query(`
      UPDATE "users" 
      SET "last_name" = 'Name' 
      WHERE "last_name" IS NULL
    `);

    // Make first_name and last_name NOT NULL again
    await queryRunner.query(`
      ALTER TABLE "users" 
      ALTER COLUMN "first_name" SET NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "users" 
      ALTER COLUMN "last_name" SET NOT NULL
    `);
  }
}
