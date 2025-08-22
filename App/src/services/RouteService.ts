import { Category, Route } from '../types';
import { apiService } from './ApiService';

export const getCategories = async (showOnlyPrimary: boolean = false, language: string = 'pt'): Promise<Category[]> => {
  try {
    const response = await apiService.get<Category[]>('/api/public/categories', {
      params: { primary: showOnlyPrimary },
      headers: { 'Accept-Language': language },
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

export const getRoutes = async (categoryId?: string, language: string = 'pt'): Promise<Route[]> => {
  try {
    const params: any = {};
    if (categoryId) {
      params.categoryId = categoryId;
    }
    
    const response = await apiService.get<Route[]>('/api/public/routes', {
      params,
      headers: { 'Accept-Language': language },
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

export const getRouteById = async (id: string, language: string = 'pt'): Promise<Route | null> => {
  try {
    const response = await apiService.get<Route>(
      `/api/public/routes/${id}`, {
      headers: { 'Accept-Language': language },
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
