import axios, { AxiosResponse } from 'axios';
import { config } from '../config/environment';

// Routes API interfaces
interface RoutesApiLocation {
  latLng: {
    latitude: number;
    longitude: number;
  };
}

interface RoutesApiWaypoint {
  location: RoutesApiLocation;
  stopover?: boolean;
}

interface RouteMatrixWaypoint {
  waypoint: RoutesApiWaypoint;
  routeModifiers?: {
    avoid_ferries?: boolean;
    avoid_highways?: boolean;
    avoid_tolls?: boolean;
  };
}

interface ComputeRoutesRequest {
  origin: RoutesApiWaypoint;
  destination: RoutesApiWaypoint;
  intermediates?: RoutesApiWaypoint[];
  travelMode: 'DRIVE' | 'BICYCLE' | 'WALK' | 'TRANSIT' | 'TWO_WHEELER';
  routingPreference?: 'TRAFFIC_UNAWARE' | 'TRAFFIC_AWARE' | 'TRAFFIC_AWARE_OPTIMAL';
  computeAlternativeRoutes?: boolean;
  routeModifiers?: {
    avoidTolls?: boolean;
    avoidHighways?: boolean;
    avoidFerries?: boolean;
  };
  languageCode?: string;
  units?: 'IMPERIAL' | 'METRIC';
}

interface ComputeRouteMatrixRequest {
  origins: RouteMatrixWaypoint[];
  destinations: RouteMatrixWaypoint[];
  travelMode: 'DRIVE' | 'BICYCLE' | 'WALK' | 'TRANSIT' | 'TWO_WHEELER';
  routingPreference?: 'TRAFFIC_UNAWARE' | 'TRAFFIC_AWARE' | 'TRAFFIC_AWARE_OPTIMAL';
  departureTime?: string;
  arrivalTime?: string;
  languageCode?: string;
  regionCode?: string;
  units?: 'METRIC' | 'IMPERIAL';
  extraComputations?: string[];
  trafficModel?: 'BEST_GUESS' | 'PESSIMISTIC' | 'OPTIMISTIC';
}

interface RoutesApiRoute {
  distanceMeters: number;
  duration: string;
  staticDuration?: string;
  polyline: {
    encodedPolyline: string;
  };
  legs: Array<{
    distanceMeters: number;
    duration: string;
    staticDuration?: string;
    startLocation: {
      latLng: {
        latitude: number;
        longitude: number;
      };
    };
    endLocation: {
      latLng: {
        latitude: number;
        longitude: number;
      };
    };
  }>;
  travelAdvisory?: {
    tollInfo?: {
      estimatedPrice: Array<{
        currencyCode: string;
        units: string;
        nanos: number;
      }>;
    };
  };
}

interface ComputeRoutesResponse {
  routes: RoutesApiRoute[];
}

interface RouteMatrixElement {
  originIndex?: number;
  destinationIndex?: number;
  status?: {
    code: number;
    message?: string;
  };
  condition?: 'ROUTE_EXISTS' | 'ROUTE_NOT_FOUND';
  distanceMeters?: number;
  duration?: string;
  staticDuration?: string;
}

interface ComputeRouteMatrixResponse {
  elements: RouteMatrixElement[];
}

// Repository interfaces
export interface DistanceMatrixResult {
  originIndex: number;
  destinationIndex: number;
  distance: number;
  duration: number;
  status: string;
}

export interface RouteResult {
  distance: number;
  duration: number;
  polyline: string;
  legs: Array<{
    distance: number;
    duration: number;
    startLat: number;
    startLng: number;
    endLat: number;
    endLng: number;
  }>;
  tollInfo?: {
    estimatedPrice?: number;
    currencyCode?: string;
  };
}

export type TravelMode = 'DRIVE' | 'BICYCLE' | 'WALK' | 'TRANSIT' | 'TWO_WHEELER';
export type RoutingPreference = 'TRAFFIC_UNAWARE' | 'TRAFFIC_AWARE' | 'TRAFFIC_AWARE_OPTIMAL';

export class GoogleMapsApiRepository {
  private readonly baseUrl = 'https://routes.googleapis.com/directions/v2';
  private readonly distanceMatrixUrl = 'https://routes.googleapis.com/distanceMatrix/v2';
  private readonly apiKey: string;

  constructor() {
    this.apiKey = config.googleMaps.apiKey;
    
    if (!this.apiKey) {
      console.warn('Google Maps API key not configured');
    }
  }

  /**
   * Check if the repository is properly configured
   */
  public isConfigured(): boolean {
    return !!this.apiKey;
  }

  /**
   * Convert duration string to seconds
   */
  private parseDuration(duration: string): number {
    // Duration format: "123s" or "123.456s"
    const match = duration.match(/^(\d+(?:\.\d+)?)s$/);
    return match && match[1] ? parseFloat(match[1]) : 0;
  }

  /**
   * Create waypoint for Routes API (computeRoutes)
   */
  private createWaypoint(lat: number, lng: number): RoutesApiWaypoint {
    return {
      location: {
        latLng: {
          latitude: lat,
          longitude: lng
        }
      }
    };
  }

  /**
   * Create matrix waypoint for Route Matrix API (computeRouteMatrix)
   */
  private createMatrixWaypoint(lat: number, lng: number): RouteMatrixWaypoint {
    return {
      waypoint: {
        location: {
          latLng: {
            latitude: lat,
            longitude: lng
          }
        }
      }
    };
  }

  /**
   * Calculate route using Routes API
   */
  public async calculateRoute(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
    waypoints: Array<{ lat: number; lng: number }> = [],
    mode: TravelMode = 'DRIVE',
    optimize: boolean = false,
    avoidTolls: boolean = false,
    avoidHighways: boolean = false
  ): Promise<RouteResult> {
    if (!this.isConfigured()) {
      throw new Error('Google Maps API key not configured');
    }

    try {
      const intermediates = waypoints.map(wp => this.createWaypoint(wp.lat, wp.lng));
      
      const request: ComputeRoutesRequest = {
        origin: this.createWaypoint(origin.lat, origin.lng),
        destination: this.createWaypoint(destination.lat, destination.lng),
        intermediates: intermediates.length > 0 ? intermediates : undefined,
        travelMode: mode,
        routingPreference: optimize ? 'TRAFFIC_AWARE_OPTIMAL' : 'TRAFFIC_AWARE',
        routeModifiers: {
          avoidTolls,
          avoidHighways,
          avoidFerries: false
        },
        languageCode: 'pt-BR',
        units: 'METRIC'
      };

      const response: AxiosResponse<ComputeRoutesResponse> = await axios.post(
        `${this.baseUrl}:computeRoutes`,
        request,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': this.apiKey || '',
            'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline,routes.legs,routes.travelAdvisory.tollInfo'
          }
        }
      );

      if (!response.data.routes || response.data.routes.length === 0) {
        throw new Error('No route found');
      }

      const route = response.data.routes[0]!;
      const legs = route.legs.map((leg: RoutesApiRoute['legs'][number]) => ({
        distance: leg.distanceMeters,
        duration: this.parseDuration(leg.duration),
        startLat: leg.startLocation.latLng.latitude,
        startLng: leg.startLocation.latLng.longitude,
        endLat: leg.endLocation.latLng.latitude,
        endLng: leg.endLocation.latLng.longitude
      }));

      const result: RouteResult = {
        distance: route.distanceMeters,
        duration: this.parseDuration(route.duration),
        polyline: route.polyline.encodedPolyline,
        legs
      };

      // Add toll information if available
      if (route.travelAdvisory?.tollInfo?.estimatedPrice && route.travelAdvisory.tollInfo.estimatedPrice.length > 0) {
        const tollPrice = route.travelAdvisory.tollInfo.estimatedPrice[0]!;
        result.tollInfo = {
          estimatedPrice: parseFloat(tollPrice.units) + (tollPrice.nanos / 1e9),
          currencyCode: tollPrice.currencyCode
        };
      }

      return result;

    } catch (error: unknown) {
      console.error('Error calculating route:', error);
      throw new Error(`Failed to calculate route: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Calculate distance matrix using Routes API
   */
  public async calculateDistanceMatrix(
    origins: Array<{ lat: number; lng: number }>,
    destinations: Array<{ lat: number; lng: number }>,
    mode: TravelMode = 'DRIVE'
  ): Promise<DistanceMatrixResult[]> {
    if (!this.isConfigured()) {
      throw new Error('Google Maps API key not configured');
    }

    if (origins.length * destinations.length > 625) {
      throw new Error('Too many elements in matrix. Maximum is 625 elements.');
    }

    try {
      const request: ComputeRouteMatrixRequest = {
        origins: origins.map(origin => this.createMatrixWaypoint(origin.lat, origin.lng)),
        destinations: destinations.map(dest => this.createMatrixWaypoint(dest.lat, dest.lng)),
        travelMode: mode,
        routingPreference: 'TRAFFIC_AWARE',
        languageCode: 'pt-BR',
        units: 'METRIC'
      };

      const response: AxiosResponse<ComputeRouteMatrixResponse> = await axios.post(
        `${this.distanceMatrixUrl}:computeRouteMatrix`,
        request,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': this.apiKey || '',
            'X-Goog-FieldMask': 'originIndex,destinationIndex,status,condition,distanceMeters,duration'
          }
        }
      );

      // The response is directly an array of elements, not wrapped in an 'elements' property
      if (!Array.isArray(response.data)) {
        console.error('Response data structure:', response.data);
        throw new Error('Invalid response structure - expected array of elements');
      }

      return response.data.map((element: RouteMatrixElement) => ({
        originIndex: element.originIndex || 0,
        destinationIndex: element.destinationIndex || 0,
        distance: element.distanceMeters || 0,
        duration: element.duration ? this.parseDuration(element.duration) : 0,
        status: element.condition || 'UNKNOWN'
      }));

    } catch (error: unknown) {
      console.error('Google Route Matrix API error:', error);
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(`Route Matrix API error: ${error.response.status} - ${error.response.data?.error?.message || 'Unknown error'}`);
      }
      throw new Error(`Failed to calculate distance matrix: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Calculate simple distance between two points
   */
  public async calculateSimpleDistance(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
    mode: TravelMode = 'DRIVE'
  ): Promise<{ distance: number; duration: number }> {
    const results = await this.calculateDistanceMatrix([origin], [destination], mode);
    
    if (results.length === 0) {
      throw new Error('No distance calculation result');
    }

    const result = results[0];
    if (!result) {
      throw new Error('No distance calculation result');
    }
    
    if (result.status !== 'ROUTE_EXISTS') {
      throw new Error(`Route not found: ${result.status}`);
    }

    return {
      distance: result.distance,
      duration: result.duration
    };
  }
}
