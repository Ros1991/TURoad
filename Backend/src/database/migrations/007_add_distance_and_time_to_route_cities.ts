import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDistanceAndTimeToRouteCities1735000000007 implements MigrationInterface {
  name = 'AddDistanceAndTimeToRouteCities1735000000007';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add distance_km field to route_cities table (if not exists)
    await queryRunner.query(`
      ALTER TABLE "route_cities" 
      ADD COLUMN IF NOT EXISTS "distance_km" DECIMAL(8,3) NULL
    `);

    // Add travel_time_minutes field to route_cities table (if not exists)
    await queryRunner.query(`
      ALTER TABLE "route_cities" 
      ADD COLUMN IF NOT EXISTS "travel_time_minutes" INTEGER NULL
    `);

    // Add comments to the columns (only if they don't already have comments)
    await queryRunner.query(`
      COMMENT ON COLUMN "route_cities"."distance_km" IS 'Distance in kilometers from the previous city in the route'
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN "route_cities"."travel_time_minutes" IS 'Travel time in minutes from the previous city in the route'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove travel_time_minutes field from route_cities table
    await queryRunner.query(`
      ALTER TABLE "route_cities" 
      DROP COLUMN IF EXISTS "travel_time_minutes"
    `);

    // Remove distance_km field from route_cities table
    await queryRunner.query(`
      ALTER TABLE "route_cities" 
      DROP COLUMN IF EXISTS "distance_km"
    `);
  }
}
