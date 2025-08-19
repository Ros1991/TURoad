import { Repository } from 'typeorm';
import { AppDataSource } from '@/config/database';
import { UserVisitedRoute } from '@/entities/UserVisitedRoute';

export class UserVisitedRouteRepository {
  private repository: Repository<UserVisitedRoute>;

  constructor() {
    this.repository = AppDataSource.getRepository(UserVisitedRoute);
  }

  async findByUserId(userId: number): Promise<UserVisitedRoute[]> {
    const visitedRoutes = await this.repository.find({
      where: { userId },
      relations: ['route'],
      order: { visitedAt: 'DESC' }
    });

    // Load localized route names
    for (const visitedRoute of visitedRoutes) {
      if (visitedRoute.route?.titleTextRefId) {
        const localizedText = await this.repository.manager.query(
          `SELECT text_content 
           FROM localized_texts 
           WHERE reference_id = $1 AND language_code = $2`,
          [visitedRoute.route.titleTextRefId, 'pt']
        );

        if (localizedText.length > 0) {
          (visitedRoute.route as any).name = localizedText[0].text_content;
        }
      }
      
      if (visitedRoute.route?.descriptionTextRefId) {
        const localizedDesc = await this.repository.manager.query(
          `SELECT text_content 
           FROM localized_texts 
           WHERE reference_id = $1 AND language_code = $2`,
          [visitedRoute.route.descriptionTextRefId, 'pt']
        );

        if (localizedDesc.length > 0) {
          (visitedRoute.route as any).description = localizedDesc[0].text_content;
        }
      }
    }

    return visitedRoutes;
  }

  async findByUserIdAndRouteId(userId: number, routeId: number): Promise<UserVisitedRoute | null> {
    return await this.repository.findOne({
      where: { userId, routeId }
    });
  }

  async create(userId: number, routeId: number, visitedAt?: Date): Promise<UserVisitedRoute> {
    const visitedRoute = this.repository.create({
      userId,
      routeId,
      visitedAt: visitedAt || new Date()
    });

    return await this.repository.save(visitedRoute);
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
        SELECT uvr.route_id 
        FROM user_visited_routes uvr 
        WHERE uvr.user_id = $1
      )
      ORDER BY COALESCE(lt_title.text_content, 'Rota ' || r.route_id) ASC
    `, [userId]);

    return result;
  }
}
