export interface User {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  profileImage?: string;
  isAdmin?: boolean;
}

export interface City {
  id: string;
  name: string;
  state: string;
  description?: string;
  descriptionTranslations?: {
    pt: string;
    en: string;
    es: string;
  };
  totalDistance: string;
  image: string;
  stories: Story[] | number;
  highlights?: string[];
  isPopular?: boolean;
  latitude?: number;
  longitude?: number;
}

export interface Story {
  id: string;
  title: string;
  titleTranslations: {
    pt: string;
    en: string;
    es: string;
  };
  description: string;
  descriptionTranslations: {
    pt: string;
    en: string;
    es: string;
  };
  duration: string;
  audioUrl: string;
  audioUrlTranslations: {
    pt: string;
    en: string;
    es: string;
  };
  narrator: string;
}

export interface Route {
  id: string;
  title: string;
  titleTranslations: {
    pt: string;
    en: string;
    es: string;
  };
  description: string;
  descriptionTranslations: {
    pt: string;
    en: string;
    es: string;
  };
  categories: string[]; // IDs das categorias
  totalDistance: string;
  totalTime: string;
  estimatedDuration: string;
  stops: number;
  cities: City[];
  stories: number; // Total de histórias em todas as cidades da rota
  image: string;
}

export interface Category {
  id: string;
  name: string;
  nameTranslations?: {
    pt: string;
    en: string;
    es: string;
  };
  description: string;
  descriptionTranslations: {
    pt: string;
    en: string;
    es: string;
  };
  image: string;
  isPrimary?: boolean;
  routeCount: number;
}

export interface Event {
  id: string;
  name: string;
  nameTranslations: {
    pt: string;
    en: string;
    es: string;
  };
  type: string;
  typeTranslations: {
    pt: string;
    en: string;
    es: string;
  };
  location: string;
  locationTranslations: {
    pt: string;
    en: string;
    es: string;
  };
  date: string;
  time: string;
  image: string;
}

export interface Business {
  id: string;
  name: string;
  nameTranslations: {
    pt: string;
    en: string;
    es: string;
  };
  description: string;
  descriptionTranslations: {
    pt: string;
    en: string;
    es: string;
  };
  distance: string;
  image: string;
}

export interface HistoricalPlace {
  id: string;
  name: string;
  nameTranslations: {
    pt: string;
    en: string;
    es: string;
  };
  description: string;
  descriptionTranslations: {
    pt: string;
    en: string;
    es: string;
  };
  location: string;
  locationTranslations: {
    pt: string;
    en: string;
    es: string;
  };
  storiesCount: number;
  image: string;
}
