import { City } from "../types";
import { mockedCities } from '../mocks';

// Usar o mock centralizado de cidades
const cities: City[] = mockedCities;

const recentSearches = [
  "Aracaju, Sergipe",
  "Estância, Sergipe",
  "Itabaiana, Sergipe",
];

export const getCities = async (): Promise<City[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(cities);
    }, 500);
  });
};

export const getCityById = async (id: string): Promise<City | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const city = cities.find(c => c.id === id);
      resolve(city || null);
    }, 500);
  });
};

export const searchCities = async (query: string): Promise<City[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const filteredCities = cities.filter(city => 
        city.name.toLowerCase().includes(query.toLowerCase()) ||
        city.state.toLowerCase().includes(query.toLowerCase())
      );
      resolve(filteredCities);
    }, 300);
  });
};

export const getRecentSearches = async (): Promise<string[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(recentSearches);
    }, 200);
  });
};

