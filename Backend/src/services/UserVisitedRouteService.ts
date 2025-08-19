import { UserVisitedRouteRepository } from '@/repositories/UserVisitedRouteRepository';
import { UserVisitedRoute } from '@/entities/UserVisitedRoute';
import { AppError } from '@/core/errors/AppError';

export class UserVisitedRouteService {
  private userVisitedRouteRepository: UserVisitedRouteRepository;

  constructor() {
    this.userVisitedRouteRepository = new UserVisitedRouteRepository();
  }

  async getUserVisitedRoutes(userId: number): Promise<UserVisitedRoute[]> {
    try {
      return await this.userVisitedRouteRepository.findByUserId(userId);
    } catch (error) {
      console.error('Error fetching user visited routes:', error);
      throw new AppError('Failed to fetch user visited routes', 500);
    }
  }

  async addVisitedRoute(userId: number, routeId: number, visitedAt?: Date): Promise<UserVisitedRoute> {
    try {
      // Check if already exists
      const existing = await this.userVisitedRouteRepository.findByUserIdAndRouteId(userId, routeId);
      if (existing) {
        throw new AppError('Route is already marked as visited', 409);
      }

      return await this.userVisitedRouteRepository.create(userId, routeId, visitedAt);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error('Error adding visited route:', error);
      throw new AppError('Failed to add visited route', 500);
    }
  }

  async removeVisitedRoute(userId: number, routeId: number): Promise<void> {
    try {
      const existing = await this.userVisitedRouteRepository.findByUserIdAndRouteId(userId, routeId);
      if (!existing) {
        throw new AppError('Visited route not found', 404);
      }

      await this.userVisitedRouteRepository.remove(userId, routeId);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error('Error removing visited route:', error);
      throw new AppError('Failed to remove visited route', 500);
    }
  }

  async getAvailableRoutes(userId: number): Promise<any[]> {
    try {
      return await this.userVisitedRouteRepository.getAvailableRoutes(userId);
    } catch (error) {
      console.error('Error fetching available routes:', error);
      throw new AppError('Failed to fetch available routes', 500);
    }
  }
}
