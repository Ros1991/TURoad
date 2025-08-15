import 'reflect-metadata';
import { AppDataSource } from '@/config/database';
import { AuthService } from '@/services/AuthService';
import { UserRepository } from '@/repositories/UserRepository';
import { LoginDto, RegisterDto } from '@/dtos/AuthDto';

async function testAuthSystem() {
  try {
    console.log('🧪 Testing authentication system...');
    
    // Initialize database
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('✅ Database connected');
    }
    
    const authService = new AuthService();
    const userRepository = new UserRepository();
    
    // Test 1: Check if admin user exists
    console.log('\n📋 Test 1: Checking admin user...');
    const adminUser = await userRepository.findByEmail('admin@admin.com');
    if (adminUser) {
      console.log('✅ Admin user found:', {
        userId: adminUser.userId,
        email: adminUser.email,
        firstName: adminUser.firstName,
        lastName: adminUser.lastName,
        isAdmin: adminUser.isAdmin,
        enabled: adminUser.enabled
      });
    } else {
      console.log('❌ Admin user not found - run seeds first');
    }
    
    // Test 2: Test login with admin user
    if (adminUser) {
      console.log('\n📋 Test 2: Testing login...');
      try {
        const loginDto: LoginDto = {
          emailOrUsername: 'admin@admin.com', // Can use email or username
          password: 'admin123'
        };
        
        const authResult = await authService.login(loginDto);
        console.log('✅ Login successful');
        console.log('Access token length:', authResult.accessToken.length);
        console.log('Refresh token length:', authResult.refreshToken.length);
        console.log('User data:', authResult.user);
        
        // Test 3: Validate token
        console.log('\n📋 Test 3: Testing token validation...');
        const isValid = await authService.validateToken(authResult.accessToken);
        console.log('✅ Token validation:', isValid ? 'VALID' : 'INVALID');
        
      } catch (error) {
        console.log('❌ Login failed:', error);
      }
    }
    
    console.log('\n🎉 Authentication system test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('✅ Database connection closed');
    }
    process.exit(0);
  }
}

// Run test if executed directly
if (require.main === module) {
  testAuthSystem();
}
