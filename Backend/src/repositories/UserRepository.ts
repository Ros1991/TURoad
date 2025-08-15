import { User } from '@/entities/User';
import { BaseRepository } from '@/core/base/BaseRepository';
import { SelectQueryBuilder } from 'typeorm';

export class UserRepository extends BaseRepository<User> {
  constructor() {
    super(User);
  }

  protected override applySearch(qb: SelectQueryBuilder<User>, search: any): void {
    if(search && search.search && search.search.length > 0) {
      qb.andWhere('entity.firstName ILIKE :search', { search: `%${search.search}%` })
        .orWhere('entity.lastName ILIKE :search', { search: `%${search.search}%` })
        .orWhere('entity.email ILIKE :search', { search: `%${search.search}%` });
    }
    if(search && search.enabled !== undefined){
      qb.andWhere('entity.enabled = :enabled', { enabled: search.enabled });
    }
    if(search && search.isAdmin !== undefined){
      qb.andWhere('entity.isAdmin = :isAdmin', { isAdmin: search.isAdmin });
    }
  }

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

  async countByStatus(enabled: boolean): Promise<number> {
    return await this.repository.count({
      where: { enabled },
    });
  }
}

// Export singleton instance
export const userRepository = new UserRepository();

