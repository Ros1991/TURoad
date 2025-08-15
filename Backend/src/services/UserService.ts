import { BaseService } from '@/core/base/BaseService';
import { User } from '@/entities/User';
import { CreateUserDto, UpdateUserDto } from '@/dtos/UserDto';
import { PasswordUtils } from '@/utils/password';
import { UserRepository } from '@/repositories/UserRepository';

export class UserService extends BaseService<User> {
  constructor() {
    super(User);
    this.repository = new UserRepository();
  }

  override async create(createDto: CreateUserDto): Promise<User> {
    // Hash the password before saving
    if (createDto.password) {
      const hashedPassword = await PasswordUtils.hashPassword(createDto.password);
      
      // Create user data with hashed password
      const userData = {
        email: createDto.email,
        passwordHash: hashedPassword,
        firstName: createDto.firstName,
        lastName: createDto.lastName,
        profilePictureUrl: createDto.profilePictureUrl,
        isAdmin: createDto.isAdmin ?? false,
        enabled: createDto.enabled ?? true,
      };
      
      return super.create(userData as Partial<User>);
    }
    
    throw new Error('Password is required');
  }

  override async update(id: number, updateDto: UpdateUserDto): Promise<User> {
    // Hash the password if it's being updated
    if (updateDto.password) {
      const hashedPassword = await PasswordUtils.hashPassword(updateDto.password);
      
      // Create user data with hashed password
      const userData = {
        email: updateDto.email,
        passwordHash: hashedPassword,
        firstName: updateDto.firstName,
        lastName: updateDto.lastName,
        profilePictureUrl: updateDto.profilePictureUrl,
        isAdmin: updateDto.isAdmin,
        enabled: updateDto.enabled,
      };
      
      return super.update(id, userData as Partial<User>);
    }
    return super.update(id, updateDto as Partial<User>);
  }
}

