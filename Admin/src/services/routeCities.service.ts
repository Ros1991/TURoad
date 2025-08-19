import api from './api';

export interface RouteCity {
  routeCityId: number;
  routeId: number;
  cityId: number;
  order: number;
  city?: {
    cityId: number;
    name: string;
  };
}

export interface CreateRouteCityRequest {
  cityId: number;
  order?: number;
}

export interface ReorderCitiesRequest {
  cities: { cityId: number; order: number }[];
}

class RouteCitiesService {
  private baseUrl = '/routes';

  async getCitiesByRoute(routeId: number): Promise<RouteCity[]> {
    const response = await api.get(`${this.baseUrl}/${routeId}/cities`);
    return response.data.data;
  }

  async addCityToRoute(routeId: number, data: CreateRouteCityRequest): Promise<RouteCity> {
    const response = await api.post(`${this.baseUrl}/${routeId}/cities`, data);
    return response.data.data;
  }

  async removeCityFromRoute(routeId: number, cityId: number): Promise<void> {
    await api.delete(`${this.baseUrl}/${routeId}/cities/${cityId}`);
  }

  async reorderCities(routeId: number, data: ReorderCitiesRequest): Promise<void> {
    await api.put(`${this.baseUrl}/${routeId}/cities/reorder`, data);
  }

  async getAvailableCities(routeId: number): Promise<{ city_id: number; name: string }[]> {
    const response = await api.get(`${this.baseUrl}/${routeId}/available-cities`);
    return response.data.data;
  }
}

export default new RouteCitiesService();
