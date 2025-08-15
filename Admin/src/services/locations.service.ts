import { api, PaginatedRequest, PaginatedResponse } from './api';
import { LocalizedText } from './categories.service';

export enum LocationType {
  VIEWPOINT = 'VIEWPOINT',
  RESTAURANT = 'RESTAURANT',
  HOTEL = 'HOTEL',
  ATTRACTION = 'ATTRACTION',
  PARKING = 'PARKING',
  RESTROOM = 'RESTROOM',
  GAS_STATION = 'GAS_STATION',
  HOSPITAL = 'HOSPITAL',
  SHOPPING = 'SHOPPING',
  OTHER = 'OTHER'
}

export interface Location {
  locationId: number;
  nameTextRefId: string;
  descriptionTextRefId?: string;
  addressTextRefId?: string;
  locationType: LocationType;
  latitude: number;
  longitude: number;
  altitude?: number;
  phoneNumber?: string;
  email?: string;
  website?: string;
  openingHours?: string;
  priceRange?: string;
  rating?: number;
  reviewsCount?: number;
  photoUrls?: string[];
  amenities?: string[];
  isAccessible?: boolean;
  isPetFriendly?: boolean;
  hasParking?: boolean;
  hasWifi?: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  nameTranslations?: LocalizedText[];
  descriptionTranslations?: LocalizedText[];
  addressTranslations?: LocalizedText[];
  routes?: any[];
  storiesCount?: number;
}

export interface StoryLocation {
  storyLocationId: number;
  nameTextRefId: number;
  descriptionTextRefId?: number;
  playCount: number;
  audioUrlRefId?: number;
  locationId: number;
}

export interface CreateLocationDto {
  nameTextRefId: string;
  descriptionTextRefId?: string;
  addressTextRefId?: string;
  locationType: LocationType;
  latitude: number;
  longitude: number;
  altitude?: number;
  phoneNumber?: string;
  email?: string;
  website?: string;
  openingHours?: string;
  priceRange?: string;
  amenities?: string[];
  isAccessible?: boolean;
  isPetFriendly?: boolean;
  hasParking?: boolean;
  hasWifi?: boolean;
  isActive?: boolean;
  nameTranslations?: LocalizedText[];
  descriptionTranslations?: LocalizedText[];
  addressTranslations?: LocalizedText[];
}

export interface UpdateLocationDto {
  nameTextRefId?: string;
  descriptionTextRefId?: string;
  addressTextRefId?: string;
  locationType?: LocationType;
  latitude?: number;
  longitude?: number;
  altitude?: number;
  phoneNumber?: string;
  email?: string;
  website?: string;
  openingHours?: string;
  priceRange?: string;
  amenities?: string[];
  isAccessible?: boolean;
  isPetFriendly?: boolean;
  hasParking?: boolean;
  hasWifi?: boolean;
  isActive?: boolean;
  nameTranslations?: LocalizedText[];
  descriptionTranslations?: LocalizedText[];
  addressTranslations?: LocalizedText[];
}

export interface LocationFilters extends PaginatedRequest {
  locationType?: LocationType;
  minRating?: number;
  isAccessible?: boolean;
  isPetFriendly?: boolean;
  hasParking?: boolean;
  hasWifi?: boolean;
  isActive?: boolean;
  nearLatitude?: number;
  nearLongitude?: number;
  maxDistance?: number;
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
  async getLocationsByType(type: LocationType): Promise<Location[]> {
    return api.get<Location[]>(`${this.basePath}/type/${type}`);
  }

  /**
   * Get locations nearby
   */
  async getLocationsNearby(latitude: number, longitude: number, radius: number = 5): Promise<Location[]> {
    return api.get<Location[]>(`${this.basePath}/nearby`, {
      params: { latitude, longitude, radius }
    });
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
