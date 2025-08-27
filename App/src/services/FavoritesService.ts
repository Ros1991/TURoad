import { apiService } from './ApiService';

export interface UserFavoriteItem {
  id: string;
  name: string;
  type: 'city' | 'route' | 'event' | 'location';
  imageUrl: string | null;
  storiesCount: number;
  createdAt: string;
}

export interface FavoritesResponse {
  success: boolean;
  data: UserFavoriteItem[];
}

class FavoritesService {
  async getUserFavorites(): Promise<UserFavoriteItem[]> {
    try {
      const response = await apiService.get<UserFavoriteItem[]>('/api/public/users/favorites');
      
      if (response.success && response.data) {
        return response.data;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching user favorites:', error);
      throw error;
    }
  }
}

export const favoritesService = new FavoritesService();
