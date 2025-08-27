import { Repository } from 'typeorm';
import { AppDataSource } from '@/config/database';
import { UserFavoriteLocation } from '@/entities/UserFavoriteLocation';

export class UserFavoriteLocationRepository {
  private repository: Repository<UserFavoriteLocation>;

  constructor() {
    this.repository = AppDataSource.getRepository(UserFavoriteLocation);
  }

  async findByUserId(userId: number): Promise<UserFavoriteLocation[]> {
    const favoriteLocations = await this.repository.find({
      where: { userId },
      relations: ['location'],
      order: { createdAt: 'DESC' }
    });

    // Load localized location names
    for (const favoriteLocation of favoriteLocations) {
      if (favoriteLocation.location?.nameTextRefId) {
        const localizedText = await this.repository.manager.query(
          `SELECT text_content 
           FROM localized_texts 
           WHERE reference_id = $1 AND language_code = $2`,
          [favoriteLocation.location.nameTextRefId, 'pt']
        );

        if (localizedText.length > 0) {
          (favoriteLocation.location as any).name = localizedText[0].text_content;
        }
      }
    }

    return favoriteLocations;
  }

  async findByUserIdAndLocationId(userId: number, locationId: number): Promise<UserFavoriteLocation | null> {
    return await this.repository.findOne({
      where: { userId, locationId }
    });
  }

  async create(userId: number, locationId: number): Promise<UserFavoriteLocation> {
    const favoriteLocation = this.repository.create({
      userId,
      locationId
    });

    return await this.repository.save(favoriteLocation);
  }

  async remove(userId: number, locationId: number): Promise<void> {
    await this.repository.delete({ userId, locationId });
  }

  async getAvailableLocations(userId: number): Promise<any[]> {
    const result = await this.repository.manager.query(`
      SELECT l.location_id, l.latitude, l.longitude, l.image_url,
             COALESCE(lt.text_content, 'Location') as localized_name,
             'Location' as name,
             c.state as city_name
      FROM locations l
      LEFT JOIN localized_texts lt ON l.name_text_ref_id = lt.reference_id 
        AND lt.language_code = 'pt'
      LEFT JOIN cities c ON l.city_id = c.city_id
      WHERE l.location_id NOT IN (
        SELECT ufl.location_id 
        FROM user_favorite_locations ufl 
        WHERE ufl.user_id = $1
      )
      AND l."deletedAt" IS NULL
      ORDER BY COALESCE(lt.text_content, 'Location') ASC
    `, [userId]);

    return result;
  }
}
