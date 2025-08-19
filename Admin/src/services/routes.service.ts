import { api, PaginatedRequest, PaginatedResponse } from './api';
import { LocalizedText } from './categories.service';

export interface Route {
  routeId: number;
  titleTextRefId: number;
  descriptionTextRefId?: number;
  whatToObserveTextRefId?: number;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  // Localized text fields returned by backend
  title?: string;
  description?: string;
  whatToObserve?: string;
  // Legacy support for translations
  descriptionTranslations?: LocalizedText[];
  titleTranslations?: LocalizedText[];
  whatToObserveTranslations?: LocalizedText[];
  storiesCount?: number;
  citiesCount?: number;
}

export interface StoryRoute {
  storyRouteId: number;
  nameTextRefId: number;
  descriptionTextRefId?: number;
  playCount: number;
  audioUrlRefId?: number;
  routeId: number;
  // Localized text fields returned by backend
  name?: string;
  description?: string;
  audioUrl?: string;
}

export interface CreateRouteDto {
  titleTextRefId: number;
  descriptionTextRefId?: number;
  whatToObserveTextRefId?: number;
  imageUrl?: string;
}

export interface UpdateRouteDto {
  titleTextRefId?: number;
  descriptionTextRefId?: number;
  whatToObserveTextRefId?: number;
  imageUrl?: string;
}

export interface RouteFilters extends PaginatedRequest {
  search?: string;
  cityId?: number;
  categoryId?: number;
  isActive?: boolean;
}

class RoutesService {
  private basePath = '/routes';

  /**
   * Get paginated list of routes
   */
  async getRoutes(params?: RouteFilters): Promise<PaginatedResponse<Route>> {
    return api.get<PaginatedResponse<Route>>(this.basePath, { params });
  }

  /**
   * Get featured routes
   */
  async getFeaturedRoutes(): Promise<Route[]> {
    return api.get<Route[]>(`${this.basePath}/featured`);
  }

  /**
   * Get route by ID
   */
  async getRouteById(id: number): Promise<Route> {
    return api.get<Route>(`${this.basePath}/${id}`);
  }

  /**
   * Get route with full details (locations, stories, etc.)
   */
  async getRouteDetails(id: number): Promise<Route> {
    return api.get<Route>(`${this.basePath}/${id}/details`);
  }

  /**
   * Create new route
   */
  async createRoute(data: CreateRouteDto): Promise<Route> {
    return api.post<Route>(this.basePath, data);
  }

  /**
   * Update route
   */
  async updateRoute(id: number, data: UpdateRouteDto): Promise<Route> {
    return api.put<Route>(`${this.basePath}/${id}`, data);
  }

  /**
   * Delete route
   */
  async deleteRoute(id: number): Promise<void> {
    return api.delete<void>(`${this.basePath}/${id}`);
  }

  /**
   * Toggle route status
   */
  async toggleRouteStatus(id: number): Promise<Route> {
    return api.patch<Route>(`${this.basePath}/${id}/toggle-status`);
  }

  /**
   * Toggle route featured status
   */
  async toggleFeaturedStatus(id: number): Promise<Route> {
    return api.patch<Route>(`${this.basePath}/${id}/toggle-featured`);
  }

  /**
   * Get routes by city
   */
  async getRoutesByCity(cityId: number): Promise<Route[]> {
    return api.get<Route[]>(`${this.basePath}/city/${cityId}`);
  }

  /**
   * Get routes by category
   */
  async getRoutesByCategory(categoryId: number): Promise<Route[]> {
    return api.get<Route[]>(`${this.basePath}/category/${categoryId}`);
  }

  /**
   * Upload route map
   */
  async uploadMap(id: number, file: File, onProgress?: (progress: number) => void): Promise<Route> {
    return api.upload<Route>(`${this.basePath}/${id}/map`, file, onProgress);
  }

  /**
   * Upload elevation profile
   */
  async uploadElevationProfile(id: number, file: File, onProgress?: (progress: number) => void): Promise<Route> {
    return api.upload<Route>(`${this.basePath}/${id}/elevation-profile`, file, onProgress);
  }

  /**
   * Add location to route
   */
  async addLocation(routeId: number, locationId: number, order: number): Promise<void> {
    return api.post<void>(`${this.basePath}/${routeId}/locations`, { locationId, order });
  }

  /**
   * Remove location from route
   */
  async removeLocation(routeId: number, locationId: number): Promise<void> {
    return api.delete<void>(`${this.basePath}/${routeId}/locations/${locationId}`);
  }

  /**
   * Reorder route locations
   */
  async reorderLocations(routeId: number, locationOrders: { locationId: number; order: number }[]): Promise<void> {
    return api.put<void>(`${this.basePath}/${routeId}/locations/reorder`, { locations: locationOrders });
  }

  // Story management methods
  /**
   * Get stories for a route
   */
  async getStories(routeId: number): Promise<StoryRoute[]> {
    return api.get<StoryRoute[]>(`${this.basePath}/${routeId}/stories`);
  }

  /**
   * Add story to route
   */
  async addStory(routeId: number, story: Omit<StoryRoute, 'storyRouteId' | 'routeId'>): Promise<StoryRoute> {
    return api.post<StoryRoute>(`${this.basePath}/${routeId}/stories`, story);
  }

  /**
   * Update route story
   */
  async updateStory(routeId: number, storyId: number, story: Partial<Omit<StoryRoute, 'storyRouteId' | 'routeId'>>): Promise<StoryRoute> {
    return api.put<StoryRoute>(`${this.basePath}/${routeId}/stories/${storyId}`, story);
  }

  /**
   * Delete route story
   */
  async deleteStory(routeId: number, storyId: number): Promise<void> {
    return api.delete<void>(`${this.basePath}/${routeId}/stories/${storyId}`);
  }
}

export const routesService = new RoutesService();
export default routesService;
