import { api, PaginatedRequest, PaginatedResponse } from './api';
import { LocalizedText } from './categories.service';

export interface CityFilters extends PaginatedRequest {
  search?: string;
  country?: string;
  state?: string;
  isActive?: boolean;
}

export interface City {
  cityId: number;
  nameTextRefId: number;
  descriptionTextRefId?: number;
  latitude: number;
  longitude: number;
  state: string;
  imageUrl?: string;
  whatToObserveTextRefId?: number;
  createdAt: Date;
  updatedAt: Date;
  nameTranslations?: LocalizedText[];
  descriptionTranslations?: LocalizedText[];
  routesCount?: number;
  storiesCount?: number;
}

export interface StoryCity {
  storyCityId: number;
  nameTextRefId: number;
  descriptionTextRefId?: number;
  playCount: number;
  audioUrlRefId?: number;
  cityId: number;
}

export interface CreateCityDto {
  nameTextRefId: number;
  descriptionTextRefId?: number;
  latitude: number;
  longitude: number;
  state: string;
  imageUrl?: string;
  whatToObserveTextRefId?: number;
}

export interface UpdateCityDto {
  nameTextRefId?: number;
  descriptionTextRefId?: number;
  latitude?: number;
  longitude?: number;
  state?: string;
  imageUrl?: string;
  whatToObserveTextRefId?: number;
}

class CitiesService {
  private basePath = '/cities';

  /**
   * Get all cities with filters
   */
  async getAll(filters?: CityFilters): Promise<PaginatedResponse<City>> {
    return api.get<PaginatedResponse<City>>(this.basePath, { params: filters });
  }

  /**
   * Get paginated list of cities
   */
  async getCities(params?: PaginatedRequest): Promise<PaginatedResponse<City>> {
    return api.get<PaginatedResponse<City>>(this.basePath, { params });
  }

  /**
   * Get all active cities
   */
  async getActiveCities(): Promise<City[]> {
    return api.get<City[]>(`${this.basePath}/active`);
  }

  /**
   * Get city by ID
   */
  async getCityById(id: number): Promise<City> {
    return api.get<City>(`${this.basePath}/${id}`);
  }

  /**
   * Create new city
   */
  async createCity(data: CreateCityDto): Promise<City> {
    return api.post<City>(this.basePath, data);
  }

  /**
   * Update city
   */
  async updateCity(id: number, data: UpdateCityDto): Promise<City> {
    return api.put<City>(`${this.basePath}/${id}`, data);
  }

  /**
   * Delete city
   */
  async delete(id: number): Promise<void> {
    return api.delete<void>(`${this.basePath}/${id}`);
  }

  /**
   * Delete city (legacy)
   */
  async deleteCity(id: number): Promise<void> {
    return this.delete(id);
  }

  /**
   * Toggle city active status
   */
  async toggleActive(id: number): Promise<City> {
    return api.patch<City>(`${this.basePath}/${id}/toggle-status`);
  }

  /**
   * Toggle city status (legacy)
   */
  async toggleCityStatus(id: number): Promise<City> {
    return this.toggleActive(id);
  }

  /**
   * Upload city cover image
   */
  async uploadCoverImage(id: number, file: File, onProgress?: (progress: number) => void): Promise<City> {
    return api.upload<City>(`${this.basePath}/${id}/cover-image`, file, onProgress);
  }

  /**
   * Get cities by country
   */
  async getCitiesByCountry(country: string): Promise<City[]> {
    return api.get<City[]>(`${this.basePath}/country/${country}`);
  }

  /**
   * Get cities with routes
   */
  async getCitiesWithRoutes(): Promise<City[]> {
    return api.get<City[]>(`${this.basePath}/with-routes`);
  }

  /**
   * Search cities by name or country
   */
  async searchCities(query: string): Promise<City[]> {
    return api.get<City[]>(`${this.basePath}/search`, { params: { q: query } });
  }

  // Story management methods
  /**
   * Get stories for a city
   */
  async getStories(cityId: number): Promise<StoryCity[]> {
    return api.get<StoryCity[]>(`${this.basePath}/${cityId}/stories`);
  }

  /**
   * Add story to city
   */
  async addStory(cityId: number, story: Omit<StoryCity, 'storyCityId' | 'cityId'>): Promise<StoryCity> {
    return api.post<StoryCity>(`${this.basePath}/${cityId}/stories`, story);
  }

  /**
   * Update city story
   */
  async updateStory(cityId: number, storyId: number, story: Partial<Omit<StoryCity, 'storyCityId' | 'cityId'>>): Promise<StoryCity> {
    return api.put<StoryCity>(`${this.basePath}/${cityId}/stories/${storyId}`, story);
  }

  /**
   * Delete city story
   */
  async deleteStory(cityId: number, storyId: number): Promise<void> {
    return api.delete<void>(`${this.basePath}/${cityId}/stories/${storyId}`);
  }
}

export const citiesService = new CitiesService();
export default citiesService;
