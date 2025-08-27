import { UserFavoriteLocationRepository } from '@/repositories/UserFavoriteLocationRepository';
import { UserFavoriteLocation } from '@/entities/UserFavoriteLocation';
import { AppError } from '@/core/errors/AppError';

export class UserFavoriteLocationService {
  private userFavoriteLocationRepository: UserFavoriteLocationRepository;

  constructor() {
    this.userFavoriteLocationRepository = new UserFavoriteLocationRepository();
  }

  async getUserFavoriteLocations(userId: number): Promise<UserFavoriteLocation[]> {
    try {
      return await this.userFavoriteLocationRepository.findByUserId(userId);
    } catch (error) {
      console.error('Error fetching user favorite locations:', error);
      throw new AppError('Failed to fetch user favorite locations', 500);
    }
  }

  async addFavoriteLocation(userId: number, locationId: number): Promise<UserFavoriteLocation> {
    try {
      // Check if already exists
      const existing = await this.userFavoriteLocationRepository.findByUserIdAndLocationId(userId, locationId);
      if (existing) {
        throw new AppError('Location is already in favorites', 409);
      }

      return await this.userFavoriteLocationRepository.create(userId, locationId);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error('Error adding favorite location:', error);
      throw new AppError('Failed to add favorite location', 500);
    }
  }

  async removeFavoriteLocation(userId: number, locationId: number): Promise<void> {
    try {
      const existing = await this.userFavoriteLocationRepository.findByUserIdAndLocationId(userId, locationId);
      if (!existing) {
        throw new AppError('Favorite location not found', 404);
      }

      await this.userFavoriteLocationRepository.remove(userId, locationId);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error('Error removing favorite location:', error);
      throw new AppError('Failed to remove favorite location', 500);
    }
  }

  async getAvailableLocations(userId: number): Promise<any[]> {
    try {
      return await this.userFavoriteLocationRepository.getAvailableLocations(userId);
    } catch (error) {
      console.error('Error fetching available locations:', error);
      throw new AppError('Failed to fetch available locations', 500);
    }
  }

  async isFavoriteLocation(userId: number, locationId: number): Promise<boolean> {
    try {
      const existing = await this.userFavoriteLocationRepository.findByUserIdAndLocationId(userId, locationId);
      return !!existing;
    } catch (error) {
      console.error('Error checking if location is favorite:', error);
      throw new AppError('Failed to check favorite status', 500);
    }
  }

  async toggleFavoriteLocation(userId: number, locationId: number): Promise<{ isFavorited: boolean; favoriteLocation?: UserFavoriteLocation }> {
    try {
      const existing = await this.userFavoriteLocationRepository.findByUserIdAndLocationId(userId, locationId);
      
      if (existing) {
        // Remove from favorites
        await this.userFavoriteLocationRepository.remove(userId, locationId);
        return { isFavorited: false };
      } else {
        // Add to favorites
        const favoriteLocation = await this.userFavoriteLocationRepository.create(userId, locationId);
        return { isFavorited: true, favoriteLocation };
      }
    } catch (error) {
      console.error('Error toggling favorite location:', error);
      throw new AppError('Failed to toggle favorite location', 500);
    }
  }
}
