import 'reflect-metadata';
import { AppDataSource } from '@/config/database';
import { SeedRunner } from '@/database/seeds';

async function runSeeds() {
  try {
    console.log('🚀 Starting seed execution...');
    
    // Initialize database connection
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('✅ Database connection established');
    }
    
    // Run all seeds
    await SeedRunner.runAllSeeds(AppDataSource);
    
    console.log('🎉 Seeds executed successfully!');
    
  } catch (error) {
    console.error('❌ Error executing seeds:', error);
    process.exit(1);
  } finally {
    // Close database connection
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('✅ Database connection closed');
    }
    process.exit(0);
  }
}

// Run seeds if this file is executed directly
if (require.main === module) {
  runSeeds();
}
