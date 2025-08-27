import { Request, Response } from 'express';
import { RequestWithLanguage } from '../middleware/languageMiddleware';
import { RequestWithLocation } from '../middleware/locationLoggingMiddleware';
import { AppDataSource } from '@/config/database';
import { City } from '@/entities/City';
import { LocalizedText } from '@/entities/LocalizedText';
import { Like, In } from 'typeorm';
import { faqService } from '@/services/FAQService';
import { CategoryService } from '@/services/CategoryService';
import { RouteService } from '@/services/RouteService';
import { CityService } from '@/services/CityService';
import { EventService } from '@/services/EventService';
import { LocationService } from '@/services/LocationService';
import { RouteCityService } from '@/services/RouteCityService';
import { CityResponseDto } from '@/dtos/CityDto';
import { UserFavoriteCityService } from '@/services/UserFavoriteCityService';
import { UserFavoriteRouteService } from '@/services/UserFavoriteRouteService';
import { UserFavoritesService } from '@/services/UserFavoritesService';

export class PublicController {
  private categoryService: CategoryService;
  private routeService: RouteService;
  private cityService: CityService;
  private eventService: EventService;
  private locationService: LocationService;
  private routeCityService: RouteCityService;
  private userFavoriteCityService: UserFavoriteCityService;
  private userFavoriteRouteService: UserFavoriteRouteService;
  private userFavoritesService: UserFavoritesService;

  constructor() {
    this.categoryService = new CategoryService();
    this.routeService = new RouteService();
    this.cityService = new CityService();
    this.eventService = new EventService();
    this.locationService = new LocationService();
    this.routeCityService = new RouteCityService();
    this.userFavoriteCityService = new UserFavoriteCityService();
    this.userFavoriteRouteService = new UserFavoriteRouteService();
    this.userFavoritesService = new UserFavoritesService();
  }

  private async getLocalizedText(textRefId: number | undefined, language: string): Promise<string | null> {
    if (!textRefId) return null;
    
    const localizedText = await AppDataSource.getRepository(LocalizedText).findOne({
      where: { 
        referenceId: textRefId,
        languageCode: language
      }
    });
    
    // Fallback to Portuguese if translation not found
    if (!localizedText && language !== 'pt') {
      const fallbackText = await AppDataSource.getRepository(LocalizedText).findOne({
        where: { 
          referenceId: textRefId,
          languageCode: 'pt'
        }
      });
      return fallbackText?.textContent || null;
    }
    
    return localizedText?.textContent || null;
  }

  async getCategories(req: RequestWithLanguage, res: Response): Promise<void> {
    try {
      const language = req.language || 'pt';
      const search = req.query.search as string;
      const cityId = req.query.cityId as string;
      
      const categories = await this.categoryService.getAllWithLocalizedTexts(language, search, cityId ? parseInt(cityId) : undefined);
      const categoriesWithData = categories.map(category => ({
        id: category.id.toString(),
        name: category.name || 'Unnamed Category',
        description: category.description,
        image: category.image,
        routeCount: parseInt(category.routeCount) || 0,
        isPrimary: true
      }));
     
      res.json({
        success: true,
        data: categoriesWithData
      });
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching categories'
      });
    }
  }

  formatTime(minutes: number): string {
    const days = Math.floor(minutes / (24 * 60));
    const hours = Math.floor((minutes % (24 * 60)) / 60);
    const mins = minutes % 60;

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (mins > 0) parts.push(`${mins}min`);

    return parts.join(" ") || "0min";
  }

  async getRoutes(req: RequestWithLanguage & RequestWithLocation, res: Response): Promise<void> {
    try {
      const language = req.language || 'pt';
      const categoryId = req.query.categoryId as string;
      const search = req.query.search as string;
      const cityId = req.query.cityId as string;
      const userLatitude = req.userLocation?.latitude;
      const userLongitude = req.userLocation?.longitude;
      
      const routes = await this.routeService.getAllWithLocalizedTexts(language, categoryId ? parseInt(categoryId) : undefined, search, cityId ? parseInt(cityId) : undefined, userLatitude, userLongitude);
      const routesWithData = routes.map(route => ({
        id: route.id.toString(),
        title: route.title || 'Unnamed Route',
        description: route.description,
        image: route.image,
        categories: route.categories || [],
        stops: parseInt(route.stops) || 0,
        totalDistance: `${(parseFloat(route.totaldistance) || 0).toFixed(1)} km`,
        totalTime: this.formatTime(parseInt(route.totaltime) || 0),
        stories: parseInt(route.stories) || 0
      }));
      res.json({
        success: true,
        data: routesWithData
      });
    } catch (error) {
      console.error('Error fetching routes:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching routes'
      });
    }
  }

  async getCityById(req: RequestWithLanguage & RequestWithLocation, res: Response): Promise<void> {
    try {
      const language = req.language || 'pt';
      const cityId = req.params.cityId;
      
      if (!cityId) {
        res.status(400).json({
          success: false,
          message: 'City ID is required'
        });
        return;
      }

      // Use user's current location from middleware for distance calculation
      const userLatitude = req.userLocation?.latitude;
      const userLongitude = req.userLocation?.longitude;

      const city = await this.cityService.getCityByIdWithStories(parseInt(cityId), language, userLatitude, userLongitude);
      if (!city) {
        res.status(404).json({
          success: false,
          message: 'City not found'
        });
        return;
      }
      // Check if user is authenticated and get favorite status
      let isFavorite = false;
      if ((req as any).user?.userId) {
        try {
          isFavorite = await this.userFavoriteCityService.isFavoriteCity((req as any).user.userId, parseInt(cityId));
        } catch (error) {
          // If error checking favorite status, just continue with false
          console.warn('Error checking favorite status:', error);
        }
      }

      res.json({
        success: true,
        data: city,
        isFavorite
      });
    } catch (error) {
      console.error('Error fetching city by ID:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching city'
      });
    }
  }

  async getCities(req: RequestWithLanguage & RequestWithLocation, res: Response): Promise<void> {
    try {
      const language = req.language || 'pt';
      const search = req.query.search as string;
      const cityId = req.query.cityId as string;
      
      let referenceLatitude: number | undefined;
      let referenceLongitude: number | undefined;
      
      // If cityId is provided, use that city's location as reference
      if (cityId) {
        const referenceCity = await this.cityService.findById(parseInt(cityId)) as CityResponseDto;
        if (referenceCity) {
          referenceLatitude = parseFloat(referenceCity.latitude.toString());
          referenceLongitude = parseFloat(referenceCity.longitude.toString());
        }
      } else {
        // Otherwise use user's current location from middleware
        referenceLatitude = req.userLocation?.latitude;
        referenceLongitude = req.userLocation?.longitude;
      }
      
      const cities = await this.cityService.getAllWithLocalizedTexts(
        language, 
        search, 
        cityId ? parseInt(cityId) : undefined,
        referenceLatitude,
        referenceLongitude
      );
      
      const citiesWithData = cities.map(city => ({
        id: city.id.toString(),
        name: city.name || 'Unnamed City',
        description: city.description,
        state: city.state,
        image: city.image,
        latitude: parseFloat(city.latitude) || 0,
        longitude: parseFloat(city.longitude) || 0,
        stories: parseInt(city.stories) || 0,
        totalDistance: city.distance ? `${parseFloat(city.distance).toFixed(1)} km` : undefined
      }));
      res.json({
        success: true,
        data: citiesWithData
      });
    } catch (error) {
      console.error('Error fetching cities:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching cities'
      });
    }
  }

  async getEvents(req: RequestWithLanguage, res: Response): Promise<void> {
    try {
      const language = req.language || 'pt';
      const cityId = req.query.cityId as string;
      const search = req.query.search as string;
      
      const events = await this.eventService.getAllWithLocalizedTexts(language, cityId ? parseInt(cityId) : undefined, search);
      
      const eventsWithData = events.map(event => {
        const eventDate = new Date(event.eventdate);
        const formattedDate = eventDate.toLocaleDateString('pt-BR', {
          day: 'numeric',
          month: 'long'
        });
        
        return {
          id: event.id.toString(),
          name: event.name || 'Unnamed Event',
          description: event.description,
          location: event.location || 'Local não especificado',
          date: formattedDate,
          time: event.time,
          image: event.image,
          categories: event.categories || []
        };
      });
      res.json({
        success: true,
        data: eventsWithData
      });
    } catch (error) {
      console.error('Error fetching events:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching events'
      });
    }
  }

  async getBusinesses(req: RequestWithLanguage & RequestWithLocation, res: Response): Promise<void> {
    try {
      const language = req.language || 'pt';
      const search = req.query.search as string;
      const cityId = req.query.cityId as string;
      const locationId = req.query.locationId as string;
      
      let referenceLatitude: number | undefined;
      let referenceLongitude: number | undefined;
      
      // If locationId is provided, use that location's coordinates for distance calculation
      if (locationId) {
        const referenceLocation = await this.locationService.getLocationById(parseInt(locationId), language);
        if (referenceLocation) {
          referenceLatitude = parseFloat(referenceLocation.latitude);
          referenceLongitude = parseFloat(referenceLocation.longitude);
        }
      } else {
        // Otherwise use user's current location from middleware
        referenceLatitude = req.userLocation?.latitude;
        referenceLongitude = req.userLocation?.longitude;
      }
    
      let businesses = await this.locationService.getBusinessesWithLocalizedTexts(language, search, cityId ? parseInt(cityId) : undefined, referenceLatitude, referenceLongitude);
      
      // Filter out the reference location itself if locationId was provided
      if (locationId) {
        businesses = businesses.filter(business => business.id.toString() !== locationId);
      }

      const businessesWithData = businesses.map(business => ({
        id: business.id.toString(),
        name: business.name || 'Unnamed Business',
        description: business.description,
        distance: business.distance !== undefined && business.distance !== null ? `${parseFloat(business.distance).toFixed(1)}km ` : undefined,
        image: business.image,
        latitude: business.latitude ? parseFloat(business.latitude) : null,
        longitude: business.longitude ? parseFloat(business.longitude) : null,
        categories: business.categories || [],
        storiesCount: parseInt(business.storiesCount) || 0
      }));
      res.json({
        success: true,
        data: businessesWithData
      });
    } catch (error) {
      console.error('Error fetching businesses:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching businesses'
      });
    }
  }

  async getHistoricalPlaces(req: RequestWithLanguage & RequestWithLocation, res: Response): Promise<void> {
    try {
      const language = req.language || 'pt';
      const search = req.query.search as string;
      const cityId = req.query.cityId as string;
      
      let referenceLatitude: number | undefined;
      let referenceLongitude: number | undefined;
      
      referenceLatitude = req.userLocation?.latitude;
      referenceLongitude = req.userLocation?.longitude;
      
      const historicalPlaces = await this.locationService.getHistoricalPlacesWithLocalizedTexts(language, search, cityId ? parseInt(cityId) : undefined, referenceLatitude, referenceLongitude);
      const historicalPlacesWithData = historicalPlaces.map(place => ({
        id: place.id.toString(),
        name: place.name || 'Unnamed Place',
        description: place.description,
        location: place.location,
        storiesCount: parseInt(place.storiesCount) || 0,
        image: place.image,
        latitude: place.latitude ? parseFloat(place.latitude) : null,
        longitude: place.longitude ? parseFloat(place.longitude) : null,
        categories: place.categories || [],
        distance: place.distance ? `${parseFloat(place.distance).toFixed(1)} km ` : undefined
      }));
      res.json({
        success: true,
        data: historicalPlacesWithData
      });
    } catch (error) {
      console.error('Error fetching historical places:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching historical places'
      });
    }
  }

  async getCategoriesWithRoutes(req: RequestWithLanguage & RequestWithLocation, res: Response): Promise<void> {
    try {
      const language = req.language || 'pt';
      const userLatitude = req.userLocation?.latitude;
      const userLongitude = req.userLocation?.longitude;
      
      const categoriesWithRoutes = await this.categoryService.getCategoriesWithRoutes(language, userLatitude, userLongitude);
      res.json({
        success: true,
        data: categoriesWithRoutes
      });
    } catch (error) {
      console.error('Error fetching categories with routes:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching categories with routes'
      });
    }
  }

  async getHosting(req: RequestWithLanguage & RequestWithLocation, res: Response): Promise<void> {
    try {
      const language = req.language || 'pt';
      const search = req.query.search as string;
      const cityId = req.query.cityId as string;
      const locationId = req.query.locationId as string;
      
      let referenceLatitude: number | undefined;
      let referenceLongitude: number | undefined;
      
      // If locationId is provided, use that location's coordinates for distance calculation
      if (locationId) {
        const referenceLocation = await this.locationService.getLocationById(parseInt(locationId), language);
        if (referenceLocation) {
          referenceLatitude = parseFloat(referenceLocation.latitude);
          referenceLongitude = parseFloat(referenceLocation.longitude);
        }
      } else {
        // Otherwise use user's current location from middleware
        referenceLatitude = req.userLocation?.latitude;
        referenceLongitude = req.userLocation?.longitude;
      }
      
      let hosting = await this.locationService.getHostingWithLocalizedTexts(language, search, cityId ? parseInt(cityId) : undefined, referenceLatitude, referenceLongitude);
      
      // Filter out the reference location itself if locationId was provided
      if (locationId) {
        hosting = hosting.filter(host => host.id.toString() !== locationId);
      }
      
      const hostingWithData = hosting.map(host => ({
        id: host.id.toString(),
        name: host.name || 'Unnamed Hosting',
        description: host.description,
        distance: host.distance !== undefined && host.distance !== null ? `${parseFloat(host.distance).toFixed(1)}km ` : undefined,
        image: host.image,
        latitude: host.latitude ? parseFloat(host.latitude) : null,
        longitude: host.longitude ? parseFloat(host.longitude) : null,
        categories: host.categories || [],
        storiesCount: parseInt(host.storiesCount) || 0
      }));
      
      res.json({
        success: true,
        data: hostingWithData
      });
    } catch (error) {
      console.error('Error fetching hosting:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching hosting'
      });
    }
  }

  async searchCities(req: RequestWithLanguage, res: Response): Promise<void> {
    try {
      const language = req.language || 'pt';
      const query = req.query.q as string;
      
      if (!query || query.length < 2) {
        res.json({
          success: true,
          data: []
        });
        return;
      }
      
      const cityRepo = AppDataSource.getRepository(City);
      const localizedTextRepo = AppDataSource.getRepository(LocalizedText);
      
      // Search in city names
      const cityNameTexts = await localizedTextRepo.find({
        where: {
          textContent: Like(`%${query}%`),
          languageCode: language
        }
      });
      
      const cityNameTextRefIds = cityNameTexts.map(t => t.referenceId);
      
      let cities: City[] = [];
      
      if (cityNameTextRefIds.length > 0) {
        cities = await cityRepo.find({
          where: {
            nameTextRefId: In(cityNameTextRefIds)
          }
        });
      }
      
      // Also search by state
      const citiesByState = await cityRepo.find({
        where: {
          state: Like(`%${query}%`)
        }
      });
      
      // Merge and deduplicate
      const allCities = [...cities, ...citiesByState];
      const uniqueCities = Array.from(new Map(allCities.map(c => [c.cityId, c])).values());
      
      const citiesWithData = await Promise.all(uniqueCities.slice(0, 8).map(async (city) => {
        const name = await this.getLocalizedText(city.nameTextRefId, language);
        const description = await this.getLocalizedText(city.descriptionTextRefId, language);
        
        return {
          id: city.cityId.toString(),
          name: name || 'Unnamed City',
          description: description,
          state: city.state,
          image: city.imageUrl,
          latitude: parseFloat(city.latitude.toString()),
          longitude: parseFloat(city.longitude.toString())
        };
      }));
      
      res.json({
        success: true,
        data: citiesWithData
      });
    } catch (error) {
      console.error('Error searching cities:', error);
      res.status(500).json({
        success: false,
        message: 'Error searching cities'
      });
    }
  }

  /**
   * Get all FAQs with localized texts using efficient database JOINs
   */
  async getFAQs(req: RequestWithLanguage, res: Response): Promise<void> {
    try {
      const language = req.language || 'pt';
      const search = req.query.search as string;

      const faqs = await faqService.getAllWithLocalizedTexts(language, search);
      res.json({
        success: true,
        data: faqs
      });
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      res.status(500).json({
        error: 'Failed to fetch FAQs'
      });
    }
  }

  async getLocationById(req: RequestWithLanguage & RequestWithLocation, res: Response): Promise<void> {
    try {
      const language = req.language || 'pt';
      const locationId = req.params.id;
      
      if (!locationId) {
        res.status(400).json({
          success: false,
          message: 'Location ID is required'
        });
        return;
      }

      // Extract user location for distance calculation
      const userLatitude = req.userLocation?.latitude;
      const userLongitude = req.userLocation?.longitude;

      const location = await this.locationService.getLocationById(parseInt(locationId), language, userLatitude, userLongitude);
      if (!location) {
        res.status(404).json({
          success: false,
          message: 'Location not found'
        });
        return;
      }

      const formattedLocation = {
        id: location.id.toString(),
        name: location.name || 'Unnamed Location',
        description: location.description,
        location: location.location,
        image: location.image,
        cityId: location.cityId,
        city: location.city,
        state: location.state,
        latitude: location.latitude ? parseFloat(location.latitude) : null,
        longitude: location.longitude ? parseFloat(location.longitude) : null,
        distance: location.distance ? `${parseFloat(location.distance).toFixed(1)} km` : null,
        categories: location.categories || [],
        stories: location.stories || [],
        storiesCount: location.stories?.length || 0
      };

      res.json({
        success: true,
        data: formattedLocation
      });
    } catch (error) {
      console.error('Error fetching location by ID:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching location'
      });
    }
  }

  async getEventById(req: RequestWithLanguage & RequestWithLocation, res: Response): Promise<void> {
    try {
      const language = req.language || 'pt';
      const eventId = req.params.id;
      
      if (!eventId) {
        res.status(400).json({
          success: false,
          message: 'Event ID is required'
        });
        return;
      }

      // Extract user location for distance calculation
      const userLatitude = req.userLocation?.latitude;
      const userLongitude = req.userLocation?.longitude;

      const event = await this.eventService.getEventById(parseInt(eventId), language, userLatitude, userLongitude);
      if (!event) {
        res.status(404).json({
          success: false,
          message: 'Event not found'
        });
        return;
      }

      const eventDate = new Date(event.eventdate);
      const formattedDate = eventDate.toLocaleDateString('pt-BR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });

      const formattedEvent = {
        id: event.id.toString(),
        name: event.name || 'Unnamed Event',
        description: event.description,
        location: event.location || 'Local não especificado',
        date: formattedDate,
        time: event.time,
        city: event.city,
        state: event.state,
        distance: event.distance ? `${parseFloat(event.distance).toFixed(1)} km` : null,
        image: event.image,
        categories: event.categories || [],
        stories: event.stories || [],
        storiesCount: event.stories?.length || 0
      };

      res.json({
        success: true,
        data: formattedEvent
      });
    } catch (error) {
      console.error('Error fetching event by ID:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching event'
      });
    }
  }

  async getRouteById(req: RequestWithLanguage & RequestWithLocation, res: Response) {
    try {
      const { id } = req.params;
      const language = req.language || 'pt';
      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: 'ID da rota inválido'
        });
      }

      const route = await this.routeService.getRouteById(parseInt(id), language);
      if(route.total_distance){
        route.total_distance = `${(parseFloat(route.total_distance) || 0).toFixed(1)} km`;
      }
      if(route.estimated_duration){
        route.estimated_duration = this.formatTime(parseInt(route.estimated_duration) || 0);
      }
      if (!route) {
        return res.status(404).json({
          success: false,
          message: 'Rota não encontrada'
        });
      }

      // Check if user is authenticated and get favorite status
      let isFavorite = false;
      if ((req as any).user?.userId) {
        try {
          isFavorite = await this.userFavoriteRouteService.isFavoriteRoute((req as any).user.userId, parseInt(id));
        } catch (error) {
          // If error checking favorite status, just continue with false
          console.warn('Error checking favorite status:', error);
        }
      }

      res.json({
        success: true,
        data: route,
        isFavorite
      });
    } catch (error) {
      console.error('Error fetching route by id:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  async getRouteBusinesses(req: RequestWithLanguage & RequestWithLocation, res: Response) {
    try {
      const { routeId } = req.params;
      const language = req.language || 'pt';
      const userLatitude = req.userLocation?.latitude || null;
      const userLongitude = req.userLocation?.longitude || null;

      if (!routeId) {
        return res.status(400).json({
          success: false,
          message: 'Route ID is required'
        });
      }

      // Get city IDs directly from RouteCityService
      const cityIds = await this.routeCityService.getCityIdsByRouteId(parseInt(routeId));
      
      if (cityIds.length === 0) {
        return res.json({
          success: true,
          data: []
        });
      }

      // Get businesses from all cities in the route
      const businesses = await this.locationService.getBusinessesByCities(
        cityIds,
        language,
        userLatitude,
        userLongitude
      ); 
      
      const hostingWithData = businesses.map(host => ({
        id: host.id.toString(),
        name: host.name || 'Unnamed Hosting',
        description: host.description,
        distance: host.distance !== undefined && host.distance !== null ? `${parseFloat(host.distance).toFixed(1)}km ` : undefined,
        image: host.image,
        latitude: host.latitude ? parseFloat(host.latitude) : null,
        longitude: host.longitude ? parseFloat(host.longitude) : null,
        categories: host.categories || [],
        storiesCount: parseInt(host.storiesCount) || 0
      }));

      return res.json({
        success: true,
        data: hostingWithData
      });
    } catch (error) {
      console.error('Error fetching route businesses:', error);
      return res.status(500).json({
        success: false,
        message: 'Error fetching route businesses'
      });
    }
  }

  async getRouteHosting(req: RequestWithLanguage & RequestWithLocation, res: Response) {
    try {
      const { routeId } = req.params;
      const language = req.language || 'pt';
      const userLatitude = req.userLocation?.latitude || null;
      const userLongitude = req.userLocation?.longitude || null;

      if (!routeId) {
        return res.status(400).json({
          success: false,
          message: 'Route ID is required'
        });
      }

      // Get city IDs directly from RouteCityService
      const cityIds = await this.routeCityService.getCityIdsByRouteId(parseInt(routeId));
      
      if (cityIds.length === 0) {
        return res.json({
          success: true,
          data: []
        });
      }

      // Get hosting from all cities in the route
      const hosting = await this.locationService.getHostingByCities(
        cityIds,
        language,
        userLatitude,
        userLongitude
      );
      
      const hostingWithData = hosting.map(host => ({
        id: host.id.toString(),
        name: host.name || 'Unnamed Hosting',
        description: host.description,
        distance: host.distance !== undefined && host.distance !== null ? `${parseFloat(host.distance).toFixed(1)}km ` : undefined,
        image: host.image,
        latitude: host.latitude ? parseFloat(host.latitude) : null,
        longitude: host.longitude ? parseFloat(host.longitude) : null,
        categories: host.categories || [],
        storiesCount: parseInt(host.storiesCount) || 0
      }));
      
      return res.json({
        success: true,
        data: hostingWithData
      });
    } catch (error) {
      console.error('Error fetching route hosting:', error);
      return res.status(500).json({
        success: false,
        message: 'Error fetching route hosting'
      });
    }
  }

  async getUserFavorites(req: RequestWithLanguage, res: Response): Promise<void> {
    try {
      const language = req.language || 'pt';
      const userId = (req as any).user?.userId;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User authentication required'
        });
        return;
      }

      const favorites = await this.userFavoritesService.getUserFavorites(userId, language);
      
      res.json({
        success: true,
        data: favorites
      });
    } catch (error) {
      console.error('Error fetching user favorites:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching user favorites'
      });
    }
  }
}
