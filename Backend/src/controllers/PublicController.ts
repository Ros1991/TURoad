import { Request, Response } from 'express';
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

export class PublicController {
  private getLanguageFromRequest(req: Request): string {
    const acceptLanguage = req.headers['accept-language'] || 'pt';
    // Extract the primary language code (e.g., 'pt' from 'pt-BR')
    const languageParts = acceptLanguage.split(',')[0];
    const language = languageParts ? languageParts.split('-')[0].toLowerCase() : 'pt';
    // Support only pt, en, es
    return ['pt', 'en', 'es'].includes(language) ? language : 'pt';
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

  async getCategories(req: Request, res: Response): Promise<void> {
    try {
      const language = this.getLanguageFromRequest(req);
      const showOnlyPrimary = req.query.primary === 'true';
      
      const categoryRepo = AppDataSource.getRepository(Category);
      const routeCategoryRepo = AppDataSource.getRepository(RouteCategory);
      
      // Get all categories or only primary ones
      const categories = await categoryRepo.find();
      
      // Filter primary categories if requested (assuming we add an isPrimary field)
      // For now, we'll return all categories
      
      // Get route counts for each category
      const categoriesWithData = await Promise.all(categories.map(async (category) => {
        const routeCount = await routeCategoryRepo.count({
          where: { categoryId: category.categoryId }
        });
        
        const name = await this.getLocalizedText(category.nameTextRefId, language);
        const description = await this.getLocalizedText(category.descriptionTextRefId, language);
        
        return {
          id: category.categoryId.toString(),
          name: name || 'Unnamed Category',
          description: description,
          image: category.imageUrl,
          routeCount: routeCount,
          isPrimary: true // TODO: Add this field to the database
        };
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

  async getRoutes(req: Request, res: Response): Promise<void> {
    try {
      const language = this.getLanguageFromRequest(req);
      const categoryId = req.query.categoryId as string;
      
      const routeRepo = AppDataSource.getRepository(Route);
      const routeCategoryRepo = AppDataSource.getRepository(RouteCategory);
      const routeCityRepo = AppDataSource.getRepository(RouteCity);
      const storyRouteRepo = AppDataSource.getRepository(StoryRoute);
      
      // Get routes, optionally filtered by category
      let routeQuery = routeRepo.createQueryBuilder('route')
        .where('route.deletedAt IS NULL');
      
      if (categoryId) {
        const routeCategories = await routeCategoryRepo.find({
          where: { categoryId: parseInt(categoryId) }
        });
        const routeIds = routeCategories.map(rc => rc.routeId);
        if (routeIds.length > 0) {
          routeQuery = routeQuery.andWhere('route.routeId IN (:...routeIds)', { routeIds });
        }
      }
      
      const routes = await routeQuery.getMany();
      
      // Get detailed data for each route
      const routesWithData = await Promise.all(routes.map(async (route) => {
        const title = await this.getLocalizedText(route.titleTextRefId, language);
        const description = await this.getLocalizedText(route.descriptionTextRefId, language);
        
        // Get categories for this route
        const routeCategories = await routeCategoryRepo.find({
          where: { routeId: route.routeId },
          relations: ['category']
        });
        
        const categories = routeCategories.map(rc => rc.categoryId.toString());
        
        // Get cities count (stops)
        const citiesCount = await routeCityRepo.count({
          where: { routeId: route.routeId }
        });
        
        // Get stories count
        const storiesCount = await storyRouteRepo.count({
          where: { routeId: route.routeId }
        });
        
        // Calculate total distance (placeholder - would need actual calculation)
        const totalDistance = `${citiesCount * 50}km`; // Placeholder calculation
        
        return {
          id: route.routeId.toString(),
          title: title || 'Unnamed Route',
          description: description,
          image: route.imageUrl,
          categories: categories,
          stops: citiesCount,
          totalDistance: totalDistance,
          stories: storiesCount
        };
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

  async getCities(req: Request, res: Response): Promise<void> {
    try {
      const language = this.getLanguageFromRequest(req);
      
      const cityRepo = AppDataSource.getRepository(City);
      const storyCityRepo = AppDataSource.getRepository(StoryCity);
      const routeCityRepo = AppDataSource.getRepository(RouteCity);
      
      const cities = await cityRepo.find();
      
      const citiesWithData = await Promise.all(cities.map(async (city) => {
        const name = await this.getLocalizedText(city.nameTextRefId, language);
        const description = await this.getLocalizedText(city.descriptionTextRefId, language);
        
        // Get stories count
        const storiesCount = await storyCityRepo.count({
          where: { cityId: city.cityId }
        });
        
        // Get routes count for distance calculation
        const routesCount = await routeCityRepo.count({
          where: { cityId: city.cityId }
        });
        
        // Calculate total distance (placeholder)
        const totalDistance = `${routesCount * 30}km de rotas`;
        
        return {
          id: city.cityId.toString(),
          name: name || 'Unnamed City',
          description: description,
          state: city.state,
          image: city.imageUrl,
          latitude: parseFloat(city.latitude.toString()),
          longitude: parseFloat(city.longitude.toString()),
          totalDistance: totalDistance,
          stories: storiesCount
        };
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

  async getEvents(req: Request, res: Response): Promise<void> {
    try {
      const language = this.getLanguageFromRequest(req);
      const cityId = req.query.cityId as string;
      
      const eventRepo = AppDataSource.getRepository(Event);
      const categoryRepo = AppDataSource.getRepository(Category);
      
      let eventQuery = eventRepo.createQueryBuilder('event')
        .leftJoinAndSelect('event.city', 'city')
        .leftJoinAndSelect('event.eventCategories', 'eventCategories')
        .leftJoinAndSelect('eventCategories.category', 'category')
        .where('event.deletedAt IS NULL');
      
      if (cityId) {
        eventQuery = eventQuery.andWhere('event.cityId = :cityId', { cityId: parseInt(cityId) });
      }
      
      const events = await eventQuery.getMany();
      
      const eventsWithData = await Promise.all(events.map(async (event) => {
        const name = await this.getLocalizedText(event.nameTextRefId, language);
        const description = await this.getLocalizedText(event.descriptionTextRefId, language);
        const location = await this.getLocalizedText(event.locationTextRefId, language);
        
        // Get event type from first category
        let eventType = 'Evento';
        if (event.eventCategories && event.eventCategories.length > 0) {
          const firstCategory = event.eventCategories[0];
          const categoryName = firstCategory ? await this.getLocalizedText(
            firstCategory.category.nameTextRefId, 
            language
          ) : null;
          eventType = categoryName || 'Evento';
        }
        
        // Format date and time
        const eventDate = new Date(event.eventDate);
        const formattedDate = eventDate.toLocaleDateString('pt-BR', {
          day: 'numeric',
          month: 'long'
        });
        
        return {
          id: event.eventId.toString(),
          name: name || 'Unnamed Event',
          description: description,
          type: eventType,
          location: location || 'Local não especificado',
          date: formattedDate,
          time: event.eventTime,
          image: event.imageUrl
        };
      }));
      
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

  async getBusinesses(req: Request, res: Response): Promise<void> {
    try {
      const language = this.getLanguageFromRequest(req);
      const cityId = req.query.cityId as string;
      
      const locationRepo = AppDataSource.getRepository(Location);
      const typeRepo = AppDataSource.getRepository(Type);
      
      // Get business type ID
      const businessType = await typeRepo.findOne({
        where: { nameTextRefId: In([1, 2, 3]) } // Placeholder - need to identify business type IDs
      });
      
      let locationQuery = locationRepo.createQueryBuilder('location')
        .leftJoinAndSelect('location.city', 'city')
        .where('location.deletedAt IS NULL');
      
      if (businessType) {
        locationQuery = locationQuery.andWhere('location.typeId = :typeId', { 
          typeId: businessType.typeId 
        });
      }
      
      if (cityId) {
        locationQuery = locationQuery.andWhere('location.cityId = :cityId', { 
          cityId: parseInt(cityId) 
        });
      }
      
      const locations = await locationQuery.limit(10).getMany();
      
      const businessesWithData = await Promise.all(locations.map(async (location) => {
        const name = await this.getLocalizedText(location.nameTextRefId, language);
        const description = await this.getLocalizedText(location.descriptionTextRefId, language);
        
        // Calculate distance (placeholder)
        const distance = `A ${Math.floor(Math.random() * 10) + 1}km de distância`;
        
        return {
          id: location.locationId.toString(),
          name: name || 'Unnamed Business',
          description: description,
          distance: distance,
          image: location.imageUrl,
          latitude: location.latitude ? parseFloat(location.latitude.toString()) : null,
          longitude: location.longitude ? parseFloat(location.longitude.toString()) : null
        };
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

  async getHistoricalPlaces(req: Request, res: Response): Promise<void> {
    try {
      const language = this.getLanguageFromRequest(req);
      const cityId = req.query.cityId as string;
      
      const locationRepo = AppDataSource.getRepository(Location);
      const storyLocationRepo = AppDataSource.getRepository(StoryLocation);
      const typeRepo = AppDataSource.getRepository(Type);
      
      // Get historical place type ID
      const historicalType = await typeRepo.findOne({
        where: { nameTextRefId: In([4, 5, 6]) } // Placeholder - need to identify historical type IDs
      });
      
      let locationQuery = locationRepo.createQueryBuilder('location')
        .leftJoinAndSelect('location.city', 'city')
        .where('location.deletedAt IS NULL');
      
      if (historicalType) {
        locationQuery = locationQuery.andWhere('location.typeId = :typeId', { 
          typeId: historicalType.typeId 
        });
      }
      
      if (cityId) {
        locationQuery = locationQuery.andWhere('location.cityId = :cityId', { 
          cityId: parseInt(cityId) 
        });
      }
      
      const locations = await locationQuery.limit(10).getMany();
      
      const historicalPlacesWithData = await Promise.all(locations.map(async (location) => {
        const name = await this.getLocalizedText(location.nameTextRefId, language);
        const description = await this.getLocalizedText(location.descriptionTextRefId, language);
        const cityName = location.city ? await this.getLocalizedText(location.city.nameTextRefId, language) : null;
        
        // Get stories count
        const storiesCount = await storyLocationRepo.count({
          where: { locationId: location.locationId }
        });
        
        const locationText = location.city ? `${cityName || location.city.state}, ${location.city.state}` : 'Location unknown';
        
        return {
          id: location.locationId.toString(),
          name: name || 'Unnamed Place',
          description: description,
          location: locationText,
          storiesCount: storiesCount,
          image: location.imageUrl,
          latitude: location.latitude ? parseFloat(location.latitude.toString()) : null,
          longitude: location.longitude ? parseFloat(location.longitude.toString()) : null
        };
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

  async searchCities(req: Request, res: Response): Promise<void> {
    try {
      const language = this.getLanguageFromRequest(req);
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
}
