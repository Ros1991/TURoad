import { GoogleMapsApiRepository, RouteResult, DistanceMatrixResult, TravelMode } from '@/repositories/GoogleMapsApiRepository';
import { AppDataSource } from '@/config/database';
import { Route } from '@/entities/Route';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface DistanceTimeResult {
  distance: number;
  duration: number;
  distanceText: string;
  durationText: string;
}

export interface RouteInfo {
  distance: number;
  duration: number;
  distanceText: string;
  durationText: string;
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

export interface MatrixElement {
  originIndex: number;
  destinationIndex: number;
  distance: number;
  duration: number;
  distanceText: string;
  durationText: string;
  status: string;
}

export class GoogleMapsService {
  private googleMapsApiRepo: GoogleMapsApiRepository;

  constructor() {
    this.googleMapsApiRepo = new GoogleMapsApiRepository();
  }

  /**
   * Verifica se a API está configurada e disponível
   */
  public isAvailable(): boolean {
    return this.googleMapsApiRepo.isConfigured();
  }

  /**
   * Calcula distância e tempo entre duas coordenadas de carro
   */
  public async getDistanceAndTime(
    origin: Coordinates,
    destination: Coordinates
  ): Promise<DistanceTimeResult> {
    const result = await this.googleMapsApiRepo.calculateSimpleDistance(
      origin,
      destination,
      'DRIVE'
    );

    return {
      ...result,
      distanceText: this.formatDistance(result.distance),
      durationText: this.formatDuration(result.duration)
    };
  }

  /**
   * Calcula distância e tempo entre duas coordenadas com modo de transporte customizado
   */
  public async getDistanceAndTimeByMode(
    origin: Coordinates,
    destination: Coordinates,
    mode: TravelMode = 'DRIVE'
  ): Promise<DistanceTimeResult> {
    const result = await this.googleMapsApiRepo.calculateSimpleDistance(
      origin,
      destination,
      mode
    );

    return {
      ...result,
      distanceText: this.formatDistance(result.distance),
      durationText: this.formatDuration(result.duration)
    };
  }

  /**
   * Calcula rota completa entre duas coordenadas
   */
  public async getRoute(
    origin: Coordinates,
    destination: Coordinates,
    waypoints: Coordinates[] = []
  ): Promise<RouteInfo> {
    const result = await this.googleMapsApiRepo.calculateRoute(
      origin,
      destination,
      waypoints,
      'DRIVE'
    );

    return {
      ...result,
      distanceText: this.formatDistance(result.distance),
      durationText: this.formatDuration(result.duration)
    };
  }

  /**
   * Calcula rota otimizada entre múltiplos pontos
   */
  public async getOptimizedRoute(
    origin: Coordinates,
    destination: Coordinates,
    waypoints: Coordinates[] = []
  ): Promise<RouteInfo> {
    const result = await this.googleMapsApiRepo.calculateRoute(
      origin,
      destination,
      waypoints,
      'DRIVE',
      true, // otimizar
      false, // não evitar pedágios
      false  // não evitar rodovias
    );

    return {
      ...result,
      distanceText: this.formatDistance(result.distance),
      durationText: this.formatDuration(result.duration)
    };
  }

  /**
   * Calcula matriz de distâncias entre múltiplas origens e destinos
   */
  public async getDistanceMatrix(
    origins: Coordinates[],
    destinations: Coordinates[],
    mode: TravelMode = 'DRIVE'
  ): Promise<MatrixElement[]> {
    const results = await this.googleMapsApiRepo.calculateDistanceMatrix(
      origins,
      destinations,
      mode
    );

    return results.map((result: DistanceMatrixResult) => ({
      ...result,
      distanceText: this.formatDistance(result.distance),
      durationText: this.formatDuration(result.duration)
    }));
  }

  /**
   * Calcula distância e tempo para múltiplos destinos a partir de uma origem
   */
  public async getDistancesToMultipleDestinations(
    origin: Coordinates,
    destinations: Coordinates[]
  ): Promise<DistanceTimeResult[]> {
    const matrixResults = await this.getDistanceMatrix([origin], destinations);
    
    return matrixResults.map(result => ({
      distance: result.distance,
      duration: result.duration,
      distanceText: result.distanceText,
      durationText: result.durationText
    }));
  }

  /**
   * Encontra o destino mais próximo de uma origem
   */
  public async getClosestDestination(
    origin: Coordinates,
    destinations: Coordinates[]
  ): Promise<{ index: number; result: DistanceTimeResult }> {
    if (destinations.length === 0) {
      throw new Error('Pelo menos um destino deve ser fornecido');
    }

    const results = await this.getDistancesToMultipleDestinations(origin, destinations);
    
    let closestIndex = 0;
    let shortestDistance = results[0]?.distance || Infinity;

    results.forEach((result, index) => {
      if (result.distance < shortestDistance && result.distance > 0) {
        shortestDistance = result.distance;
        closestIndex = index;
      }
    });

    const closestResult = results[closestIndex];
    if (!closestResult) {
      throw new Error('Nenhum resultado válido encontrado');
    }

    return {
      index: closestIndex,
      result: closestResult
    };
  }

  /**
   * Calcula o tempo total de viagem para uma rota sequencial
   */
  public async getTotalTripTime(coordinates: Coordinates[]): Promise<{
    totalDistance: number;
    totalDuration: number;
    legs: DistanceTimeResult[];
    summary: {
      distanceText: string;
      durationText: string;
    };
  }> {
    if (coordinates.length < 2) {
      throw new Error('Pelo menos 2 coordenadas são necessárias');
    }

    const legs: DistanceTimeResult[] = [];
    let totalDistance = 0;
    let totalDuration = 0;

    // Calcula distância entre cada par consecutivo de pontos
    for (let i = 0; i < coordinates.length - 1; i++) {
      const current = coordinates[i];
      const next = coordinates[i + 1];
      if (!current || !next) {
        throw new Error('Invalid coordinates in route calculation');
      }
      const leg = await this.getDistanceAndTime(current, next);
      legs.push(leg);
      totalDistance += leg.distance;
      totalDuration += leg.duration;
    }

    return {
      totalDistance,
      totalDuration,
      legs,
      summary: {
        distanceText: this.formatDistance(totalDistance),
        durationText: this.formatDuration(totalDuration)
      }
    };
  }

  /**
   * Verifica se um ponto está dentro de um raio específico de outro ponto
   */
  public async isWithinRadius(
    center: Coordinates,
    point: Coordinates,
    radiusInMeters: number
  ): Promise<{ isWithin: boolean; distance: number; distanceText: string }> {
    const result = await this.getDistanceAndTime(center, point);
    
    return {
      isWithin: result.distance <= radiusInMeters,
      distance: result.distance,
      distanceText: result.distanceText
    };
  }

  /**
   * Filtra pontos que estão dentro de um raio específico
   */
  public async filterPointsWithinRadius(
    center: Coordinates,
    points: Coordinates[],
    radiusInMeters: number
  ): Promise<Array<{ index: number; coordinates: Coordinates; distance: number; distanceText: string }>> {
    const results = await this.getDistancesToMultipleDestinations(center, points);
    
    return results
      .map((result, index) => {
        const coordinates = points[index];
        if (!coordinates) {
          throw new Error(`Invalid coordinates at index ${index}`);
        }
        return {
          index,
          coordinates,
          distance: result.distance,
          distanceText: result.distanceText
        };
      })
      .filter(item => item.coordinates && item.distance <= radiusInMeters)
      .sort((a, b) => a.distance - b.distance);
  }

  /**
   * Update distances for an existing route by fetching cities and calculating route
   */
  public async updateRouteDistances(routeId: string): Promise<{ distance: number; duration: number }> {
    if (!this.isAvailable()) {
      throw new Error('Google Maps API key not configured');
    }

    try {
      const routeRepository = AppDataSource.getRepository(Route);
      const route = await routeRepository
        .createQueryBuilder('route')
        .leftJoinAndSelect('route.cities', 'routeCity')
        .leftJoinAndSelect('routeCity.city', 'city')
        .where('route.routeId = :routeId', { routeId })
        .orderBy('routeCity.order', 'ASC')
        .getOne();

      if (!route) {
        throw new Error('Route not found');
      }

      // Note: This assumes Route entity has a cities relation
      // If not available, this method needs to be updated with proper Route model
      const routeCities = (route as any).cities;
      if (!routeCities || routeCities.length < 2) {
        throw new Error('Route must have at least 2 cities');
      }

      // Convert cities to waypoints
      const cities = routeCities
        .sort((a: any, b: any) => a.order - b.order)
        .map((rc: any) => rc.city);

      const origin = { lat: cities[0].latitude, lng: cities[0].longitude };
      const destination = { lat: cities[cities.length - 1].latitude, lng: cities[cities.length - 1].longitude };
      const waypoints = cities.slice(1, -1).map((city: any) => ({ lat: city.latitude, lng: city.longitude }));

      // Calculate the complete route
      const routeResult = await this.googleMapsApiRepo.calculateRoute(
        origin,
        destination,
        waypoints,
        'DRIVE',
        true // optimize route
      );

      // Update route in database
      // Note: Using any cast because totalDistance might not exist on Route entity
      await routeRepository.update(routeId, {
        ...({totalDistance: routeResult.distance} as any),
        estimatedDuration: routeResult.duration
      } as any);

      return {
        distance: routeResult.distance,
        duration: routeResult.duration
      };

    } catch (error) {
      console.error('Error updating route distances:', error);
      throw error;
    }
  }

  /**
   * Formatar distância em metros para texto legível
   */
  private formatDistance(meters: number): string {
    if (meters >= 1000) {
      const km = (meters / 1000).toFixed(1);
      return `${km} km`;
    }
    return `${Math.round(meters)} m`;
  }

  /**
   * Formatar duração em segundos para texto legível
   */
  private formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    }
    return `${minutes}min`;
  }
}
