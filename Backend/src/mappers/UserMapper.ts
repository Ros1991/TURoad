import { User } from '@/entities/User';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from '@/dtos/UserDto';
import { BaseMapper } from '@/core/base/BaseMapper';

export class UserMapper extends BaseMapper<User> {
  static toEntity(createDto: CreateUserDto): User {
    const user = new User();
    user.email = createDto.email;
    user.passwordHash = createDto.password; // Will be hashed in service
    user.firstName = createDto.firstName;
    user.lastName = createDto.lastName;
    user.profilePictureUrl = createDto.profilePictureUrl;
    user.isAdmin = createDto.isAdmin || false;
    user.enabled = createDto.enabled !== undefined ? createDto.enabled : true;
    return user;
  }

  static toEntityFromUpdate(entity: User, dto: UpdateUserDto): void {
    if (dto.email !== undefined) entity.email = dto.email;
    if (dto.firstName !== undefined) entity.firstName = dto.firstName;
    if (dto.lastName !== undefined) entity.lastName = dto.lastName;
    if (dto.profilePictureUrl !== undefined) entity.profilePictureUrl = dto.profilePictureUrl;
    if (dto.isAdmin !== undefined) entity.isAdmin = dto.isAdmin;
    if (dto.enabled !== undefined) entity.enabled = dto.enabled;
  }

  static toResponseDto(entity: User): UserResponseDto {
    return {
      id: entity.userId,
      userId: entity.userId,
      email: entity.email,
      firstName: entity.firstName,
      lastName: entity.lastName,
      profilePictureUrl: entity.profilePictureUrl,
      isAdmin: entity.isAdmin,
      enabled: entity.enabled
    };
  }
}

