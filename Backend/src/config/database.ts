import { DataSource } from 'typeorm';
import { config } from './environment';

// Import all entities
import { LocalizedText } from '@/entities/LocalizedText';
import { User } from '@/entities/User';
import { JwtToken } from '@/entities/JwtToken';
import { City } from '@/entities/City';
import { Category } from '@/entities/Category';
import { Type } from '@/entities/Type';
import { Location } from '@/entities/Location';
import { Event } from '@/entities/Event';
import { Route } from '@/entities/Route';
import { RouteCity } from '@/entities/RouteCity';
import { EventCategory } from '@/entities/EventCategory';
import { LocationCategory } from '@/entities/LocationCategory';
import { CityCategory } from '@/entities/CityCategory';
import { RouteCategory } from '@/entities/RouteCategory';
import { StoryEvent } from '@/entities/StoryEvent';
import { StoryLocation } from '@/entities/StoryLocation';
import { StoryCity } from '@/entities/StoryCity';
import { StoryRoute } from '@/entities/StoryRoute';
import { UserFavoriteRoute } from '@/entities/UserFavoriteRoute';
import { UserFavoriteCity } from '@/entities/UserFavoriteCity';
import { UserFavoriteEvent } from '@/entities/UserFavoriteEvent';
import { UserFavoriteLocation } from '@/entities/UserFavoriteLocation';
import { UserVisitedRoute } from '@/entities/UserVisitedRoute';
import { UserPushSettings } from '@/entities/UserPushSettings';
import { PushNotificationLog } from '@/entities/PushNotificationLog';
import { FAQ } from '@/entities/FAQ';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: config.database.host,
  port: config.database.port,
  username: config.database.username,
  password: config.database.password,
  database: config.database.database,
  schema: config.database.schema,
  synchronize: true, // Recria automaticamente as tabelas
  logging: config.database.logging,
  entities: [
    LocalizedText,
    User,
    JwtToken,
    City,
    Category,
    Type,
    Location,
    Event,
    Route,
    RouteCity,
    EventCategory,
    LocationCategory,
    CityCategory,
    RouteCategory,
    StoryEvent,
    StoryLocation,
    StoryCity,
    StoryRoute,
    UserFavoriteRoute,
    UserFavoriteCity,
    UserFavoriteEvent,
    UserFavoriteLocation,
    UserVisitedRoute,
    UserPushSettings,
    PushNotificationLog,
    FAQ,
  ],
  migrations: ['src/database/migrations/*.ts'],
  migrationsTableName: 'migrations',
  migrationsRun: false, // Disable automatic migrations - we run them manually
});

export const initializeDatabase = async (): Promise<void> => {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connection established successfully');
    
    // Check and run pending migrations
    try {
      const hasPendingMigrations = await AppDataSource.showMigrations();
      if (hasPendingMigrations) {
        console.log('🔄 Found pending migrations. Running...');
        await AppDataSource.runMigrations();
        console.log('✅ Migrations completed successfully');
      } else {
        console.log('✅ No pending migrations found');
      }
    } catch (migrationError: any) {
      console.log('⚠️ Migration check failed, continuing with existing schema:', migrationError?.message || 'Unknown error');
    }

    // Run database seeds
    console.log('🌱 Running database seeds...');
    const { SeedRunner } = await import('@/database/seeds');
    await SeedRunner.runAllSeeds(AppDataSource);
    
  } catch (error) {
    console.error('❌ Error during database initialization:', error);
    throw error;
  }
};

export const closeDatabase = async (): Promise<void> => {
  try {
    await AppDataSource.destroy();
    console.log('✅ Database connection closed successfully');
  } catch (error) {
    console.error('❌ Error during database closure:', error);
    throw error;
  }
};

