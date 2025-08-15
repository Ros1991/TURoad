import { useState, useCallback } from 'react';
import { usePaginatedApi, useApi } from './useApi';
import routesService, { Route, CreateRouteDto, UpdateRouteDto, RouteFilters } from '../services/routes.service';
import { useToast } from './useToast';

export const useRoutes = (initialParams?: RouteFilters) => {
  const toast = useToast();
  const paginatedApi = usePaginatedApi<Route>(
    routesService.getRoutes.bind(routesService),
    initialParams
  );

  const createRoute = useApi(routesService.createRoute.bind(routesService), {
    onSuccess: () => {
      toast.success('Route created successfully');
      paginatedApi.refresh();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create route');
    }
  });

  const updateRoute = useApi(routesService.updateRoute.bind(routesService), {
    onSuccess: () => {
      toast.success('Route updated successfully');
      paginatedApi.refresh();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update route');
    }
  });

  const deleteRoute = useApi(routesService.deleteRoute.bind(routesService), {
    onSuccess: () => {
      toast.success('Route deleted successfully');
      paginatedApi.refresh();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete route');
    }
  });

  const toggleStatus = useApi(routesService.toggleRouteStatus.bind(routesService), {
    onSuccess: () => {
      toast.success('Route status updated');
      paginatedApi.refresh();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update route status');
    }
  });

  const toggleFeatured = useApi(routesService.toggleFeaturedStatus.bind(routesService), {
    onSuccess: () => {
      toast.success('Route featured status updated');
      paginatedApi.refresh();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update featured status');
    }
  });

  return {
    ...paginatedApi,
    createRoute: createRoute.execute,
    updateRoute: updateRoute.execute,
    deleteRoute: deleteRoute.execute,
    toggleStatus: toggleStatus.execute,
    toggleFeatured: toggleFeatured.execute,
    creating: createRoute.loading,
    updating: updateRoute.loading,
    deleting: deleteRoute.loading,
  };
};

export const useRoute = (routeId: number) => {
  const toast = useToast();
  const [route, setRoute] = useState<Route | null>(null);

  const { data, loading, error, execute: fetchRoute } = useApi(
    () => routesService.getRouteDetails(routeId),
    {
      immediate: true,
      onSuccess: (data) => setRoute(data),
      onError: (error) => toast.error(error.message || 'Failed to load route')
    }
  );

  const updateRoute = useCallback(async (data: UpdateRouteDto) => {
    try {
      const updated = await routesService.updateRoute(routeId, data);
      setRoute(updated);
      toast.success('Route updated successfully');
      return updated;
    } catch (error: any) {
      toast.error(error.message || 'Failed to update route');
      throw error;
    }
  }, [routeId, toast]);

  const uploadMap = useCallback(async (file: File, onProgress?: (progress: number) => void) => {
    try {
      const updated = await routesService.uploadMap(routeId, file, onProgress);
      setRoute(updated);
      toast.success('Map uploaded successfully');
      return updated;
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload map');
      throw error;
    }
  }, [routeId, toast]);

  const uploadElevationProfile = useCallback(async (file: File, onProgress?: (progress: number) => void) => {
    try {
      const updated = await routesService.uploadElevationProfile(routeId, file, onProgress);
      setRoute(updated);
      toast.success('Elevation profile uploaded successfully');
      return updated;
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload elevation profile');
      throw error;
    }
  }, [routeId, toast]);

  const addLocation = useCallback(async (locationId: number, order: number) => {
    try {
      await routesService.addLocation(routeId, locationId, order);
      toast.success('Location added to route');
      await fetchRoute();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add location');
      throw error;
    }
  }, [routeId, toast, fetchRoute]);

  const removeLocation = useCallback(async (locationId: number) => {
    try {
      await routesService.removeLocation(routeId, locationId);
      toast.success('Location removed from route');
      await fetchRoute();
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove location');
      throw error;
    }
  }, [routeId, toast, fetchRoute]);

  const reorderLocations = useCallback(async (locationOrders: { locationId: number; order: number }[]) => {
    try {
      await routesService.reorderLocations(routeId, locationOrders);
      toast.success('Locations reordered successfully');
      await fetchRoute();
    } catch (error: any) {
      toast.error(error.message || 'Failed to reorder locations');
      throw error;
    }
  }, [routeId, toast, fetchRoute]);

  return {
    route: route || data,
    loading,
    error,
    refresh: fetchRoute,
    updateRoute,
    uploadMap,
    uploadElevationProfile,
    addLocation,
    removeLocation,
    reorderLocations,
  };
};

export const useFeaturedRoutes = () => {
  const toast = useToast();
  return useApi(routesService.getFeaturedRoutes.bind(routesService), {
    immediate: true,
    onError: (error) => toast.error(error.message || 'Failed to load featured routes')
  });
};

export const useRoutesByCity = (cityId: number) => {
  const toast = useToast();
  return useApi(
    () => routesService.getRoutesByCity(cityId),
    {
      immediate: true,
      onError: (error) => toast.error(error.message || 'Failed to load routes')
    }
  );
};

export const useRoutesByCategory = (categoryId: number) => {
  const toast = useToast();
  return useApi(
    () => routesService.getRoutesByCategory(categoryId),
    {
      immediate: true,
      onError: (error) => toast.error(error.message || 'Failed to load routes')
    }
  );
};

export default useRoutes;
