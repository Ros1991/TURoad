import { City } from "../types";
import { apiService } from './ApiService';

const recentSearches = [
  "Aracaju, Sergipe",
  "Estância, Sergipe",
  "Itabaiana, Sergipe",
];

export const getCities = async (search?: string): Promise<City[]> => {
  try {
    const params: any = {};
    if (search) {
      params.search = search;
    }
    
    const response = await apiService.get<City[]>('/api/public/cities', {
      params,
      includeAuth: false // Public endpoint doesn't need authentication
    });
    
    if (response.success && response.data) {
      return response.data;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching cities:', error);
    return [];
  }
};

export const getCityById = async (id: string): Promise<City | null> => {
  try {
    const cities = await getCities();
    return cities.find(c => c.id === id) || null;
  } catch (error) {
    console.error('Error fetching city by id:', error);
    return null;
  }
};

export const searchCities = async (query: string): Promise<City[]> => {
  try {
    const response = await apiService.get<City[]>('/api/public/cities/search', {
      params: { q: query },
      includeAuth: false
    });
    
    if (response.success && response.data) {
      return response.data;
    }
    
    return [];
  } catch (error) {
    console.error('Error searching cities:', error);
    return [];
  }
};

export const getRecentSearches = async (): Promise<string[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(recentSearches);
    }, 200);
  });
};

