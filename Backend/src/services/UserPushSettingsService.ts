import { UserPushSettingsRepository } from '@/repositories/UserPushSettingsRepository';
import { UserPushSettings } from '@/entities/UserPushSettings';
import { AppError } from '@/utils/AppError';

export class UserPushSettingsService {
  private userPushSettingsRepository: UserPushSettingsRepository;

  constructor() {
    this.userPushSettingsRepository = new UserPushSettingsRepository();
  }

  async getUserSettings(userId: number): Promise<UserPushSettings | null> {
    return this.userPushSettingsRepository.findByUserId(userId);
  }

  async createDefaultSettings(userId: number): Promise<UserPushSettings> {
    // Check if settings already exist
    const existingSettings = await this.userPushSettingsRepository.findByUserId(userId);
    if (existingSettings) {
      throw new AppError('Push settings already exist for this user', 409);
    }

    return this.userPushSettingsRepository.createDefaultSettings(userId);
  }

  async updateSettings(userId: number, settings: Partial<UserPushSettings>): Promise<UserPushSettings> {
    const existingSettings = await this.userPushSettingsRepository.findByUserId(userId);
    if (!existingSettings) {
      throw new AppError('Push settings not found for this user', 404);
    }

    const updatedSettings = await this.userPushSettingsRepository.updateSettings(userId, settings);
    if (!updatedSettings) {
      throw new AppError('Failed to update push settings', 500);
    }

    return updatedSettings;
  }

  async deleteSettings(userId: number): Promise<void> {
    const existingSettings = await this.userPushSettingsRepository.findByUserId(userId);
    if (!existingSettings) {
      throw new AppError('Push settings not found for this user', 404);
    }

    await this.userPushSettingsRepository.deleteByUserId(userId);
  }
}
