import { useState, useCallback } from 'react';
import { usePaginatedApi, useApi } from './useApi';
import locationsService, { 
  Location, 
  CreateLocationDto, 
  UpdateLocationDto, 
  LocationFilters, 
  LocationType 
} from '../services/locations.service';
import { useToast } from './useToast';

export const useLocations = (initialParams?: LocationFilters) => {
  const toast = useToast();
  const paginatedApi = usePaginatedApi<Location>(
    locationsService.getLocations.bind(locationsService),
    initialParams
  );

  const createLocation = useApi(locationsService.createLocation.bind(locationsService), {
    onSuccess: () => {
      toast.success('Location created successfully');
      paginatedApi.refresh();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create location');
    }
  });

  const updateLocation = useApi(locationsService.updateLocation.bind(locationsService), {
    onSuccess: () => {
      toast.success('Location updated successfully');
      paginatedApi.refresh();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update location');
    }
  });

  const deleteLocation = useApi(locationsService.deleteLocation.bind(locationsService), {
    onSuccess: () => {
      toast.success('Location deleted successfully');
      paginatedApi.refresh();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete location');
    }
  });

  const toggleStatus = useApi(locationsService.toggleLocationStatus.bind(locationsService), {
    onSuccess: () => {
      toast.success('Location status updated');
      paginatedApi.refresh();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update location status');
    }
  });

  return {
    ...paginatedApi,
    createLocation: createLocation.execute,
    updateLocation: updateLocation.execute,
    deleteLocation: deleteLocation.execute,
    toggleStatus: toggleStatus.execute,
    creating: createLocation.loading,
    updating: updateLocation.loading,
    deleting: deleteLocation.loading,
  };
};

export const useLocation = (locationId: number) => {
  const toast = useToast();
  const [location, setLocation] = useState<Location | null>(null);

  const { data, loading, error, execute: fetchLocation } = useApi(
    () => locationsService.getLocationById(locationId),
    {
      immediate: true,
      onSuccess: (data) => setLocation(data),
      onError: (error) => toast.error(error.message || 'Failed to load location')
    }
  );

  const updateLocation = useCallback(async (data: UpdateLocationDto) => {
    try {
      const updated = await locationsService.updateLocation(locationId, data);
      setLocation(updated);
      toast.success('Location updated successfully');
      return updated;
    } catch (error: any) {
      toast.error(error.message || 'Failed to update location');
      throw error;
    }
  }, [locationId, toast]);

  const uploadPhotos = useCallback(async (files: File[], onProgress?: (progress: number) => void) => {
    try {
      const updated = await locationsService.uploadPhotos(locationId, files, onProgress);
      setLocation(updated);
      toast.success('Photos uploaded successfully');
      return updated;
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload photos');
      throw error;
    }
  }, [locationId, toast]);

  const deletePhoto = useCallback(async (photoUrl: string) => {
    try {
      const updated = await locationsService.deletePhoto(locationId, photoUrl);
      setLocation(updated);
      toast.success('Photo deleted successfully');
      return updated;
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete photo');
      throw error;
    }
  }, [locationId, toast]);

  return {
    location: location || data,
    loading,
    error,
    refresh: fetchLocation,
    updateLocation,
    uploadPhotos,
    deletePhoto,
  };
};

export const useLocationsByType = (type: LocationType) => {
  const toast = useToast();
  return useApi(
    () => locationsService.getLocationsByType(type),
    {
      immediate: true,
      onError: (error) => toast.error(error.message || 'Failed to load locations')
    }
  );
};

export const useNearbyLocations = (latitude: number, longitude: number, maxDistance?: number) => {
  const toast = useToast();
  return useApi(
    () => locationsService.getNearbyLocations(latitude, longitude, maxDistance),
    {
      immediate: true,
      onError: (error) => toast.error(error.message || 'Failed to load nearby locations')
    }
  );
};

export const useLocationsForRoute = (routeId: number) => {
  const toast = useToast();
  return useApi(
    () => locationsService.getLocationsForRoute(routeId),
    {
      immediate: true,
      onError: (error) => toast.error(error.message || 'Failed to load route locations')
    }
  );
};

export const useLocationSearch = () => {
  const toast = useToast();
  const [results, setResults] = useState<Location[]>([]);
  const [searching, setSearching] = useState(false);

  const search = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setSearching(true);
    try {
      const locations = await locationsService.searchLocations(query);
      setResults(locations);
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

export default useLocations;
