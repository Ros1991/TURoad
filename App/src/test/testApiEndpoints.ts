/**
 * Test file to verify all API endpoints are correctly configured
 * Run this to test the integration with the backend
 */

import { getCategories, getRoutes, getRouteById } from '../services/RouteService';
import { getCities, searchCities, getCityById } from '../services/CityService';
import { getEvents, getUpcomingEvents, getEventById } from '../services/EventService';
import { getBusinesses, getFeaturedBusinesses, getBusinessById } from '../services/BusinessService';
import { getHistoricalPlaces, getFeaturedHistoricalPlaces, getHistoricalPlaceById } from '../services/HistoricalPlaceService';

export const testAllEndpoints = async () => {
  console.log('🚀 Starting API endpoint tests...\n');
  
  const results: { endpoint: string; status: 'success' | 'error'; message?: string }[] = [];
  
  // Test Categories
  try {
    console.log('Testing /api/public/categories...');
    const categories = await getCategories(false, 'pt');
    results.push({ 
      endpoint: '/api/public/categories', 
      status: categories.length > 0 ? 'success' : 'error',
      message: `Found ${categories.length} categories`
    });
  } catch (error) {
    results.push({ endpoint: '/api/public/categories', status: 'error', message: String(error) });
  }
  
  // Test Routes
  try {
    console.log('Testing /api/public/routes...');
    const routes = await getRoutes(undefined, 'pt');
    results.push({ 
      endpoint: '/api/public/routes', 
      status: routes.length > 0 ? 'success' : 'error',
      message: `Found ${routes.length} routes`
    });
  } catch (error) {
    results.push({ endpoint: '/api/public/routes', status: 'error', message: String(error) });
  }
  
  // Test Cities
  try {
    console.log('Testing /api/public/cities...');
    const cities = await getCities('pt');
    results.push({ 
      endpoint: '/api/public/cities', 
      status: cities.length > 0 ? 'success' : 'error',
      message: `Found ${cities.length} cities`
    });
  } catch (error) {
    results.push({ endpoint: '/api/public/cities', status: 'error', message: String(error) });
  }
  
  // Test City Search
  try {
    console.log('Testing /api/public/cities/search...');
    const searchResults = await searchCities('Ara', 'pt');
    results.push({ 
      endpoint: '/api/public/cities/search', 
      status: 'success',
      message: `Search returned ${searchResults.length} results`
    });
  } catch (error) {
    results.push({ endpoint: '/api/public/cities/search', status: 'error', message: String(error) });
  }
  
  // Test Events
  try {
    console.log('Testing /api/public/events...');
    const events = await getEvents('pt');
    results.push({ 
      endpoint: '/api/public/events', 
      status: 'success',
      message: `Found ${events.length} events`
    });
  } catch (error) {
    results.push({ endpoint: '/api/public/events', status: 'error', message: String(error) });
  }
  
  // Test Businesses
  try {
    console.log('Testing /api/public/locations/businesses...');
    const businesses = await getBusinesses('pt');
    results.push({ 
      endpoint: '/api/public/locations/businesses', 
      status: 'success',
      message: `Found ${businesses.length} businesses`
    });
  } catch (error) {
    results.push({ endpoint: '/api/public/locations/businesses', status: 'error', message: String(error) });
  }
  
  // Test Historical Places
  try {
    console.log('Testing /api/public/locations/historical...');
    const places = await getHistoricalPlaces('pt');
    results.push({ 
      endpoint: '/api/public/locations/historical', 
      status: 'success',
      message: `Found ${places.length} historical places`
    });
  } catch (error) {
    results.push({ endpoint: '/api/public/locations/historical', status: 'error', message: String(error) });
  }
  
  // Print results summary
  console.log('\n📊 Test Results Summary:');
  console.log('========================\n');
  
  results.forEach(result => {
    const icon = result.status === 'success' ? '✅' : '❌';
    console.log(`${icon} ${result.endpoint}`);
    if (result.message) {
      console.log(`   ${result.message}`);
    }
  });
  
  const successCount = results.filter(r => r.status === 'success').length;
  const totalCount = results.length;
  
  console.log('\n------------------------');
  console.log(`Total: ${successCount}/${totalCount} endpoints working`);
  
  if (successCount === totalCount) {
    console.log('🎉 All endpoints are working correctly!');
  } else {
    console.log('⚠️ Some endpoints are failing. Please check the backend server.');
  }
  
  return results;
};

// Test with different languages
export const testMultiLanguageSupport = async () => {
  console.log('\n🌍 Testing Multi-language Support...\n');
  
  const languages = ['pt', 'en', 'es'];
  
  for (const lang of languages) {
    console.log(`\nTesting with language: ${lang}`);
    console.log('------------------------');
    
    try {
      const categories = await getCategories(false, lang);
      const cities = await getCities(lang);
      const events = await getEvents(lang);
      
      console.log(`✅ Categories: ${categories.length} items`);
      console.log(`✅ Cities: ${cities.length} items`);
      console.log(`✅ Events: ${events.length} items`);
      
      // Check if we have localized content
      if (categories.length > 0 && categories[0].name) {
        console.log(`   Sample category name: "${categories[0].name}"`);
      }
    } catch (error) {
      console.log(`❌ Error testing ${lang}: ${error}`);
    }
  }
};
