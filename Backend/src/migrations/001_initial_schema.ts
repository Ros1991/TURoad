import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1703000000001 implements MigrationInterface {
  name = 'InitialSchema1703000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create Localized_Texts table
    await queryRunner.query(`
      CREATE TABLE "localized_texts" (
        "text_id" SERIAL PRIMARY KEY,
        "reference_id" INTEGER NOT NULL,
        "language_code" VARCHAR(10) NOT NULL,
        "text_content" TEXT NOT NULL,
        UNIQUE ("reference_id", "language_code")
      )
    `);

    // Create Users table
    await queryRunner.query(`
      CREATE TABLE "users" (
        "user_id" SERIAL PRIMARY KEY,
        "username" VARCHAR(255) NOT NULL UNIQUE,
        "password_hash" VARCHAR(255) NOT NULL,
        "first_name" VARCHAR(255) NOT NULL,
        "last_name" VARCHAR(255) NOT NULL,
        "profile_picture_url" VARCHAR(255),
        "is_admin" BOOLEAN DEFAULT FALSE,
        "enabled" BOOLEAN DEFAULT TRUE
      )
    `);

    // Create JWT_Tokens table
    await queryRunner.query(`
      CREATE TABLE "jwt_tokens" (
        "token_id" SERIAL PRIMARY KEY,
        "user_id" INTEGER NOT NULL REFERENCES "users"("user_id") ON DELETE CASCADE,
        "token_hash" VARCHAR(255) NOT NULL UNIQUE,
        "expiration_date" TIMESTAMP NOT NULL,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create Cities table
    await queryRunner.query(`
      CREATE TABLE "cities" (
        "city_id" SERIAL PRIMARY KEY,
        "name_text_ref_id" INTEGER NOT NULL REFERENCES "localized_texts"("reference_id"),
        "description_text_ref_id" INTEGER REFERENCES "localized_texts"("reference_id"),
        "latitude" DECIMAL(9,6) NOT NULL,
        "longitude" DECIMAL(9,6) NOT NULL,
        "state" VARCHAR(255) NOT NULL,
        "image_url" VARCHAR(255),
        "what_to_observe_text_ref_id" INTEGER REFERENCES "localized_texts"("reference_id")
      )
    `);

    // Create Categories table
    await queryRunner.query(`
      CREATE TABLE "categories" (
        "category_id" SERIAL PRIMARY KEY,
        "name_text_ref_id" INTEGER NOT NULL REFERENCES "localized_texts"("reference_id")
      )
    `);

    // Create Types table
    await queryRunner.query(`
      CREATE TABLE "types" (
        "type_id" SERIAL PRIMARY KEY,
        "name_text_ref_id" INTEGER NOT NULL REFERENCES "localized_texts"("reference_id")
      )
    `);

    // Create Locations table
    await queryRunner.query(`
      CREATE TABLE "locations" (
        "location_id" SERIAL PRIMARY KEY,
        "city_id" INTEGER NOT NULL REFERENCES "cities"("city_id") ON DELETE CASCADE,
        "name_text_ref_id" INTEGER NOT NULL REFERENCES "localized_texts"("reference_id"),
        "description_text_ref_id" INTEGER REFERENCES "localized_texts"("reference_id"),
        "latitude" DECIMAL(9,6),
        "longitude" DECIMAL(9,6),
        "type_id" INTEGER REFERENCES "types"("type_id") ON DELETE SET NULL
      )
    `);

    // Create Events table
    await queryRunner.query(`
      CREATE TABLE "events" (
        "event_id" SERIAL PRIMARY KEY,
        "city_id" INTEGER NOT NULL REFERENCES "cities"("city_id") ON DELETE CASCADE,
        "name_text_ref_id" INTEGER NOT NULL REFERENCES "localized_texts"("reference_id"),
        "description_text_ref_id" INTEGER REFERENCES "localized_texts"("reference_id"),
        "event_date" DATE NOT NULL,
        "event_time" TIME NOT NULL
      )
    `);

    // Create Routes table
    await queryRunner.query(`
      CREATE TABLE "routes" (
        "route_id" SERIAL PRIMARY KEY,
        "title_text_ref_id" INTEGER NOT NULL REFERENCES "localized_texts"("reference_id"),
        "description_text_ref_id" INTEGER REFERENCES "localized_texts"("reference_id"),
        "what_to_observe_text_ref_id" INTEGER REFERENCES "localized_texts"("reference_id")
      )
    `);

    // Create Route_Cities table
    await queryRunner.query(`
      CREATE TABLE "route_cities" (
        "route_city_id" SERIAL PRIMARY KEY,
        "route_id" INTEGER NOT NULL REFERENCES "routes"("route_id") ON DELETE CASCADE,
        "city_id" INTEGER NOT NULL REFERENCES "cities"("city_id") ON DELETE CASCADE,
        "order" INTEGER NOT NULL,
        UNIQUE ("route_id", "city_id", "order")
      )
    `);

    // Create junction tables for categories
    await queryRunner.query(`
      CREATE TABLE "event_categories" (
        "event_category_id" SERIAL PRIMARY KEY,
        "event_id" INTEGER NOT NULL REFERENCES "events"("event_id") ON DELETE CASCADE,
        "category_id" INTEGER NOT NULL REFERENCES "categories"("category_id") ON DELETE CASCADE,
        UNIQUE ("event_id", "category_id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "location_categories" (
        "location_category_id" SERIAL PRIMARY KEY,
        "location_id" INTEGER NOT NULL REFERENCES "locations"("location_id") ON DELETE CASCADE,
        "category_id" INTEGER NOT NULL REFERENCES "categories"("category_id") ON DELETE CASCADE,
        UNIQUE ("location_id", "category_id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "city_categories" (
        "city_category_id" SERIAL PRIMARY KEY,
        "city_id" INTEGER NOT NULL REFERENCES "cities"("city_id") ON DELETE CASCADE,
        "category_id" INTEGER NOT NULL REFERENCES "categories"("category_id") ON DELETE CASCADE,
        UNIQUE ("city_id", "category_id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "route_categories" (
        "route_category_id" SERIAL PRIMARY KEY,
        "route_id" INTEGER NOT NULL REFERENCES "routes"("route_id") ON DELETE CASCADE,
        "category_id" INTEGER NOT NULL REFERENCES "categories"("category_id") ON DELETE CASCADE,
        UNIQUE ("route_id", "category_id")
      )
    `);

    // Create Story tables
    await queryRunner.query(`
      CREATE TABLE "story_events" (
        "story_event_id" SERIAL PRIMARY KEY,
        "name_text_ref_id" INTEGER NOT NULL REFERENCES "localized_texts"("reference_id"),
        "description_text_ref_id" INTEGER REFERENCES "localized_texts"("reference_id"),
        "play_count" INTEGER DEFAULT 0,
        "audio_url_ref_id" INTEGER REFERENCES "localized_texts"("reference_id"),
        "event_id" INTEGER NOT NULL REFERENCES "events"("event_id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "story_locations" (
        "story_location_id" SERIAL PRIMARY KEY,
        "name_text_ref_id" INTEGER NOT NULL REFERENCES "localized_texts"("reference_id"),
        "description_text_ref_id" INTEGER REFERENCES "localized_texts"("reference_id"),
        "play_count" INTEGER DEFAULT 0,
        "audio_url_ref_id" INTEGER REFERENCES "localized_texts"("reference_id"),
        "location_id" INTEGER NOT NULL REFERENCES "locations"("location_id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "story_cities" (
        "story_city_id" SERIAL PRIMARY KEY,
        "name_text_ref_id" INTEGER NOT NULL REFERENCES "localized_texts"("reference_id"),
        "description_text_ref_id" INTEGER REFERENCES "localized_texts"("reference_id"),
        "play_count" INTEGER DEFAULT 0,
        "audio_url_ref_id" INTEGER REFERENCES "localized_texts"("reference_id"),
        "city_id" INTEGER NOT NULL REFERENCES "cities"("city_id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "story_routes" (
        "story_route_id" SERIAL PRIMARY KEY,
        "name_text_ref_id" INTEGER NOT NULL REFERENCES "localized_texts"("reference_id"),
        "description_text_ref_id" INTEGER REFERENCES "localized_texts"("reference_id"),
        "play_count" INTEGER DEFAULT 0,
        "audio_url_ref_id" INTEGER REFERENCES "localized_texts"("reference_id"),
        "route_id" INTEGER NOT NULL REFERENCES "routes"("route_id") ON DELETE CASCADE
      )
    `);

    // Create User favorite and visited tables
    await queryRunner.query(`
      CREATE TABLE "user_favorite_routes" (
        "user_favorite_route_id" SERIAL PRIMARY KEY,
        "user_id" INTEGER NOT NULL REFERENCES "users"("user_id") ON DELETE CASCADE,
        "route_id" INTEGER NOT NULL REFERENCES "routes"("route_id") ON DELETE CASCADE,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE ("user_id", "route_id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "user_favorite_cities" (
        "user_favorite_city_id" SERIAL PRIMARY KEY,
        "user_id" INTEGER NOT NULL REFERENCES "users"("user_id") ON DELETE CASCADE,
        "city_id" INTEGER NOT NULL REFERENCES "cities"("city_id") ON DELETE CASCADE,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE ("user_id", "city_id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "user_visited_routes" (
        "user_visited_route_id" SERIAL PRIMARY KEY,
        "user_id" INTEGER NOT NULL REFERENCES "users"("user_id") ON DELETE CASCADE,
        "route_id" INTEGER NOT NULL REFERENCES "routes"("route_id") ON DELETE CASCADE,
        "visited_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE ("user_id", "route_id")
      )
    `);

    // Create User push settings table
    await queryRunner.query(`
      CREATE TABLE "user_push_settings" (
        "user_id" INTEGER PRIMARY KEY REFERENCES "users"("user_id") ON DELETE CASCADE,
        "active_route_notifications" BOOLEAN DEFAULT TRUE,
        "travel_tips_notifications" BOOLEAN DEFAULT TRUE,
        "nearby_events_notifications" BOOLEAN DEFAULT TRUE,
        "available_narratives_notifications" BOOLEAN DEFAULT TRUE,
        "local_offers_notifications" BOOLEAN DEFAULT TRUE
      )
    `);

    // Create Push notification log table
    await queryRunner.query(`
      CREATE TABLE "push_notification_log" (
        "log_id" SERIAL PRIMARY KEY,
        "user_id" INTEGER REFERENCES "users"("user_id") ON DELETE SET NULL,
        "notification_type" VARCHAR(50) NOT NULL,
        "message_text_ref_id" INTEGER REFERENCES "localized_texts"("reference_id"),
        "sent_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "status" VARCHAR(50)
      )
    `);

    // Create FAQ table
    await queryRunner.query(`
      CREATE TABLE "faq" (
        "faq_id" SERIAL PRIMARY KEY,
        "question_text_ref_id" INTEGER NOT NULL REFERENCES "localized_texts"("reference_id"),
        "answer_text_ref_id" INTEGER NOT NULL REFERENCES "localized_texts"("reference_id")
      )
    `);

    // Create indexes for better performance
    await queryRunner.query(`CREATE INDEX "idx_localized_texts_reference_id" ON "localized_texts" ("reference_id")`);
    await queryRunner.query(`CREATE INDEX "idx_localized_texts_language_code" ON "localized_texts" ("language_code")`);
    await queryRunner.query(`CREATE INDEX "idx_users_username" ON "users" ("username")`);
    await queryRunner.query(`CREATE INDEX "idx_users_enabled" ON "users" ("enabled")`);
    await queryRunner.query(`CREATE INDEX "idx_cities_state" ON "cities" ("state")`);
    await queryRunner.query(`CREATE INDEX "idx_events_date" ON "events" ("event_date")`);
    await queryRunner.query(`CREATE INDEX "idx_route_cities_order" ON "route_cities" ("route_id", "order")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables in reverse order to handle foreign key constraints
    await queryRunner.query(`DROP TABLE IF EXISTS "faq"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "push_notification_log"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_push_settings"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_visited_routes"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_favorite_cities"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_favorite_routes"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "story_routes"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "story_cities"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "story_locations"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "story_events"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "route_categories"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "city_categories"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "location_categories"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "event_categories"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "route_cities"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "routes"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "events"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "locations"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "types"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "categories"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "cities"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "jwt_tokens"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "localized_texts"`);
  }
}

