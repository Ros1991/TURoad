import { Business } from "../types";

/**
 * Dados mockados de comércios e serviços próximos
 */
export const mockedBusinesses: Business[] = [
  {
    id: "1",
    name: "Adegão Português",
    nameTranslations: {
      pt: "Adegão Português",
      en: "Portuguese Cellar",
      es: "Bodega Portuguesa"
    },
    description: "Restaurante tradicional, ativo desde 1964, muito conhecido na cidade. Destaca-se pela culinária portuguesa e ambiente familiar acolhedor",
    descriptionTranslations: {
      pt: "Restaurante tradicional, ativo desde 1964, muito conhecido na cidade. Destaca-se pela culinária portuguesa e ambiente familiar acolhedor",
      en: "Traditional restaurant, active since 1964, well known in the city. Known for Portuguese cuisine and cozy family atmosphere",
      es: "Restaurante tradicional, activo desde 1964, muy conocido en la ciudad. Se destaca por la cocina portuguesa y ambiente familiar acogedor"
    },
    distance: "A 4km de distância",
    image: "https://turoad.s3.us-east-1.amazonaws.com/adega.png"
  },
  {
    id: "2",
    name: "Centro de Artesanato",
    nameTranslations: {
      pt: "Centro de Artesanato",
      en: "Handicraft Center",
      es: "Centro de Artesanía"
    },
    description: "Centro tradicional de artesanato sergipano, com peças únicas feitas por artesãos locais. Ideal para encontrar souvenirs autênticos e conhecer a cultura regional",
    descriptionTranslations: {
      pt: "Centro tradicional de artesanato sergipano, com peças únicas feitas por artesãos locais. Ideal para encontrar souvenirs autênticos e conhecer a cultura regional",
      en: "Traditional center of Sergipe handicrafts, with unique pieces made by local artisans. Perfect for finding authentic souvenirs and learning about regional culture",
      es: "Centro tradicional de artesanía sergipana, con piezas únicas hechas por artesanos locales. Ideal para encontrar souvenirs auténticos y conocer la cultura regional"
    },
    distance: "A 2km de distância",
    image: "https://turoad.s3.us-east-1.amazonaws.com/centroartesanato.png"
  }
];
