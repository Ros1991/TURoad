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
  whattoobserve?: string;
  distance: string;
  image: string;
  stories: Story[] | number;
  highlights?: string[];
  isPopular?: boolean;
  latitude?: number;
  longitude?: number;
}

export interface Story {
  id: string;
  name: string;
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
  durationSeconds: number;
}

export interface Route {
  id: string;
  title: string;
  description: string;
  image: string;
  totalDistance: string;
  totalTime: string;
  stops: number;
  stories: number;
  categories?: string[];
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
  icon: string;
  color: string;
  isPrimary: boolean;
  routeCount?: number;
  totalUsage?: number;
  image: string;
}

export interface CategoryWithRoutes {
  id: string;
  name: string;
  description?: string;
  image?: string;
  totalRoutes: number;
  routes: Route[];
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
  description: string;
  locationTranslations: {
    pt: string;
    en: string;
    es: string;
  };
  date: string;
  time: string;
  image: string;
  categories: string[];
  city: string;
  state: string;
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
  categories: string[];
  storiesCount: number;
  city: string;
  state: string;
  cityId: number;
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
  categories: string[];
  distance: string;
  city: string;
  state: string;
  cityId: number;
}

export interface Hosting {
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
  categories: string[];
  distance: string;
}