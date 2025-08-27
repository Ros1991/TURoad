import { Repository } from 'typeorm';
import { AppDataSource } from '@/config/database';
import { UserFavoriteCity } from '@/entities/UserFavoriteCity';
import { UserFavoriteRoute } from '@/entities/UserFavoriteRoute';
import { UserFavoriteEvent } from '@/entities/UserFavoriteEvent';
import { UserFavoriteLocation } from '@/entities/UserFavoriteLocation';

export interface UserFavoriteItem {
  id: string;
  name: string;
  type: 'city' | 'route' | 'event' | 'location';
  imageUrl: string | null;
  storiesCount: number;
  createdAt: Date;
}

export class UserFavoritesRepository {
  private favoriteCityRepo: Repository<UserFavoriteCity>;
  private favoriteRouteRepo: Repository<UserFavoriteRoute>;
  private favoriteEventRepo: Repository<UserFavoriteEvent>;
  private favoriteLocationRepo: Repository<UserFavoriteLocation>;

  constructor() {
    this.favoriteCityRepo = AppDataSource.getRepository(UserFavoriteCity);
    this.favoriteRouteRepo = AppDataSource.getRepository(UserFavoriteRoute);
    this.favoriteEventRepo = AppDataSource.getRepository(UserFavoriteEvent);
    this.favoriteLocationRepo = AppDataSource.getRepository(UserFavoriteLocation);
  }

  async getAllUserFavorites(userId: number, language: string = 'pt'): Promise<UserFavoriteItem[]> {
    const results: UserFavoriteItem[] = [];

    // Get favorite cities
    const cities = await this.favoriteCityRepo.manager.query(`
      SELECT 
        c.city_id as id,
        COALESCE(lt.text_content, 'Unnamed City') as name,
        'city' as type,
        c.image_url as imageUrl,
        COUNT(sc.story_city_id) as storiesCount,
        ufc."createdAt" as createdAt
      FROM user_favorite_cities ufc
      INNER JOIN cities c ON ufc.city_id = c.city_id
      LEFT JOIN localized_texts lt ON c.name_text_ref_id = lt.reference_id AND lt.language_code = $2
      LEFT JOIN story_cities sc ON c.city_id = sc.city_id
      WHERE ufc.user_id = $1 AND c."deletedAt" IS NULL
      GROUP BY c.city_id, lt.text_content, c.image_url, ufc."createdAt"
    `, [userId, language]);

    results.push(...cities.map((city: any) => ({
      id: city.id.toString(),
      name: city.name,
      type: 'city' as const,
      imageUrl: city.imageurl,
      storiesCount: parseInt(city.storiescount) || 0,
      createdAt: city.createdat
    })));

    // Get favorite routes
    const routes = await this.favoriteRouteRepo.manager.query(`
      SELECT 
        r.route_id as id,
        COALESCE(lt.text_content, 'Unnamed Route') as name,
        'route' as type,
        r.image_url as imageUrl,
        COUNT(sr.story_route_id) as storiesCount,
        ufr."createdAt" as createdAt
      FROM user_favorite_routes ufr
      INNER JOIN routes r ON ufr.route_id = r.route_id
      LEFT JOIN localized_texts lt ON r.title_text_ref_id = lt.reference_id AND lt.language_code = $2
      LEFT JOIN story_routes sr ON r.route_id = sr.route_id
      WHERE ufr.user_id = $1 AND r."deletedAt" IS NULL
      GROUP BY r.route_id, lt.text_content, r.image_url, ufr."createdAt"
    `, [userId, language]);

    results.push(...routes.map((route: any) => ({
      id: route.id.toString(),
      name: route.name,
      type: 'route' as const,
      imageUrl: route.imageurl,
      storiesCount: parseInt(route.storiescount) || 0,
      createdAt: route.createdat
    })));

    // Get favorite events
    const events = await this.favoriteEventRepo.manager.query(`
      SELECT 
        e.event_id as id,
        COALESCE(lt.text_content, 'Unnamed Event') as name,
        'event' as type,
        e.image_url as imageUrl,
        COUNT(se.story_event_id) as storiesCount,
        ufe."createdAt" as createdAt
      FROM user_favorite_events ufe
      INNER JOIN events e ON ufe.event_id = e.event_id
      LEFT JOIN localized_texts lt ON e.name_text_ref_id = lt.reference_id AND lt.language_code = $2
      LEFT JOIN story_events se ON e.event_id = se.event_id
      WHERE ufe.user_id = $1 AND e."deletedAt" IS NULL
      GROUP BY e.event_id, lt.text_content, e.image_url, ufe."createdAt"
    `, [userId, language]);

    results.push(...events.map((event: any) => ({
      id: event.id.toString(),
      name: event.name,
      type: 'event' as const,
      imageUrl: event.imageurl,
      storiesCount: parseInt(event.storiescount) || 0,
      createdAt: event.createdat
    })));

    // Get favorite locations with type name
    const locations = await this.favoriteLocationRepo.manager.query(`
      SELECT 
        l.location_id as id,
        COALESCE(lt.text_content, 'Unnamed Location') as name,
        COALESCE(type_lt.text_content, type_lt_pt.text_content, 'location') as type,
        l.image_url as imageUrl,
        COUNT(sl.story_location_id) as storiesCount,
        ufl."createdAt" as createdAt
      FROM user_favorite_locations ufl
      INNER JOIN locations l ON ufl.location_id = l.location_id
      LEFT JOIN localized_texts lt ON l.name_text_ref_id = lt.reference_id AND lt.language_code = $2
      LEFT JOIN types t ON l.type_id = t.type_id
      LEFT JOIN localized_texts type_lt ON t.name_text_ref_id = type_lt.reference_id AND type_lt.language_code = $2
      LEFT JOIN localized_texts type_lt_pt ON t.name_text_ref_id = type_lt_pt.reference_id AND type_lt_pt.language_code = 'pt'
      LEFT JOIN story_locations sl ON l.location_id = sl.location_id
      WHERE ufl.user_id = $1 AND l."deletedAt" IS NULL
      GROUP BY l.location_id, lt.text_content, l.image_url, ufl."createdAt", type_lt.text_content, type_lt_pt.text_content
    `, [userId, language]);

    results.push(...locations.map((location: any) => ({
      id: location.id.toString(),
      name: location.name,
      type: location.type, // Now using the actual type name from database
      imageUrl: location.imageurl,
      storiesCount: parseInt(location.storiescount) || 0,
      createdAt: location.createdat
    })));

    // Sort by createdAt desc (newest first)
    return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}
