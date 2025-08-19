import { UserFavoriteRouteRepository } from '@/repositories/UserFavoriteRouteRepository';
import { UserFavoriteRoute } from '@/entities/UserFavoriteRoute';
import { AppError } from '@/core/errors/AppError';

export class UserFavoriteRouteService {
  private userFavoriteRouteRepository: UserFavoriteRouteRepository;

  constructor() {
    this.userFavoriteRouteRepository = new UserFavoriteRouteRepository();
  }

  async getUserFavoriteRoutes(userId: number): Promise<UserFavoriteRoute[]> {
    try {
      return await this.userFavoriteRouteRepository.findByUserId(userId);
    } catch (error) {
      console.error('Error fetching user favorite routes:', error);
      throw new AppError('Failed to fetch user favorite routes', 500);
    }
  }

  async addFavoriteRoute(userId: number, routeId: number): Promise<UserFavoriteRoute> {
    try {
      // Check if already exists
      const existing = await this.userFavoriteRouteRepository.findByUserIdAndRouteId(userId, routeId);
      if (existing) {
        throw new AppError('Route is already in favorites', 409);
      }

      return await this.userFavoriteRouteRepository.create(userId, routeId);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error('Error adding favorite route:', error);
      throw new AppError('Failed to add favorite route', 500);
    }
  }

  async removeFavoriteRoute(userId: number, routeId: number): Promise<void> {
    try {
      const existing = await this.userFavoriteRouteRepository.findByUserIdAndRouteId(userId, routeId);
      if (!existing) {
        throw new AppError('Favorite route not found', 404);
      }

      await this.userFavoriteRouteRepository.remove(userId, routeId);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error('Error removing favorite route:', error);
      throw new AppError('Failed to remove favorite route', 500);
    }
  }

  async getAvailableRoutes(userId: number): Promise<any[]> {
    try {
      return await this.userFavoriteRouteRepository.getAvailableRoutes(userId);
    } catch (error) {
      console.error('Error fetching available routes:', error);
      throw new AppError('Failed to fetch available routes', 500);
    }
  }
}
