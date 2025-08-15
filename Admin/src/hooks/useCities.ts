import { useState, useCallback } from 'react';
import { usePaginatedApi, useApi } from './useApi';
import citiesService, { City, CreateCityDto, UpdateCityDto } from '../services/cities.service';
import { useToast } from './useToast';

export const useCities = (initialParams?: any) => {
  const toast = useToast();
  const paginatedApi = usePaginatedApi<City>(
    citiesService.getCities.bind(citiesService),
    initialParams
  );

  const createCity = useApi(citiesService.createCity.bind(citiesService), {
    onSuccess: () => {
      toast.success('City created successfully');
      paginatedApi.refresh();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create city');
    }
  });

  const updateCity = useApi(citiesService.updateCity.bind(citiesService), {
    onSuccess: () => {
      toast.success('City updated successfully');
      paginatedApi.refresh();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update city');
    }
  });

  const deleteCity = useApi(citiesService.deleteCity.bind(citiesService), {
    onSuccess: () => {
      toast.success('City deleted successfully');
      paginatedApi.refresh();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete city');
    }
  });

  const toggleStatus = useApi(citiesService.toggleCityStatus.bind(citiesService), {
    onSuccess: () => {
      toast.success('City status updated');
      paginatedApi.refresh();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update city status');
    }
  });

  return {
    ...paginatedApi,
    createCity: createCity.execute,
    updateCity: updateCity.execute,
    deleteCity: deleteCity.execute,
    toggleStatus: toggleStatus.execute,
    creating: createCity.loading,
    updating: updateCity.loading,
    deleting: deleteCity.loading,
  };
};

export const useCity = (cityId: number) => {
  const toast = useToast();
  const [city, setCity] = useState<City | null>(null);

  const { data, loading, error, execute: fetchCity } = useApi(
    () => citiesService.getCityById(cityId),
    {
      immediate: true,
      onSuccess: (data) => setCity(data),
      onError: (error) => toast.error(error.message || 'Failed to load city')
    }
  );

  const updateCity = useCallback(async (data: UpdateCityDto) => {
    try {
      const updated = await citiesService.updateCity(cityId, data);
      setCity(updated);
      toast.success('City updated successfully');
      return updated;
    } catch (error: any) {
      toast.error(error.message || 'Failed to update city');
      throw error;
    }
  }, [cityId, toast]);

  const uploadCoverImage = useCallback(async (file: File, onProgress?: (progress: number) => void) => {
    try {
      const updated = await citiesService.uploadCoverImage(cityId, file, onProgress);
      setCity(updated);
      toast.success('Cover image uploaded successfully');
      return updated;
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload cover image');
      throw error;
    }
  }, [cityId, toast]);

  return {
    city: city || data,
    loading,
    error,
    refresh: fetchCity,
    updateCity,
    uploadCoverImage,
  };
};

export const useActiveCities = () => {
  const toast = useToast();
  return useApi(citiesService.getActiveCities.bind(citiesService), {
    immediate: true,
    onError: (error) => toast.error(error.message || 'Failed to load cities')
  });
};

export const useCitiesByCountry = (country: string) => {
  const toast = useToast();
  return useApi(
    () => citiesService.getCitiesByCountry(country),
    {
      immediate: true,
      onError: (error) => toast.error(error.message || 'Failed to load cities')
    }
  );
};

export const useCitySearch = () => {
  const toast = useToast();
  const [results, setResults] = useState<City[]>([]);
  const [searching, setSearching] = useState(false);

  const search = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setSearching(true);
    try {
      const cities = await citiesService.searchCities(query);
      setResults(cities);
    } catch (error: any) {
      toast.error(error.message || 'Search failed');
      setResults([]);
    } finally {
      setSearching(false);
    }
  }, [toast]);

  return {
    results,
    searching,
    search,
    clear: () => setResults([]),
  };
};

export default useCities;
