import { DataSource } from 'typeorm';
import { UserSeed } from './UserSeed';

export class SeedRunner {
  static async runAllSeeds(dataSource: DataSource): Promise<void> {
    console.log('🌱 Starting database seeding...');
    
    try {
      // Run User seed
      await UserSeed.run(dataSource);
      
      console.log('✅ Database seeding completed successfully!');
    } catch (error) {
      console.error('❌ Error during database seeding:', error);
      throw error;
    }
  }
}

// Export individual seeds for manual execution
export { UserSeed };
