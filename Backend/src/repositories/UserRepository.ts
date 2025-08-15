import { User } from '@/entities/User';
import { BaseRepository } from '@/core/base/BaseRepository';

export class UserRepository extends BaseRepository<User> {
  constructor() {
    super(User);
  }

  // findByUsername method removed - using email only

  async findByEmail(email: string): Promise<User | null> {
    return await this.repository.findOne({ where: { email } });
  }

  async findByEmailOrUsername(emailOrUsername: string): Promise<User | null> {
    return await this.repository.findOne({ where: { email: emailOrUsername } });
  }

  async findByEmailWithTokens(email: string): Promise<User | null> {
    return await this.repository.findOne({
      where: { email },
      relations: ['tokens'],
    });
  }

  async findWithProfile(id: number): Promise<User | null> {
    return await this.repository.findOne({
      where: { userId: id },
      relations: ['favoriteRoutes', 'favoriteCities', 'visitedRoutes', 'pushSettings'],
    });
  }

  async findEnabledUsers(): Promise<User[]> {
    return await this.repository.find({
      where: { enabled: true },
    });
  }

  async findAdminUsers(): Promise<User[]> {
    return await this.repository.find({
      where: { isAdmin: true, enabled: true },
    });
  }

  // updateLastLogin method removed - User entity doesn't have lastLogin field

  async countByStatus(enabled: boolean): Promise<number> {
    return await this.repository.count({
      where: { enabled },
    });
  }

  async searchUsers(searchTerm: string): Promise<User[]> {
    return await this.repository
      .createQueryBuilder('user')
      .where('user.username ILIKE :search', { search: `%${searchTerm}%` })
      .orWhere('user.firstName ILIKE :search', { search: `%${searchTerm}%` })
      .orWhere('user.lastName ILIKE :search', { search: `%${searchTerm}%` })
      .getMany();
  }
}

