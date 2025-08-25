import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddAudioDurationToStories1735183000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add duration_seconds column to story_cities table
    await queryRunner.addColumn('story_cities', new TableColumn({
      name: 'duration_seconds',
      type: 'integer',
      isNullable: true,
      comment: 'Audio duration in seconds'
    }));

    // Add duration_seconds column to story_events table
    await queryRunner.addColumn('story_events', new TableColumn({
      name: 'duration_seconds',
      type: 'integer',
      isNullable: true,
      comment: 'Audio duration in seconds'
    }));

    // Add duration_seconds column to story_locations table
    await queryRunner.addColumn('story_locations', new TableColumn({
      name: 'duration_seconds',
      type: 'integer',
      isNullable: true,
      comment: 'Audio duration in seconds'
    }));

    // Add duration_seconds column to story_routes table
    await queryRunner.addColumn('story_routes', new TableColumn({
      name: 'duration_seconds',
      type: 'integer',
      isNullable: true,
      comment: 'Audio duration in seconds'
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove duration_seconds column from story_cities table
    await queryRunner.dropColumn('story_cities', 'duration_seconds');

    // Remove duration_seconds column from story_events table
    await queryRunner.dropColumn('story_events', 'duration_seconds');

    // Remove duration_seconds column from story_locations table
    await queryRunner.dropColumn('story_locations', 'duration_seconds');

    // Remove duration_seconds column from story_routes table
    await queryRunner.dropColumn('story_routes', 'duration_seconds');
  }
}
