import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1700000000000 implements MigrationInterface {
    name = 'InitialMigration1700000000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        const schema = process.env.DB_SCHEMA || 'public';
        
        // Create schema if not exists
        await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS "${schema}"`);
        
        // Set search path
        await queryRunner.query(`SET search_path TO "${schema}"`);
        
        // Create Localized_Texts table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "Localized_Texts" (
                "text_id" SERIAL PRIMARY KEY,
                "reference_id" VARCHAR(100) NOT NULL,
                "language_code" VARCHAR(5) NOT NULL,
                "text_content" TEXT,
                "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE("reference_id", "language_code")
            )
        `);
        
        // Create Users table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "Users" (
                "user_id" SERIAL PRIMARY KEY,
                "username" VARCHAR(50) UNIQUE NOT NULL,
                "email" VARCHAR(100) UNIQUE NOT NULL,
                "password_hash" VARCHAR(255) NOT NULL,
                "first_name" VARCHAR(50),
                "last_name" VARCHAR(50),
                "birth_date" DATE,
                "gender" VARCHAR(10),
                "profile_picture_url" VARCHAR(500),
                "bio_text_ref_id" VARCHAR(100),
                "is_admin" BOOLEAN DEFAULT false,
                "enabled" BOOLEAN DEFAULT true,
                "receive_push_notifications" BOOLEAN DEFAULT true,
                "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "last_login" TIMESTAMP,
                "email_verified" BOOLEAN DEFAULT false,
                "verification_token" VARCHAR(255),
                "reset_password_token" VARCHAR(255),
                "reset_password_expires" TIMESTAMP
            )
        `);
        
        // Create JWT_Tokens table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "JWT_Tokens" (
                "token_id" SERIAL PRIMARY KEY,
                "user_id" INTEGER NOT NULL REFERENCES "Users"("user_id") ON DELETE CASCADE,
                "token_hash" VARCHAR(500) NOT NULL,
                "refresh_token_hash" VARCHAR(500),
                "expiration_date" TIMESTAMP NOT NULL,
                "revoked" BOOLEAN DEFAULT false,
                "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // Create Categories table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "Categories" (
                "category_id" SERIAL PRIMARY KEY,
                "name_text_ref_id" VARCHAR(100) NOT NULL,
                "icon_url" VARCHAR(500),
                "color_hex" VARCHAR(7),
                "order_index" INTEGER DEFAULT 0,
                "is_active" BOOLEAN DEFAULT true,
                "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // Create Types table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "Types" (
                "type_id" SERIAL PRIMARY KEY,
                "name_text_ref_id" VARCHAR(100) NOT NULL,
                "icon_url" VARCHAR(500),
                "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // Create FAQ table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "FAQ" (
                "faq_id" SERIAL PRIMARY KEY,
                "question_text_ref_id" VARCHAR(100) NOT NULL,
                "answer_text_ref_id" VARCHAR(100) NOT NULL,
                "order_index" INTEGER DEFAULT 0,
                "is_active" BOOLEAN DEFAULT true,
                "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // Create Cities table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "Cities" (
                "city_id" SERIAL PRIMARY KEY,
                "name_text_ref_id" VARCHAR(100) NOT NULL,
                "description_text_ref_id" VARCHAR(100),
                "latitude" DECIMAL(10, 8),
                "longitude" DECIMAL(11, 8),
                "state" VARCHAR(100),
                "country" VARCHAR(100) DEFAULT 'Brasil',
                "image_url" VARCHAR(500),
                "what_to_observe_text_ref_id" VARCHAR(100),
                "is_active" BOOLEAN DEFAULT true,
                "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // Create Locations table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "Locations" (
                "location_id" SERIAL PRIMARY KEY,
                "city_id" INTEGER NOT NULL REFERENCES "Cities"("city_id") ON DELETE CASCADE,
                "type_id" INTEGER REFERENCES "Types"("type_id") ON DELETE SET NULL,
                "name_text_ref_id" VARCHAR(100) NOT NULL,
                "description_text_ref_id" VARCHAR(100),
                "address" VARCHAR(500),
                "latitude" DECIMAL(10, 8),
                "longitude" DECIMAL(11, 8),
                "phone" VARCHAR(50),
                "website" VARCHAR(500),
                "opening_hours" VARCHAR(500),
                "image_url" VARCHAR(500),
                "is_active" BOOLEAN DEFAULT true,
                "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // Create Events table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "Events" (
                "event_id" SERIAL PRIMARY KEY,
                "city_id" INTEGER NOT NULL REFERENCES "Cities"("city_id") ON DELETE CASCADE,
                "name_text_ref_id" VARCHAR(100) NOT NULL,
                "description_text_ref_id" VARCHAR(100),
                "event_date" DATE,
                "event_time" TIME,
                "location" VARCHAR(500),
                "image_url" VARCHAR(500),
                "is_active" BOOLEAN DEFAULT true,
                "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // Create Routes table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "Routes" (
                "route_id" SERIAL PRIMARY KEY,
                "title_text_ref_id" VARCHAR(100) NOT NULL,
                "description_text_ref_id" VARCHAR(100),
                "what_to_observe_text_ref_id" VARCHAR(100),
                "duration_days" INTEGER,
                "difficulty_level" VARCHAR(20),
                "distance_km" DECIMAL(10, 2),
                "image_url" VARCHAR(500),
                "is_active" BOOLEAN DEFAULT true,
                "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // Create Route_Cities table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "Route_Cities" (
                "route_city_id" SERIAL PRIMARY KEY,
                "route_id" INTEGER NOT NULL REFERENCES "Routes"("route_id") ON DELETE CASCADE,
                "city_id" INTEGER NOT NULL REFERENCES "Cities"("city_id") ON DELETE CASCADE,
                "order" INTEGER NOT NULL,
                "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE("route_id", "city_id", "order")
            )
        `);
        
        // Create Story tables
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "Story_Cities" (
                "story_city_id" SERIAL PRIMARY KEY,
                "city_id" INTEGER NOT NULL REFERENCES "Cities"("city_id") ON DELETE CASCADE,
                "name_text_ref_id" VARCHAR(100) NOT NULL,
                "description_text_ref_id" VARCHAR(100),
                "audio_url_ref_id" VARCHAR(100),
                "duration_seconds" INTEGER,
                "play_count" INTEGER DEFAULT 0,
                "order_index" INTEGER DEFAULT 0,
                "is_active" BOOLEAN DEFAULT true,
                "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "Story_Locations" (
                "story_location_id" SERIAL PRIMARY KEY,
                "location_id" INTEGER NOT NULL REFERENCES "Locations"("location_id") ON DELETE CASCADE,
                "name_text_ref_id" VARCHAR(100) NOT NULL,
                "description_text_ref_id" VARCHAR(100),
                "audio_url_ref_id" VARCHAR(100),
                "duration_seconds" INTEGER,
                "play_count" INTEGER DEFAULT 0,
                "order_index" INTEGER DEFAULT 0,
                "is_active" BOOLEAN DEFAULT true,
                "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "Story_Events" (
                "story_event_id" SERIAL PRIMARY KEY,
                "event_id" INTEGER NOT NULL REFERENCES "Events"("event_id") ON DELETE CASCADE,
                "name_text_ref_id" VARCHAR(100) NOT NULL,
                "description_text_ref_id" VARCHAR(100),
                "audio_url_ref_id" VARCHAR(100),
                "duration_seconds" INTEGER,
                "play_count" INTEGER DEFAULT 0,
                "order_index" INTEGER DEFAULT 0,
                "is_active" BOOLEAN DEFAULT true,
                "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "Story_Routes" (
                "story_route_id" SERIAL PRIMARY KEY,
                "route_id" INTEGER NOT NULL REFERENCES "Routes"("route_id") ON DELETE CASCADE,
                "name_text_ref_id" VARCHAR(100) NOT NULL,
                "description_text_ref_id" VARCHAR(100),
                "audio_url_ref_id" VARCHAR(100),
                "duration_seconds" INTEGER,
                "play_count" INTEGER DEFAULT 0,
                "order_index" INTEGER DEFAULT 0,
                "is_active" BOOLEAN DEFAULT true,
                "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // Create Category association tables
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "City_Categories" (
                "city_category_id" SERIAL PRIMARY KEY,
                "city_id" INTEGER NOT NULL REFERENCES "Cities"("city_id") ON DELETE CASCADE,
                "category_id" INTEGER NOT NULL REFERENCES "Categories"("category_id") ON DELETE CASCADE,
                "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE("city_id", "category_id")
            )
        `);
        
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "Location_Categories" (
                "location_category_id" SERIAL PRIMARY KEY,
                "location_id" INTEGER NOT NULL REFERENCES "Locations"("location_id") ON DELETE CASCADE,
                "category_id" INTEGER NOT NULL REFERENCES "Categories"("category_id") ON DELETE CASCADE,
                "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE("location_id", "category_id")
            )
        `);
        
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "Event_Categories" (
                "event_category_id" SERIAL PRIMARY KEY,
                "event_id" INTEGER NOT NULL REFERENCES "Events"("event_id") ON DELETE CASCADE,
                "category_id" INTEGER NOT NULL REFERENCES "Categories"("category_id") ON DELETE CASCADE,
                "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE("event_id", "category_id")
            )
        `);
        
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "Route_Categories" (
                "route_category_id" SERIAL PRIMARY KEY,
                "route_id" INTEGER NOT NULL REFERENCES "Routes"("route_id") ON DELETE CASCADE,
                "category_id" INTEGER NOT NULL REFERENCES "Categories"("category_id") ON DELETE CASCADE,
                "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE("route_id", "category_id")
            )
        `);
        
        // Create User favorite tables
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "User_Favorite_Cities" (
                "user_favorite_city_id" SERIAL PRIMARY KEY,
                "user_id" INTEGER NOT NULL REFERENCES "Users"("user_id") ON DELETE CASCADE,
                "city_id" INTEGER NOT NULL REFERENCES "Cities"("city_id") ON DELETE CASCADE,
                "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE("user_id", "city_id")
            )
        `);
        
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "User_Favorite_Routes" (
                "user_favorite_route_id" SERIAL PRIMARY KEY,
                "user_id" INTEGER NOT NULL REFERENCES "Users"("user_id") ON DELETE CASCADE,
                "route_id" INTEGER NOT NULL REFERENCES "Routes"("route_id") ON DELETE CASCADE,
                "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE("user_id", "route_id")
            )
        `);
        
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "User_Visited_Routes" (
                "user_visited_route_id" SERIAL PRIMARY KEY,
                "user_id" INTEGER NOT NULL REFERENCES "Users"("user_id") ON DELETE CASCADE,
                "route_id" INTEGER NOT NULL REFERENCES "Routes"("route_id") ON DELETE CASCADE,
                "visited_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "completion_percentage" DECIMAL(5, 2) DEFAULT 0,
                "rating" INTEGER CHECK (rating >= 1 AND rating <= 5),
                "review_text" TEXT
            )
        `);
        
        // Create Push notification tables
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "User_Push_Settings" (
                "push_settings_id" SERIAL PRIMARY KEY,
                "user_id" INTEGER NOT NULL REFERENCES "Users"("user_id") ON DELETE CASCADE,
                "push_token" VARCHAR(500),
                "device_type" VARCHAR(20),
                "device_id" VARCHAR(100),
                "events_enabled" BOOLEAN DEFAULT true,
                "routes_enabled" BOOLEAN DEFAULT true,
                "news_enabled" BOOLEAN DEFAULT true,
                "promotions_enabled" BOOLEAN DEFAULT true,
                "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE("user_id", "device_id")
            )
        `);
        
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "Push_Notification_Logs" (
                "log_id" SERIAL PRIMARY KEY,
                "user_id" INTEGER REFERENCES "Users"("user_id") ON DELETE SET NULL,
                "push_type" VARCHAR(50),
                "title" VARCHAR(500),
                "body" TEXT,
                "data" JSONB,
                "status" VARCHAR(20),
                "error_message" TEXT,
                "sent_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // Create indexes
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_localized_texts_reference" ON "Localized_Texts"("reference_id")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_users_email" ON "Users"("email")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_users_username" ON "Users"("username")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_jwt_tokens_user" ON "JWT_Tokens"("user_id")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_locations_city" ON "Locations"("city_id")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_events_city" ON "Events"("city_id")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_route_cities" ON "Route_Cities"("route_id", "order")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_push_logs_user" ON "Push_Notification_Logs"("user_id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const schema = process.env.DB_SCHEMA || 'public';
        await queryRunner.query(`SET search_path TO "${schema}"`);
        
        // Drop all tables in reverse order
        await queryRunner.query(`DROP TABLE IF EXISTS "Push_Notification_Logs" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "User_Push_Settings" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "User_Visited_Routes" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "User_Favorite_Routes" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "User_Favorite_Cities" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "Route_Categories" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "Event_Categories" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "Location_Categories" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "City_Categories" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "Story_Routes" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "Story_Events" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "Story_Locations" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "Story_Cities" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "Route_Cities" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "Routes" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "Events" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "Locations" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "Cities" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "FAQ" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "Types" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "Categories" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "JWT_Tokens" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "Users" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "Localized_Texts" CASCADE`);
    }
}
