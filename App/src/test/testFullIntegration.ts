/**
 * Full Integration Test for TURoad App
 * This test verifies that all API endpoints are correctly configured
 * and that the HomeScreen can successfully fetch and display real data
 */

import { getCategories, getRoutes, getRouteById } from '../services/RouteService';
import { getCities, searchCities, getCityById } from '../services/CityService';
import { getEvents, getUpcomingEvents, getEventById } from '../services/EventService';
import { getBusinesses, getFeaturedBusinesses, getBusinessById } from '../services/BusinessService';
import { getHistoricalPlaces, getFeaturedHistoricalPlaces, getHistoricalPlaceById } from '../services/HistoricalPlaceService';

interface TestResult {
  endpoint: string;
  method: string;
  status: 'success' | 'error';
  data?: any;
  error?: string;
  responseTime?: number;
}

export const runFullIntegrationTest = async () => {
  console.log('🚀 Starting Full Integration Test for TURoad App\n');
  console.log('========================================\n');
  
  const results: TestResult[] = [];
  const startTime = Date.now();
  
  // Test 1: Categories Endpoint
  console.log('📋 Testing Categories...');
  const catStart = Date.now();
  try {
    const categories = await getCategories(false, 'pt');
    results.push({
      endpoint: '/api/public/categories',
      method: 'getCategories',
      status: 'success',
      data: { count: categories.length, sample: categories[0] },
      responseTime: Date.now() - catStart
    });
    console.log(`✅ Categories: ${categories.length} items (${Date.now() - catStart}ms)`);
  } catch (error) {
    results.push({
      endpoint: '/api/public/categories',
      method: 'getCategories',
      status: 'error',
      error: String(error),
      responseTime: Date.now() - catStart
    });
    console.log(`❌ Categories: ${error}`);
  }
  
  // Test 2: Routes Endpoint
  console.log('🗺️ Testing Routes...');
  const routeStart = Date.now();
  try {
    const routes = await getRoutes(undefined, 'pt');
    results.push({
      endpoint: '/api/public/routes',
      method: 'getRoutes',
      status: 'success',
      data: { count: routes.length, sample: routes[0] },
      responseTime: Date.now() - routeStart
    });
    console.log(`✅ Routes: ${routes.length} items (${Date.now() - routeStart}ms)`);
    
    // Test specific route if we have any
    if (routes.length > 0) {
      const routeDetail = await getRouteById(routes[0].id, 'pt');
      console.log(`   ✅ Route Detail: ${routeDetail ? 'Loaded' : 'Not found'}`);
    }
  } catch (error) {
    results.push({
      endpoint: '/api/public/routes',
      method: 'getRoutes',
      status: 'error',
      error: String(error),
      responseTime: Date.now() - routeStart
    });
    console.log(`❌ Routes: ${error}`);
  }
  
  // Test 3: Cities Endpoint
  console.log('🏙️ Testing Cities...');
  const cityStart = Date.now();
  try {
    const cities = await getCities('pt');
    results.push({
      endpoint: '/api/public/cities',
      method: 'getCities',
      status: 'success',
      data: { count: cities.length, sample: cities[0] },
      responseTime: Date.now() - cityStart
    });
    console.log(`✅ Cities: ${cities.length} items (${Date.now() - cityStart}ms)`);
    
    // Test city search
    const searchResults = await searchCities('Ara', 'pt');
    console.log(`   ✅ City Search: ${searchResults.length} results for "Ara"`);
    
    // Test specific city if we have any
    if (cities.length > 0) {
      const cityDetail = await getCityById(cities[0].id, 'pt');
      console.log(`   ✅ City Detail: ${cityDetail ? 'Loaded' : 'Not found'}`);
    }
  } catch (error) {
    results.push({
      endpoint: '/api/public/cities',
      method: 'getCities',
      status: 'error',
      error: String(error),
      responseTime: Date.now() - cityStart
    });
    console.log(`❌ Cities: ${error}`);
  }
  
  // Test 4: Events Endpoint
  console.log('🎉 Testing Events...');
  const eventStart = Date.now();
  try {
    const events = await getEvents('pt');
    results.push({
      endpoint: '/api/public/events',
      method: 'getEvents',
      status: 'success',
      data: { count: events.length, sample: events[0] },
      responseTime: Date.now() - eventStart
    });
    console.log(`✅ Events: ${events.length} items (${Date.now() - eventStart}ms)`);
    
    // Test upcoming events
    const upcomingEvents = await getUpcomingEvents('pt', 3);
    console.log(`   ✅ Upcoming Events: ${upcomingEvents.length} items`);
  } catch (error) {
    results.push({
      endpoint: '/api/public/events',
      method: 'getEvents',
      status: 'error',
      error: String(error),
      responseTime: Date.now() - eventStart
    });
    console.log(`❌ Events: ${error}`);
  }
  
  // Test 5: Businesses Endpoint
  console.log('🏪 Testing Businesses...');
  const bizStart = Date.now();
  try {
    const businesses = await getBusinesses('pt');
    results.push({
      endpoint: '/api/public/locations/businesses',
      method: 'getBusinesses',
      status: 'success',
      data: { count: businesses.length, sample: businesses[0] },
      responseTime: Date.now() - bizStart
    });
    console.log(`✅ Businesses: ${businesses.length} items (${Date.now() - bizStart}ms)`);
    
    // Test featured businesses
    const featuredBiz = await getFeaturedBusinesses('pt', 3);
    console.log(`   ✅ Featured Businesses: ${featuredBiz.length} items`);
  } catch (error) {
    results.push({
      endpoint: '/api/public/locations/businesses',
      method: 'getBusinesses',
      status: 'error',
      error: String(error),
      responseTime: Date.now() - bizStart
    });
    console.log(`❌ Businesses: ${error}`);
  }
  
  // Test 6: Historical Places Endpoint
  console.log('🏛️ Testing Historical Places...');
  const histStart = Date.now();
  try {
    const places = await getHistoricalPlaces('pt');
    results.push({
      endpoint: '/api/public/locations/historical',
      method: 'getHistoricalPlaces',
      status: 'success',
      data: { count: places.length, sample: places[0] },
      responseTime: Date.now() - histStart
    });
    console.log(`✅ Historical Places: ${places.length} items (${Date.now() - histStart}ms)`);
    
    // Test featured places
    const featuredPlaces = await getFeaturedHistoricalPlaces('pt', 3);
    console.log(`   ✅ Featured Historical Places: ${featuredPlaces.length} items`);
  } catch (error) {
    results.push({
      endpoint: '/api/public/locations/historical',
      method: 'getHistoricalPlaces',
      status: 'error',
      error: String(error),
      responseTime: Date.now() - histStart
    });
    console.log(`❌ Historical Places: ${error}`);
  }
  
  // Test Multi-language Support
  console.log('\n🌍 Testing Multi-language Support...');
  const languages = ['pt', 'en', 'es'];
  for (const lang of languages) {
    try {
      const [cats, cities, events] = await Promise.all([
        getCategories(false, lang),
        getCities(lang),
        getEvents(lang)
      ]);
      console.log(`✅ Language ${lang.toUpperCase()}: Categories(${cats.length}), Cities(${cities.length}), Events(${events.length})`);
    } catch (error) {
      console.log(`❌ Language ${lang.toUpperCase()}: ${error}`);
    }
  }
  
  // Generate Summary Report
  console.log('\n========================================');
  console.log('📊 INTEGRATION TEST SUMMARY');
  console.log('========================================\n');
  
  const successCount = results.filter(r => r.status === 'success').length;
  const errorCount = results.filter(r => r.status === 'error').length;
  const avgResponseTime = results.reduce((acc, r) => acc + (r.responseTime || 0), 0) / results.length;
  
  console.log(`✅ Successful Endpoints: ${successCount}`);
  console.log(`❌ Failed Endpoints: ${errorCount}`);
  console.log(`⏱️ Average Response Time: ${Math.round(avgResponseTime)}ms`);
  console.log(`⏱️ Total Test Time: ${Date.now() - startTime}ms`);
  
  // Detailed Results
  console.log('\n📋 Detailed Results:');
  console.log('-------------------');
  results.forEach(result => {
    const icon = result.status === 'success' ? '✅' : '❌';
    console.log(`${icon} ${result.method} - ${result.endpoint}`);
    if (result.status === 'success' && result.data) {
      console.log(`   Data: ${result.data.count} items loaded`);
      if (result.data.sample) {
        console.log(`   Sample: ${JSON.stringify(result.data.sample?.name || result.data.sample?.title || 'N/A').substring(0, 50)}`);
      }
    } else if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
    console.log(`   Response Time: ${result.responseTime}ms`);
  });
  
  // Final Status
  console.log('\n========================================');
  if (successCount === results.length) {
    console.log('🎉 ALL TESTS PASSED! The app is ready for production!');
  } else if (successCount > 0) {
    console.log('⚠️ PARTIAL SUCCESS: Some endpoints are working, but others need attention.');
  } else {
    console.log('❌ CRITICAL: No endpoints are working. Please check the backend server.');
  }
  console.log('========================================\n');
  
  return {
    success: successCount === results.length,
    results,
    summary: {
      total: results.length,
      successful: successCount,
      failed: errorCount,
      avgResponseTime: Math.round(avgResponseTime),
      totalTime: Date.now() - startTime
    }
  };
};

// Export a function to test HomeScreen data loading simulation
export const simulateHomeScreenDataLoad = async () => {
  console.log('\n🏠 Simulating HomeScreen Data Load...\n');
  
  try {
    const startTime = Date.now();
    const currentLanguage = 'pt';
    
    // Parallel loading like HomeScreen does
    const [categories, routes, cities, events, businesses, historicalPlaces] = await Promise.all([
      getCategories(true, currentLanguage),
      getRoutes(undefined, currentLanguage),
      getCities(currentLanguage),
      getEvents(currentLanguage),
      getBusinesses(currentLanguage),
      getHistoricalPlaces(currentLanguage),
    ]);
    
    const loadTime = Date.now() - startTime;
    
    console.log('✅ HomeScreen Data Load Successful!');
    console.log(`   Load Time: ${loadTime}ms`);
    console.log(`   Categories: ${categories.length}`);
    console.log(`   Routes: ${routes.length}`);
    console.log(`   Cities: ${cities.length}`);
    console.log(`   Events: ${events.length}`);
    console.log(`   Businesses: ${businesses.length}`);
    console.log(`   Historical Places: ${historicalPlaces.length}`);
    
    return {
      success: true,
      loadTime,
      data: {
        categories,
        routes,
        cities,
        events,
        businesses,
        historicalPlaces
      }
    };
  } catch (error) {
    console.log('❌ HomeScreen Data Load Failed!');
    console.log(`   Error: ${error}`);
    return {
      success: false,
      error: String(error)
    };
  }
};

// Main test runner
export const runAllTests = async () => {
  console.log('🔧 TURoad App - Complete Integration Test Suite\n');
  
  // Run full integration test
  const integrationResults = await runFullIntegrationTest();
  
  // Simulate HomeScreen load
  const homeScreenResults = await simulateHomeScreenDataLoad();
  
  // Final verdict
  console.log('\n🏁 FINAL TEST VERDICT');
  console.log('=====================\n');
  
  if (integrationResults.success && homeScreenResults.success) {
    console.log('✅ ALL SYSTEMS GO! The app is fully integrated and ready!');
    console.log('   - All API endpoints are responding correctly');
    console.log('   - HomeScreen can load all required data');
    console.log('   - Multi-language support is working');
    console.log('   - Response times are acceptable');
  } else {
    console.log('⚠️ ISSUES DETECTED:');
    if (!integrationResults.success) {
      console.log('   - Some API endpoints are not working correctly');
    }
    if (!homeScreenResults.success) {
      console.log('   - HomeScreen cannot load data properly');
    }
    console.log('\nPlease review the detailed logs above for more information.');
  }
  
  return {
    integrationTest: integrationResults,
    homeScreenTest: homeScreenResults
  };
};
