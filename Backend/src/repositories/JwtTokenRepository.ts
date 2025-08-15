import { JwtToken } from '@/entities/JwtToken';
import { BaseRepository } from '@/core/base/BaseRepository';

export class JwtTokenRepository extends BaseRepository<JwtToken> {
  constructor() {
    super(JwtToken);
  }

  async findByTokenHash(tokenHash: string): Promise<JwtToken | null> {
    return await this.repository.findOne({
      where: { tokenHash },
      relations: ['user'],
    });
  }

  async findByUserId(userId: number): Promise<JwtToken[]> {
    return await this.repository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async createToken(userId: number, tokenHash: string, expirationDate: Date): Promise<JwtToken> {
    const token = new JwtToken();
    token.userId = userId;
    token.tokenHash = tokenHash;
    token.expirationDate = expirationDate;
    
    return await this.repository.save(token);
  }

  async revokeToken(tokenHash: string): Promise<boolean> {
    const result = await this.repository.delete({ tokenHash });
    return (result.affected ?? 0) > 0;
  }

  async revokeAllUserTokens(userId: number): Promise<void> {
    await this.repository.delete({ userId });
  }

  async revokeExpiredTokens(): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .delete()
      .where('expiration_date < :now', { now: new Date() })
      .execute();
  }

  async findExpiredTokens(): Promise<JwtToken[]> {
    return await this.repository
      .createQueryBuilder('token')
      .where('token.expirationDate < :now', { now: new Date() })
      .getMany();
  }

  async countActiveTokensForUser(userId: number): Promise<number> {
    return await this.repository
      .createQueryBuilder('token')
      .where('token.userId = :userId', { userId })
      .andWhere('token.expirationDate > :now', { now: new Date() })
      .getCount();
  }

  async findActiveTokensForUser(userId: number): Promise<JwtToken[]> {
    return await this.repository
      .createQueryBuilder('token')
      .where('token.userId = :userId', { userId })
      .andWhere('token.expirationDate > :now', { now: new Date() })
      .orderBy('token.createdAt', 'DESC')
      .getMany();
  }

  async cleanupExpiredTokens(): Promise<number> {
    const result = await this.repository
      .createQueryBuilder()
      .delete()
      .where('expiration_date < :now', { now: new Date() })
      .execute();
    
    return result.affected || 0;
  }

  async getTokenStats(): Promise<{
    totalTokens: number;
    activeTokens: number;
    expiredTokens: number;
  }> {
    const now = new Date();
    
    const [totalTokens, activeTokens] = await Promise.all([
      this.repository.count(),
      this.repository
        .createQueryBuilder('token')
        .where('token.expirationDate > :now', { now })
        .getCount(),
    ]);

    return {
      totalTokens,
      activeTokens,
      expiredTokens: totalTokens - activeTokens,
    };
  }
}

