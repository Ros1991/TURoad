import { apiService } from './ApiService';

export class FavoriteService {
  static async toggleFavoriteCity(userId: number, cityId: number): Promise<{isFavorited: boolean}> {
    try {
      const response = await apiService.post(`/api/users/${userId}/favorite-cities/toggle`, {
        cityId
      });
      
      if (response.success && response.data) {
        return { isFavorited: (response.data as any).isFavorited };
      }
      
      return { isFavorited: false };
    } catch (error) {
      console.error('Error toggling favorite city:', error);
      throw error;
    }
  }

  static async toggleFavoriteRoute(userId: number, routeId: number): Promise<{isFavorited: boolean}> {
    try {
      const response = await apiService.post(`/api/users/${userId}/favorite-routes/toggle`, {
        routeId
      });
      
      if (response.success && response.data) {
        return { isFavorited: (response.data as any).isFavorited };
      }
      
      return { isFavorited: false };
    } catch (error) {
      console.error('Error toggling favorite route:', error);
      throw error;
    }
  }

  static async isFavoriteCity(userId: number, cityId: number): Promise<boolean> {
    try {
      const response = await apiService.get(`/api/users/${userId}/favorite-cities/${cityId}/is-favorite`);
      
      if (response.success && response.data) {
        return (response.data as any).isFavorited || false;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking if city is favorite:', error);
      return false;
    }
  }

  static async isFavoriteRoute(userId: number, routeId: number): Promise<boolean> {
    try {
      const response = await apiService.get(`/api/users/${userId}/favorite-routes/${routeId}/is-favorite`);
      
      if (response.success && response.data) {
        return (response.data as any).isFavorited || false;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking if route is favorite:', error);
      return false;
    }
  }

  static async toggleFavoriteEvent(userId: number, eventId: number): Promise<{isFavorited: boolean}> {
    try {
      const response = await apiService.post(`/api/users/${userId}/favorite-events/toggle`, {
        eventId
      });
      
      if (response.success && response.data) {
        return { isFavorited: (response.data as any).isFavorited };
      }
      
      return { isFavorited: false };
    } catch (error) {
      console.error('Error toggling favorite event:', error);
      throw error;
    }
  }

  static async toggleFavoriteLocation(userId: number, locationId: number): Promise<{isFavorited: boolean}> {
    try {
      const response = await apiService.post(`/api/users/${userId}/favorite-locations/toggle`, {
        locationId
      });
      
      if (response.success && response.data) {
        return { isFavorited: (response.data as any).isFavorited };
      }
      
      return { isFavorited: false };
    } catch (error) {
      console.error('Error toggling favorite location:', error);
      throw error;
    }
  }

  static async isFavoriteEvent(userId: number, eventId: number): Promise<boolean> {
    try {
      const response = await apiService.get(`/api/users/${userId}/favorite-events/${eventId}/is-favorite`);
      
      if (response.success && response.data) {
        return (response.data as any).isFavorited || false;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking if event is favorite:', error);
      return false;
    }
  }

  static async isFavoriteLocation(userId: number, locationId: number): Promise<boolean> {
    try {
      const response = await apiService.get(`/api/users/${userId}/favorite-locations/${locationId}/is-favorite`);
      
      if (response.success && response.data) {
        return (response.data as any).isFavorited || false;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking if location is favorite:', error);
      return false;
    }
  }
}
