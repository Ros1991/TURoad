import { api, PaginatedRequest, PaginatedResponse } from './api';
import { LocalizedText } from './categories.service';


export interface Location {
  locationId: number;
  cityId: number;
  nameTextRefId: number;
  descriptionTextRefId?: number;
  latitude?: number;
  longitude?: number;
  typeId?: number;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  city?: {
    cityId: number;
    nameTextRefId: number;
    state: string;
    name?: string;
  };
  // Localized text fields returned by backend
  name?: string;
  description?: string;
  // Legacy support for translations
  nameTranslations?: LocalizedText[];
  descriptionTranslations?: LocalizedText[];
  storiesCount?: number;
}

export interface StoryLocation {
  storyLocationId: number;
  nameTextRefId: number;
  descriptionTextRefId?: number;
  playCount: number;
  audioUrlRefId?: number;
  locationId: number;
  // Localized text fields returned by backend
  name?: string;
  description?: string;
  audioUrl?: string;
}

export interface CreateLocationDto {
  nameTextRefId: number;
  descriptionTextRefId?: number;
  cityId: number;
  typeId?: number;
  latitude?: number;
  longitude?: number;
  imageUrl?: string;
}

export interface UpdateLocationDto {
  nameTextRefId?: number;
  descriptionTextRefId?: number;
  cityId?: number;
  typeId?: number;
  latitude?: number;
  longitude?: number;
  imageUrl?: string;
}

export interface LocationFilters extends PaginatedRequest {
  search?: string;
  cityId?: number;
  typeId?: number;
  isActive?: boolean;
}

class LocationsService {
  private basePath = '/locations';

  /**
   * Get paginated list of locations
   */
  async getLocations(params?: LocationFilters): Promise<PaginatedResponse<Location>> {
    return api.get<PaginatedResponse<Location>>(this.basePath, { params });
  }

  /**
   * Get location by ID
   */
  async getLocationById(id: number): Promise<Location> {
    return api.get<Location>(`${this.basePath}/${id}`);
  }

  /**
   * Get locations by type
   */
  async getLocationsByType(typeId: number): Promise<Location[]> {
    return api.get<Location[]>(`${this.basePath}/type/${typeId}`);
  }

  /**
   * Get locations by city
   */
  async getLocationsByCity(cityId: number): Promise<Location[]> {
    return api.get<Location[]>(`${this.basePath}/city/${cityId}`);
  }

  // Story management methods
  /**
   * Get stories for a location
   */
  async getStories(locationId: number): Promise<StoryLocation[]> {
    return api.get<StoryLocation[]>(`${this.basePath}/${locationId}/stories`);
  }

  /**
   * Add story to location
   */
  async addStory(locationId: number, story: Omit<StoryLocation, 'storyLocationId' | 'locationId'>): Promise<StoryLocation> {
    return api.post<StoryLocation>(`${this.basePath}/${locationId}/stories`, story);
  }

  /**
   * Update location story
   */
  async updateStory(locationId: number, storyId: number, story: Partial<Omit<StoryLocation, 'storyLocationId' | 'locationId'>>): Promise<StoryLocation> {
    return api.put<StoryLocation>(`${this.basePath}/${locationId}/stories/${storyId}`, story);
  }

  /**
   * Delete location story
   */
  async deleteStory(locationId: number, storyId: number): Promise<void> {
    return api.delete<void>(`${this.basePath}/${locationId}/stories/${storyId}`);
  }

  /**
   * Create new location
   */
  async createLocation(data: CreateLocationDto): Promise<Location> {
    return api.post<Location>(this.basePath, data);
  }

  /**
   * Update location
   */
  async updateLocation(id: number, data: UpdateLocationDto): Promise<Location> {
    return api.put<Location>(`${this.basePath}/${id}`, data);
  }

  /**
   * Delete location
   */
  async deleteLocation(id: number): Promise<void> {
    return api.delete<void>(`${this.basePath}/${id}`);
  }

  /**
   * Toggle location status
   */
  async toggleLocationStatus(id: number): Promise<Location> {
    return api.patch<Location>(`${this.basePath}/${id}/toggle-status`);
  }

  /**
   * Upload location photos
   */
  async uploadPhotos(id: number, files: File[], onProgress?: (progress: number) => void): Promise<Location> {
    const formData = new FormData();
    files.forEach(file => formData.append('photos', file));

    return api.post<Location>(`${this.basePath}/${id}/photos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });
  }

  /**
   * Delete location photo
   */
  async deletePhoto(id: number, photoUrl: string): Promise<Location> {
    return api.delete<Location>(`${this.basePath}/${id}/photos`, {
      data: { photoUrl }
    });
  }

  /**
   * Get locations for route
   */
  async getLocationsForRoute(routeId: number): Promise<Location[]> {
    return api.get<Location[]>(`${this.basePath}/route/${routeId}`);
  }

  /**
   * Search locations by name or address
   */
  async searchLocations(query: string): Promise<Location[]> {
    return api.get<Location[]>(`${this.basePath}/search`, { params: { q: query } });
  }
}

export const locationsService = new LocationsService();
export default locationsService;
