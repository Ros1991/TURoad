import { Request, Response } from 'express';
import { RequestWithLanguage } from '../middleware/languageMiddleware';
import { AppDataSource } from '@/config/database';
import { Category } from '@/entities/Category';
import { Route } from '@/entities/Route';
import { City } from '@/entities/City';
import { Event } from '@/entities/Event';
import { Location } from '@/entities/Location';
import { LocalizedText } from '@/entities/LocalizedText';
import { RouteCategory } from '@/entities/RouteCategory';
import { RouteCity } from '@/entities/RouteCity';
import { StoryRoute } from '@/entities/StoryRoute';
import { StoryCity } from '@/entities/StoryCity';
import { StoryLocation } from '@/entities/StoryLocation';
import { Type } from '@/entities/Type';
import { Like, In } from 'typeorm';
import { faqService } from '@/services/FAQService';
import { CategoryService } from '@/services/CategoryService';
import { RouteService } from '@/services/RouteService';
import { CityService } from '@/services/CityService';
import { EventService } from '@/services/EventService';
import { LocationService } from '@/services/LocationService';

export class PublicController {
  private categoryService: CategoryService;
  private routeService: RouteService;
  private cityService: CityService;
  private eventService: EventService;
  private locationService: LocationService;

  constructor() {
    this.categoryService = new CategoryService();
    this.routeService = new RouteService();
    this.cityService = new CityService();
    this.eventService = new EventService();
    this.locationService = new LocationService();
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

  async getRoutes(req: RequestWithLanguage, res: Response): Promise<void> {
    try {
      const language = req.language || 'pt';
      const categoryId = req.query.categoryId as string;
      const search = req.query.search as string;
      const cityId = req.query.cityId as string;
      
      const routes = await this.routeService.getAllWithLocalizedTexts(language, categoryId ? parseInt(categoryId) : undefined, search, cityId ? parseInt(cityId) : undefined);
      
      const routesWithData = routes.map(route => ({
        id: route.id.toString(),
        title: route.title || 'Unnamed Route',
        description: route.description,
        image: route.image,
        categories: route.categories ? route.categories.map((cat: number) => cat.toString()) : [],
        stops: parseInt(route.stops) || 0,
        totalDistance: `${(parseInt(route.stops) || 0) * 50}km`,
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

  async getCities(req: RequestWithLanguage, res: Response): Promise<void> {
    try {
      const language = req.language || 'pt';
      const search = req.query.search as string;
      const cityId = req.query.cityId as string;
      
      const cities = await this.cityService.getAllWithLocalizedTexts(language, search, cityId ? parseInt(cityId) : undefined);
      
      const citiesWithData = cities.map(city => ({
        id: city.id.toString(),
        name: city.name || 'Unnamed City',
        description: city.description,
        state: city.state,
        image: city.image,
        latitude: parseFloat(city.latitude) || 0,
        longitude: parseFloat(city.longitude) || 0,
        totalDistance: `${(parseInt(city.routes) || 0) * 30}km de rotas`,
        stories: parseInt(city.stories) || 0
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
          type: event.type || 'Evento',
          location: event.location || 'Local não especificado',
          date: formattedDate,
          time: event.time,
          image: event.image
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

  async getBusinesses(req: RequestWithLanguage, res: Response): Promise<void> {
    try {
      const language = req.language || 'pt';
      const search = req.query.search as string;
      const cityId = req.query.cityId as string;
      
      const businesses = await this.locationService.getBusinessesWithLocalizedTexts(language, search, cityId ? parseInt(cityId) : undefined);
      
      const businessesWithData = businesses.map(business => ({
        id: business.id.toString(),
        name: business.name || 'Unnamed Business',
        description: business.description,
        distance: `A ${Math.floor(Math.random() * 10) + 1}km de distância`,
        image: business.image,
        latitude: business.latitude ? parseFloat(business.latitude) : null,
        longitude: business.longitude ? parseFloat(business.longitude) : null
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

  async getHistoricalPlaces(req: RequestWithLanguage, res: Response): Promise<void> {
    try {
      const language = req.language || 'pt';
      const search = req.query.search as string;
      const cityId = req.query.cityId as string;
      
      const historicalPlaces = await this.locationService.getHistoricalPlacesWithLocalizedTexts(language, search, cityId ? parseInt(cityId) : undefined);
      const historicalPlacesWithData = historicalPlaces.map(place => ({
        id: place.id.toString(),
        name: place.name || 'Unnamed Place',
        description: place.description,
        location: place.location,
        storiesCount: parseInt(place.storiesCount) || 0,
        image: place.image,
        latitude: place.latitude ? parseFloat(place.latitude) : null,
        longitude: place.longitude ? parseFloat(place.longitude) : null
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
}
