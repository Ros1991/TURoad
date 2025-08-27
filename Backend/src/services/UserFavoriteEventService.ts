import { UserFavoriteEventRepository } from '@/repositories/UserFavoriteEventRepository';
import { UserFavoriteEvent } from '@/entities/UserFavoriteEvent';
import { AppError } from '@/core/errors/AppError';

export class UserFavoriteEventService {
  private userFavoriteEventRepository: UserFavoriteEventRepository;

  constructor() {
    this.userFavoriteEventRepository = new UserFavoriteEventRepository();
  }

  async getUserFavoriteEvents(userId: number): Promise<UserFavoriteEvent[]> {
    try {
      return await this.userFavoriteEventRepository.findByUserId(userId);
    } catch (error) {
      console.error('Error fetching user favorite events:', error);
      throw new AppError('Failed to fetch user favorite events', 500);
    }
  }

  async addFavoriteEvent(userId: number, eventId: number): Promise<UserFavoriteEvent> {
    try {
      // Check if already exists
      const existing = await this.userFavoriteEventRepository.findByUserIdAndEventId(userId, eventId);
      if (existing) {
        throw new AppError('Event is already in favorites', 409);
      }

      return await this.userFavoriteEventRepository.create(userId, eventId);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error('Error adding favorite event:', error);
      throw new AppError('Failed to add favorite event', 500);
    }
  }

  async removeFavoriteEvent(userId: number, eventId: number): Promise<void> {
    try {
      const existing = await this.userFavoriteEventRepository.findByUserIdAndEventId(userId, eventId);
      if (!existing) {
        throw new AppError('Favorite event not found', 404);
      }

      await this.userFavoriteEventRepository.remove(userId, eventId);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error('Error removing favorite event:', error);
      throw new AppError('Failed to remove favorite event', 500);
    }
  }

  async getAvailableEvents(userId: number): Promise<any[]> {
    try {
      return await this.userFavoriteEventRepository.getAvailableEvents(userId);
    } catch (error) {
      console.error('Error fetching available events:', error);
      throw new AppError('Failed to fetch available events', 500);
    }
  }

  async isFavoriteEvent(userId: number, eventId: number): Promise<boolean> {
    try {
      const existing = await this.userFavoriteEventRepository.findByUserIdAndEventId(userId, eventId);
      return !!existing;
    } catch (error) {
      console.error('Error checking if event is favorite:', error);
      throw new AppError('Failed to check favorite status', 500);
    }
  }

  async toggleFavoriteEvent(userId: number, eventId: number): Promise<{ isFavorited: boolean; favoriteEvent?: UserFavoriteEvent }> {
    try {
      const existing = await this.userFavoriteEventRepository.findByUserIdAndEventId(userId, eventId);
      
      if (existing) {
        // Remove from favorites
        await this.userFavoriteEventRepository.remove(userId, eventId);
        return { isFavorited: false };
      } else {
        // Add to favorites
        const favoriteEvent = await this.userFavoriteEventRepository.create(userId, eventId);
        return { isFavorited: true, favoriteEvent };
      }
    } catch (error) {
      console.error('Error toggling favorite event:', error);
      throw new AppError('Failed to toggle favorite event', 500);
    }
  }
}
