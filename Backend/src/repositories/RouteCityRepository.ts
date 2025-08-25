import { BaseRepository } from '@/core/base/BaseRepository';
import { RouteCity } from '@/entities/RouteCity';

export class RouteCityRepository extends BaseRepository<RouteCity> {
  constructor() {
    super(RouteCity);
  }

  async findByRouteId(routeId: number): Promise<RouteCity[]> {
    const routeCities = await this.repository.find({
      where: { routeId },
      relations: ['city'],
      order: { order: 'ASC' }
    });

    // Load localized city names
    for (const routeCity of routeCities) {
      if (routeCity.city?.nameTextRefId) {
        const localizedText = await this.repository.manager.query(
          `SELECT text_content 
           FROM localized_texts 
           WHERE reference_id = $1 AND language_code = $2`,
          [routeCity.city.nameTextRefId, 'pt']
        );

        if (localizedText.length > 0) {
          (routeCity.city as any).name = localizedText[0].text_content;
        }
      }
    }

    return routeCities;
  }

  async findByCityId(cityId: number): Promise<RouteCity[]> {
    return this.repository.find({
      where: { cityId },
      relations: ['route'],
      order: { order: 'ASC' }
    });
  }

  async findByRouteAndCity(routeId: number, cityId: number): Promise<RouteCity | null> {
    return this.repository.findOne({
      where: { routeId, cityId },
      relations: ['city', 'route']
    });
  }

  async getMaxOrderForRoute(routeId: number): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('routeCity')
      .select('MAX(routeCity.order)', 'maxOrder')
      .where('routeCity.routeId = :routeId', { routeId })
      .getRawOne();
    
    return result?.maxOrder || 0;
  }

  async getAvailableCitiesForRoute(routeId: number): Promise<any[]> {
    const query = `
      SELECT c.city_id, lt.text_content as name
      FROM cities c
      LEFT JOIN localized_texts lt ON c.name_text_ref_id = lt.reference_id AND lt.language_code = 'pt'
      WHERE c.city_id NOT IN (
        SELECT DISTINCT rc.city_id 
        FROM route_cities rc 
        WHERE rc.route_id = $1
      )
      ORDER BY lt.text_content ASC
    `;
    
    return this.repository.manager.query(query, [routeId]);
  }

  async getAllRouteCitiesWithCoordinates(routeId?: number): Promise<any[]> {
    const query = `
      SELECT 
        rc.route_city_id,
        rc.route_id,
        rc.city_id,
        rc."order",
        c.latitude,
        c.longitude
      FROM route_cities rc
      JOIN cities c ON rc.city_id = c.city_id
      ${routeId ? 'WHERE rc.route_id = $1' : ''}
      ORDER BY rc.route_id, rc."order" ASC
    `;
    
    return this.repository.manager.query(query, routeId ? [routeId] : []);
  }

  async updateDistanceAndTime(routeCityId: number, distanceKm: number, travelTimeMinutes: number): Promise<void> {
    await this.repository.update(routeCityId, {
      distanceKm,
      travelTimeMinutes
    });
  }
}
