import { Category, Route, CategoryWithRoutes } from '../types';
import { apiService } from './ApiService';

export const getCategories = async (showOnlyPrimary: boolean = false, search?: string, cityId?: string): Promise<Category[]> => {
  try {
    const params: any = { primary: showOnlyPrimary };
    if (search) {
      params.search = search;
    }
    if (cityId) {
      params.cityId = cityId;
    }
    
    const response = await apiService.get<Category[]>('/api/public/categories', {
      params,
      includeAuth: false // Public endpoint doesn't need authentication
    });
    
    if (response.success && response.data) {
      return response.data;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

export const getRoutes = async (categoryId?: string, search?: string, cityId?: string): Promise<Route[]> => {
  try {
    const params: any = {};
    if (categoryId) {
      params.categoryId = categoryId;
    }
    if (search) {
      params.search = search;
    }
    if (cityId) {
      params.cityId = cityId;
    }
    
    const response = await apiService.get<Route[]>('/api/public/routes', {
      params,
      includeAuth: false // Public endpoint doesn't need authentication
    });
    
    if (response.success && response.data) {
      return response.data;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching routes:', error);
    return [];
  }
};

export const getCategoriesWithRoutes = async (): Promise<CategoryWithRoutes[]> => {
  try {
    const response = await apiService.get<CategoryWithRoutes[]>('/api/public/categories/with-routes', {
      includeAuth: false // Public endpoint doesn't need authentication
    });

    if (response.success && response.data) {
      // Garantir que routes seja sempre um array válido
      return response.data.map(category => ({
        ...category,
        routes: Array.isArray(category.routes) ? category.routes : []
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching categories with routes:', error);
    return [];
  }
};

export const getRouteById = async (id: string): Promise<Route | null> => {
  try {
    const response = await apiService.get<Route>(
      `/api/public/routes/${id}`, {
      includeAuth: false // Public endpoint doesn't need authentication
    });
    
    if (response.success && response.data) {
      return response.data;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching route by id:', error);
    return null;
  }
};

export const getRouteBusinesses = async (routeId: string): Promise<any[]> => {
  try {
    const response = await apiService.get<any[]>(
      `/api/public/routes/${routeId}/businesses`, {
      includeAuth: false // Location headers are automatically included
    });
    
    if (response.success && response.data) {
      return response.data;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching route businesses:', error);
    return [];
  }
};

export const getRouteHosting = async (routeId: string): Promise<any[]> => {
  try {
    const response = await apiService.get<any[]>(
      `/api/public/routes/${routeId}/hosting`, {
      includeAuth: false // Location headers are automatically included
    });
    
    if (response.success && response.data) {
      return response.data;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching route hosting:', error);
    return [];
  }
};
