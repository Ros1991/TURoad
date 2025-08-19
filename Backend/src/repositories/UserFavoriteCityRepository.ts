import { Repository } from 'typeorm';
import { AppDataSource } from '@/config/database';
import { UserFavoriteCity } from '@/entities/UserFavoriteCity';

export class UserFavoriteCityRepository {
  private repository: Repository<UserFavoriteCity>;

  constructor() {
    this.repository = AppDataSource.getRepository(UserFavoriteCity);
  }

  async findByUserId(userId: number): Promise<UserFavoriteCity[]> {
    const favoriteCities = await this.repository.find({
      where: { userId },
      relations: ['city'],
      order: { createdAt: 'DESC' }
    });

    // Load localized city names
    for (const favoriteCity of favoriteCities) {
      if (favoriteCity.city?.nameTextRefId) {
        const localizedText = await this.repository.manager.query(
          `SELECT text_content 
           FROM localized_texts 
           WHERE reference_id = $1 AND language_code = $2`,
          [favoriteCity.city.nameTextRefId, 'pt']
        );

        if (localizedText.length > 0) {
          (favoriteCity.city as any).name = localizedText[0].text_content;
        }
      }
    }

    return favoriteCities;
  }

  async findByUserIdAndCityId(userId: number, cityId: number): Promise<UserFavoriteCity | null> {
    return await this.repository.findOne({
      where: { userId, cityId }
    });
  }

  async create(userId: number, cityId: number): Promise<UserFavoriteCity> {
    const favoriteCity = this.repository.create({
      userId,
      cityId
    });

    return await this.repository.save(favoriteCity);
  }

  async remove(userId: number, cityId: number): Promise<void> {
    await this.repository.delete({ userId, cityId });
  }

  async getAvailableCities(userId: number): Promise<any[]> {
    const result = await this.repository.manager.query(`
      SELECT c.city_id, c.state, c.latitude, c.longitude,
             COALESCE(lt.text_content, c.state) as localized_name,
             c.state as name,
             'Brasil' as country
      FROM cities c
      LEFT JOIN localized_texts lt ON c.name_text_ref_id = lt.reference_id 
        AND lt.language_code = 'pt'
      WHERE c.city_id NOT IN (
        SELECT ufc.city_id 
        FROM user_favorite_cities ufc 
        WHERE ufc.user_id = $1
      )
      ORDER BY COALESCE(lt.text_content, c.state) ASC
    `, [userId]);

    return result;
  }
}
