import { Route, Category } from "../types";
import { mockedCategories, mockedRoutes } from "../mocks";

export const getCategories = async (showOnlyPrimary: boolean = false, language: string = 'pt'): Promise<Category[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let categories = [...mockedCategories];
      
      // Filtrar apenas categorias principais, se solicitado
      if (showOnlyPrimary) {
        categories = categories.filter(category => category.isPrimary);
      }
      
      // Aplicar tradução de acordo com o idioma selecionado
      categories = categories.map(category => ({
        ...category,
        name: category.nameTranslations?.[language as keyof typeof category.nameTranslations] || category.name
      }));
      
      resolve(categories);
    }, 500);
  });
};

export const getRoutes = async (categoryId?: string): Promise<Route[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (categoryId) {
        const filteredRoutes = mockedRoutes.filter(route => route.categories.includes(categoryId));
        resolve(filteredRoutes);
      } else {
        resolve(mockedRoutes);
      }
    }, 500);
  });
};

export const getRouteById = async (id: string): Promise<Route | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const route = mockedRoutes.find(r => r.id === id);
      resolve(route || null);
    }, 500);
  });
};

