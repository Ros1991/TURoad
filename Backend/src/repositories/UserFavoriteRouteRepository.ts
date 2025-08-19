import { Repository } from 'typeorm';
import { AppDataSource } from '@/config/database';
import { UserFavoriteRoute } from '@/entities/UserFavoriteRoute';

export class UserFavoriteRouteRepository {
  private repository: Repository<UserFavoriteRoute>;

  constructor() {
    this.repository = AppDataSource.getRepository(UserFavoriteRoute);
  }

  async findByUserId(userId: number): Promise<UserFavoriteRoute[]> {
    const favoriteRoutes = await this.repository.find({
      where: { userId },
      relations: ['route'],
      order: { createdAt: 'DESC' }
    });

    // Load localized route names
    for (const favoriteRoute of favoriteRoutes) {
      if (favoriteRoute.route?.titleTextRefId) {
        const localizedText = await this.repository.manager.query(
          `SELECT text_content 
           FROM localized_texts 
           WHERE reference_id = $1 AND language_code = $2`,
          [favoriteRoute.route.titleTextRefId, 'pt']
        );

        if (localizedText.length > 0) {
          (favoriteRoute.route as any).name = localizedText[0].text_content;
        }
      }
      
      if (favoriteRoute.route?.descriptionTextRefId) {
        const localizedDesc = await this.repository.manager.query(
          `SELECT text_content 
           FROM localized_texts 
           WHERE reference_id = $1 AND language_code = $2`,
          [favoriteRoute.route.descriptionTextRefId, 'pt']
        );

        if (localizedDesc.length > 0) {
          (favoriteRoute.route as any).description = localizedDesc[0].text_content;
        }
      }
    }

    return favoriteRoutes;
  }

  async findByUserIdAndRouteId(userId: number, routeId: number): Promise<UserFavoriteRoute | null> {
    return await this.repository.findOne({
      where: { userId, routeId }
    });
  }

  async create(userId: number, routeId: number): Promise<UserFavoriteRoute> {
    const favoriteRoute = this.repository.create({
      userId,
      routeId
    });

    return await this.repository.save(favoriteRoute);
  }

  async remove(userId: number, routeId: number): Promise<void> {
    await this.repository.delete({ userId, routeId });
  }

  async getAvailableRoutes(userId: number): Promise<any[]> {
    const result = await this.repository.manager.query(`
      SELECT r.route_id, r.image_url,
             COALESCE(lt_title.text_content, 'Rota ' || r.route_id) as localized_name,
             COALESCE(lt_desc.text_content, '') as localized_description,
             COALESCE(lt_title.text_content, 'Rota ' || r.route_id) as name,
             COALESCE(lt_desc.text_content, '') as description
      FROM routes r
      LEFT JOIN localized_texts lt_title ON r.title_text_ref_id = lt_title.reference_id 
        AND lt_title.language_code = 'pt'
      LEFT JOIN localized_texts lt_desc ON r.description_text_ref_id = lt_desc.reference_id 
        AND lt_desc.language_code = 'pt'
      WHERE r.route_id NOT IN (
        SELECT ufr.route_id 
        FROM user_favorite_routes ufr 
        WHERE ufr.user_id = $1
      )
      ORDER BY COALESCE(lt_title.text_content, 'Rota ' || r.route_id) ASC
    `, [userId]);

    return result;
  }
}
