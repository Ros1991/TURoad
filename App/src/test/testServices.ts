import { getCategories, getRoutes } from '../services/RouteService';
import { getCities, getCityById, searchCities } from '../services/CityService';
import { getEvents, getEventById, getUpcomingEvents } from '../services/EventService';
import { getBusinesses, getBusinessById, getBusinessesByType, getFeaturedBusinesses } from '../services/BusinessService';
import { getHistoricalPlaces, getHistoricalPlaceById, getHistoricalPlacesByCity, getFeaturedHistoricalPlaces } from '../services/HistoricalPlaceService';

// Test function to verify all services are working
export async function testAllServices() {
  console.log('=== Testing All Services with Real Backend Data ===\n');
  
  const testLanguages = ['pt', 'en', 'es'];
  
  for (const lang of testLanguages) {
    console.log(`\n--- Testing with language: ${lang} ---\n`);
    
    try {
      // Test RouteService
      console.log('Testing RouteService...');
      const categories = await getCategories(true, lang);
      console.log(`✓ Categories loaded: ${categories.length} items`);
      if (categories.length > 0) {
        console.log(`  Sample: ${categories[0].name}`);
      }
      
      const routes = await getRoutes(lang);
      console.log(`✓ Routes loaded: ${routes.length} items`);
      if (routes.length > 0) {
        console.log(`  Sample: ${routes[0].name}`);
      }
      
      // Test CityService
      console.log('\nTesting CityService...');
      const cities = await getCities(lang);
      console.log(`✓ Cities loaded: ${cities.length} items`);
      if (cities.length > 0) {
        console.log(`  Sample: ${cities[0].name}`);
        
        const cityDetail = await getCityById(cities[0].id, lang);
        console.log(`✓ City detail loaded: ${cityDetail?.name}`);
      }
      
      const searchResults = await searchCities('ara', lang);
      console.log(`✓ City search results: ${searchResults.length} items`);
      
      // Test EventService
      console.log('\nTesting EventService...');
      const events = await getEvents(lang);
      console.log(`✓ Events loaded: ${events.length} items`);
      if (events.length > 0) {
        console.log(`  Sample: ${events[0].title}`);
        
        const eventDetail = await getEventById(events[0].id, lang);
        console.log(`✓ Event detail loaded: ${eventDetail?.title}`);
      }
      
      const upcomingEvents = await getUpcomingEvents(lang);
      console.log(`✓ Upcoming events: ${upcomingEvents.length} items`);
      
      // Test BusinessService
      console.log('\nTesting BusinessService...');
      const businesses = await getBusinesses(lang);
      console.log(`✓ Businesses loaded: ${businesses.length} items`);
      if (businesses.length > 0) {
        console.log(`  Sample: ${businesses[0].name}`);
        
        const businessDetail = await getBusinessById(businesses[0].id, lang);
        console.log(`✓ Business detail loaded: ${businessDetail?.name}`);
      }
      
      const restaurantBusinesses = await getBusinessesByType('restaurant', lang);
      console.log(`✓ Restaurant businesses: ${restaurantBusinesses.length} items`);
      
      const featuredBusinesses = await getFeaturedBusinesses(lang);
      console.log(`✓ Featured businesses: ${featuredBusinesses.length} items`);
      
      // Test HistoricalPlaceService
      console.log('\nTesting HistoricalPlaceService...');
      const historicalPlaces = await getHistoricalPlaces(lang);
      console.log(`✓ Historical places loaded: ${historicalPlaces.length} items`);
      if (historicalPlaces.length > 0) {
        console.log(`  Sample: ${historicalPlaces[0].name}`);
        
        const placeDetail = await getHistoricalPlaceById(historicalPlaces[0].id, lang);
        console.log(`✓ Historical place detail loaded: ${placeDetail?.name}`);
      }
      
      if (cities.length > 0) {
        const placesByCity = await getHistoricalPlacesByCity(cities[0].id, lang);
        console.log(`✓ Historical places by city: ${placesByCity.length} items`);
      }
      
      const featuredPlaces = await getFeaturedHistoricalPlaces(lang);
      console.log(`✓ Featured historical places: ${featuredPlaces.length} items`);
      
    } catch (error) {
      console.error(`✗ Error testing services with language ${lang}:`, error);
    }
  }
  
  console.log('\n=== All Services Test Complete ===');
}

// Function to test HomeScreen data loading
export async function testHomeScreenData() {
  console.log('=== Testing HomeScreen Data Loading ===\n');
  
  const currentLanguage = 'pt'; // Default language
  
  try {
    console.log('Loading all data in parallel (like HomeScreen does)...\n');
    
    const startTime = Date.now();
    
    const [
      categoriesData, 
      routesData, 
      citiesData, 
      eventsData, 
      businessesData, 
      historicalPlacesData
    ] = await Promise.all([
      getCategories(true, currentLanguage),
      getRoutes(currentLanguage),
      getCities(currentLanguage),
      getEvents(currentLanguage),
      getBusinesses(currentLanguage),
      getHistoricalPlaces(currentLanguage),
    ]);
    
    const loadTime = Date.now() - startTime;
    
    console.log('✓ All data loaded successfully!');
    console.log(`  Load time: ${loadTime}ms\n`);
    
    console.log('Data summary:');
    console.log(`  - Categories: ${categoriesData.length} items`);
    console.log(`  - Routes: ${routesData.length} items`);
    console.log(`  - Cities: ${citiesData.length} items`);
    console.log(`  - Events: ${eventsData.length} items`);
    console.log(`  - Businesses: ${businessesData.length} items`);
    console.log(`  - Historical Places: ${historicalPlacesData.length} items`);
    
    // Verify data structure
    console.log('\nVerifying data structure...');
    
    if (categoriesData.length > 0) {
      const category = categoriesData[0];
      console.log(`✓ Category structure: id=${category.id}, name="${category.name}"`);
    }
    
    if (routesData.length > 0) {
      const route = routesData[0];
      console.log(`✓ Route structure: id=${route.id}, name="${route.name}", distance=${route.totalDistance}km`);
    }
    
    if (citiesData.length > 0) {
      const city = citiesData[0];
      console.log(`✓ City structure: id=${city.id}, name="${city.name}", state="${city.state}"`);
    }
    
    if (eventsData.length > 0) {
      const event = eventsData[0];
      console.log(`✓ Event structure: id=${event.id}, title="${event.title}"`);
    }
    
    if (businessesData.length > 0) {
      const business = businessesData[0];
      console.log(`✓ Business structure: id=${business.id}, name="${business.name}", type="${business.type}"`);
    }
    
    if (historicalPlacesData.length > 0) {
      const place = historicalPlacesData[0];
      console.log(`✓ Historical Place structure: id=${place.id}, name="${place.name}"`);
    }
    
  } catch (error) {
    console.error('✗ Error loading HomeScreen data:', error);
  }
  
  console.log('\n=== HomeScreen Data Test Complete ===');
}
