import { City } from "../types";
import { apiService } from './ApiService';

const recentSearches = [
  "Aracaju, Sergipe",
  "Estância, Sergipe",
  "Itabaiana, Sergipe",
];

export const getCities = async (language: string = 'pt'): Promise<City[]> => {
  try {
    const response = await apiService.get<City[]>('/api/public/cities', {
      headers: { 'Accept-Language': language },
      includeAuth: false
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

export const getCityById = async (id: string, language: string = 'pt'): Promise<City | null> => {
  try {
    const cities = await getCities(language);
    return cities.find(c => c.id === id) || null;
  } catch (error) {
    console.error('Error fetching city by id:', error);
    return null;
  }
};

export const searchCities = async (query: string, language: string = 'pt'): Promise<City[]> => {
  try {
    const response = await apiService.get<City[]>('/api/public/cities/search', {
      params: { q: query },
      headers: { 'Accept-Language': language },
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

