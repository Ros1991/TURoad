import { useState, useCallback } from 'react';
import { usePaginatedApi, useApi } from './useApi';
import categoriesService, { Category, CreateCategoryDto, UpdateCategoryDto } from '../services/categories.service';
import { useToast } from './useToast';

export const useCategories = (initialParams?: any) => {
  const toast = useToast();
  const paginatedApi = usePaginatedApi<Category>(
    categoriesService.getCategories.bind(categoriesService),
    initialParams
  );

  const createCategory = useApi(categoriesService.createCategory.bind(categoriesService), {
    onSuccess: () => {
      toast.success('Category created successfully');
      paginatedApi.refresh();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create category');
    }
  });

  const updateCategory = useApi(categoriesService.updateCategory.bind(categoriesService), {
    onSuccess: () => {
      toast.success('Category updated successfully');
      paginatedApi.refresh();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update category');
    }
  });

  const deleteCategory = useApi(categoriesService.deleteCategory.bind(categoriesService), {
    onSuccess: () => {
      toast.success('Category deleted successfully');
      paginatedApi.refresh();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete category');
    }
  });

  const toggleStatus = useApi(categoriesService.toggleCategoryStatus.bind(categoriesService), {
    onSuccess: () => {
      toast.success('Category status updated');
      paginatedApi.refresh();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update category status');
    }
  });

  return {
    ...paginatedApi,
    createCategory: createCategory.execute,
    updateCategory: updateCategory.execute,
    deleteCategory: deleteCategory.execute,
    toggleStatus: toggleStatus.execute,
    creating: createCategory.loading,
    updating: updateCategory.loading,
    deleting: deleteCategory.loading,
  };
};

export const useCategory = (categoryId: number) => {
  const toast = useToast();
  const [category, setCategory] = useState<Category | null>(null);

  const { data, loading, error, execute: fetchCategory } = useApi(
    () => categoriesService.getCategoryById(categoryId),
    {
      immediate: true,
      onSuccess: (data) => setCategory(data),
      onError: (error) => toast.error(error.message || 'Failed to load category')
    }
  );

  const updateCategory = useCallback(async (data: UpdateCategoryDto) => {
    try {
      const updated = await categoriesService.updateCategory(categoryId, data);
      setCategory(updated);
      toast.success('Category updated successfully');
      return updated;
    } catch (error: any) {
      toast.error(error.message || 'Failed to update category');
      throw error;
    }
  }, [categoryId, toast]);

  const uploadIcon = useCallback(async (file: File, onProgress?: (progress: number) => void) => {
    try {
      const updated = await categoriesService.uploadIcon(categoryId, file, onProgress);
      setCategory(updated);
      toast.success('Icon uploaded successfully');
      return updated;
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload icon');
      throw error;
    }
  }, [categoryId, toast]);

  return {
    category: category || data,
    loading,
    error,
    refresh: fetchCategory,
    updateCategory,
    uploadIcon,
  };
};

export const useActiveCategories = () => {
  const toast = useToast();
  return useApi(categoriesService.getActiveCategories.bind(categoriesService), {
    immediate: true,
    onError: (error) => toast.error(error.message || 'Failed to load categories')
  });
};

export default useCategories;
