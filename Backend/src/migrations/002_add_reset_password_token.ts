import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddResetPasswordToken1703000000002 implements MigrationInterface {
  name = 'AddResetPasswordToken1703000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add reset password token fields to users table
    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD COLUMN "reset_password_token" VARCHAR(255) NULL,
      ADD COLUMN "reset_password_expires" TIMESTAMP NULL
    `);

    // Create index for faster lookup by reset token
    await queryRunner.query(`
      CREATE INDEX "IDX_users_reset_password_token" 
      ON "users" ("reset_password_token") 
      WHERE "reset_password_token" IS NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop index first
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_users_reset_password_token"
    `);

    // Remove reset password token fields from users table
    await queryRunner.query(`
      ALTER TABLE "users" 
      DROP COLUMN IF EXISTS "reset_password_token",
      DROP COLUMN IF EXISTS "reset_password_expires"
    `);
  }
}
