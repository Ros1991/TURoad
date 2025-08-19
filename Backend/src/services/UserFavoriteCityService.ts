import { UserFavoriteCityRepository } from '@/repositories/UserFavoriteCityRepository';
import { UserFavoriteCity } from '@/entities/UserFavoriteCity';
import { AppError } from '@/core/errors/AppError';

export class UserFavoriteCityService {
  private userFavoriteCityRepository: UserFavoriteCityRepository;

  constructor() {
    this.userFavoriteCityRepository = new UserFavoriteCityRepository();
  }

  async getUserFavoriteCities(userId: number): Promise<UserFavoriteCity[]> {
    try {
      return await this.userFavoriteCityRepository.findByUserId(userId);
    } catch (error) {
      console.error('Error fetching user favorite cities:', error);
      throw new AppError('Failed to fetch user favorite cities', 500);
    }
  }

  async addFavoriteCity(userId: number, cityId: number): Promise<UserFavoriteCity> {
    try {
      // Check if already exists
      const existing = await this.userFavoriteCityRepository.findByUserIdAndCityId(userId, cityId);
      if (existing) {
        throw new AppError('City is already in favorites', 409);
      }

      return await this.userFavoriteCityRepository.create(userId, cityId);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error('Error adding favorite city:', error);
      throw new AppError('Failed to add favorite city', 500);
    }
  }

  async removeFavoriteCity(userId: number, cityId: number): Promise<void> {
    try {
      const existing = await this.userFavoriteCityRepository.findByUserIdAndCityId(userId, cityId);
      if (!existing) {
        throw new AppError('Favorite city not found', 404);
      }

      await this.userFavoriteCityRepository.remove(userId, cityId);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error('Error removing favorite city:', error);
      throw new AppError('Failed to remove favorite city', 500);
    }
  }

  async getAvailableCities(userId: number): Promise<any[]> {
    try {
      return await this.userFavoriteCityRepository.getAvailableCities(userId);
    } catch (error) {
      console.error('Error fetching available cities:', error);
      throw new AppError('Failed to fetch available cities', 500);
    }
  }
}
