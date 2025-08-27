import { UserFavoritesRepository, UserFavoriteItem } from '@/repositories/UserFavoritesRepository';

export class UserFavoritesService {
  private userFavoritesRepository: UserFavoritesRepository;

  constructor() {
    this.userFavoritesRepository = new UserFavoritesRepository();
  }

  async getUserFavorites(userId: number, language: string = 'pt'): Promise<UserFavoriteItem[]> {
    try {
      const favorites = await this.userFavoritesRepository.getAllUserFavorites(userId, language);
      return favorites;
    } catch (error) {
      console.error('Error fetching user favorites:', error);
      throw new Error('Failed to fetch user favorites');
    }
  }
}
