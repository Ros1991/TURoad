import { BaseRepository } from '@/core/base/BaseRepository';
import { UserPushSettings } from '@/entities/UserPushSettings';

export class UserPushSettingsRepository extends BaseRepository<UserPushSettings> {
  constructor() {
    super(UserPushSettings);
  }

  async findByUserId(userId: number): Promise<UserPushSettings | null> {
    return this.repository.findOne({
      where: { userId },
      relations: ['user']
    });
  }

  async createDefaultSettings(userId: number): Promise<UserPushSettings> {
    const settings = this.repository.create({
      userId,
      activeRouteNotifications: true,
      travelTipsNotifications: true,
      nearbyEventsNotifications: true,
      availableNarrativesNotifications: true,
      localOffersNotifications: true
    });

    return this.repository.save(settings);
  }

  async updateSettings(userId: number, settings: Partial<UserPushSettings>): Promise<UserPushSettings | null> {
    await this.repository.update({ userId }, settings);
    return this.findByUserId(userId);
  }

  async deleteByUserId(userId: number): Promise<void> {
    await this.repository.delete({ userId });
  }
}
