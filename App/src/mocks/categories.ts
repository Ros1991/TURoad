import { Category } from "../types";

/**
 * Dados mockados de categorias com suporte a múltiplos idiomas
 */
export const mockedCategories: Category[] = [
  {
    id: "1",
    name: "Gastronomia",
    nameTranslations: {
      pt: "Gastronomia",
      en: "Food",
      es: "Gastronomía"
    },
    description: "Sabores únicos da culinária sergipana",
    descriptionTranslations: {
      pt: "Sabores únicos da culinária sergipana",
      en: "Unique flavors of Sergipe cuisine",
      es: "Sabores únicos de la cocina sergipana"
    },
    image: "https://turoad.s3.us-east-1.amazonaws.com/gastronomia.jpg",
    isPrimary: true,
    routeCount: 3
  },
  {
    id: "2",
    name: "História",
    nameTranslations: {
      pt: "História",
      en: "History",
      es: "Historia"
    },
    description: "Patrimônio histórico de Sergipe",
    descriptionTranslations: {
      pt: "Patrimônio histórico de Sergipe",
      en: "Historical heritage of Sergipe",
      es: "Patrimonio histórico de Sergipe"
    },
    image: "https://turoad.s3.us-east-1.amazonaws.com/historia.jpg",
    isPrimary: true,
    routeCount: 2
  },
  {
    id: "3",
    name: "Cultura",
    nameTranslations: {
      pt: "Cultura",
      en: "Culture",
      es: "Cultura"
    },
    description: "Tradições e manifestações culturais",
    descriptionTranslations: {
      pt: "Tradições e manifestações culturais",
      en: "Cultural traditions and manifestations",
      es: "Tradiciones y manifestaciones culturales"
    },
    image: "https://turoad.s3.us-east-1.amazonaws.com/cultura.jpg",
    isPrimary: true,
    routeCount: 1
  },
  {
    id: "4",
    name: "Natureza",
    nameTranslations: {
      pt: "Natureza",
      en: "Nature",
      es: "Naturaleza"
    },
    description: "Belezas naturais e ecoturismo",
    descriptionTranslations: {
      pt: "Belezas naturais e ecoturismo",
      en: "Natural beauty and ecotourism",
      es: "Bellezas naturales y ecoturismo"
    },
    image: "https://turoad.s3.us-east-1.amazonaws.com/natureza.jpg",
    isPrimary: true,
    routeCount: 2
  }
];
