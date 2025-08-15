import { DataSource } from 'typeorm';
import { User } from '@/entities/User';
import { PasswordUtils } from '@/utils/password';

export class UserSeed {
  static async run(dataSource: DataSource): Promise<void> {
    const userRepository = dataSource.getRepository(User);
    
    // Check if any users exist
    const userCount = await userRepository.count();
    
    if (userCount === 0) {
      console.log('No users found. Creating default admin user...');
      
      // Create default admin user
      const defaultPassword = 'admin123';
      const hashedPassword = await PasswordUtils.hashPassword(defaultPassword);
      
      const adminUser = userRepository.create({
        email: 'admin@admin.com',
        firstName: 'Administrator',
        lastName: 'System',
        passwordHash: hashedPassword,
        isAdmin: true,
        enabled: true
      });
      
      await userRepository.save(adminUser);
      
      console.log('✅ Default admin user created:');
      console.log('  Username: admin');
      console.log('  Email: admin@admin.com');
      console.log('  Password: admin123');
      console.log('  Role: Admin');
      console.log('⚠️  Please change the default password after first login!');
    } else {
      console.log(`Users already exist in database (${userCount} users found). Skipping seed.`);
    }
  }
}
