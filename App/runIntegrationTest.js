/**
 * Node.js script to run the TURoad integration tests
 * This script can be executed directly with Node.js to test API connectivity
 */

const axios = require('axios');

// API configuration
const API_BASE_URL = 'http://localhost:3001/api';

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Helper function to make API calls
async function testEndpoint(endpoint, language = 'pt') {
  try {
    const response = await axios.get(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Accept-Language': language,
        'Content-Type': 'application/json'
      }
    });
    return {
      success: true,
      data: response.data,
      status: response.status
    };
  } catch (error) {
    return {
      success: false,
      error: error.response ? error.response.data : error.message,
      status: error.response ? error.response.status : 0
    };
  }
}

// Main test function
async function runIntegrationTests() {
  console.log(`${colors.bright}${colors.cyan}🚀 TURoad Integration Test Suite${colors.reset}\n`);
  console.log(`Testing API at: ${API_BASE_URL}\n`);
  console.log('========================================\n');

  const testResults = [];
  
  // Define all endpoints to test
  const endpoints = [
    { path: '/public/categories', name: 'Categories' },
    { path: '/public/routes', name: 'Routes' },
    { path: '/public/cities', name: 'Cities' },
    { path: '/public/events', name: 'Events' },
    { path: '/public/locations/businesses', name: 'Businesses' },
    { path: '/public/locations/historical', name: 'Historical Places' }
  ];

  // Test each endpoint
  for (const endpoint of endpoints) {
    process.stdout.write(`Testing ${endpoint.name}... `);
    const startTime = Date.now();
    const result = await testEndpoint(endpoint.path);
    const responseTime = Date.now() - startTime;
    
    if (result.success) {
      const itemCount = result.data?.data?.length || 0;
      console.log(`${colors.green}✓${colors.reset} (${itemCount} items, ${responseTime}ms)`);
      testResults.push({ ...endpoint, success: true, itemCount, responseTime });
    } else {
      console.log(`${colors.red}✗${colors.reset} (${result.status || 'Error'}: ${result.error})`);
      testResults.push({ ...endpoint, success: false, error: result.error, status: result.status });
    }
  }

  // Test multi-language support
  console.log(`\n${colors.bright}Testing Multi-language Support:${colors.reset}`);
  const languages = ['pt', 'en', 'es'];
  
  for (const lang of languages) {
    process.stdout.write(`  Language ${lang.toUpperCase()}... `);
    const result = await testEndpoint('/public/categories', lang);
    if (result.success) {
      console.log(`${colors.green}✓${colors.reset}`);
    } else {
      console.log(`${colors.red}✗${colors.reset}`);
    }
  }

  // Summary
  console.log('\n========================================');
  console.log(`${colors.bright}📊 TEST SUMMARY${colors.reset}`);
  console.log('========================================\n');
  
  const successCount = testResults.filter(r => r.success).length;
  const failCount = testResults.filter(r => !r.success).length;
  const avgResponseTime = testResults
    .filter(r => r.success)
    .reduce((acc, r) => acc + r.responseTime, 0) / (successCount || 1);

  console.log(`${colors.green}✓ Successful:${colors.reset} ${successCount}/${testResults.length}`);
  console.log(`${colors.red}✗ Failed:${colors.reset} ${failCount}/${testResults.length}`);
  console.log(`⏱️  Avg Response Time: ${Math.round(avgResponseTime)}ms`);

  // Detailed failure report
  if (failCount > 0) {
    console.log(`\n${colors.yellow}⚠️  Failed Endpoints:${colors.reset}`);
    testResults.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.name}: ${r.status || 'Connection Error'} - ${r.error}`);
    });
  }

  // Final verdict
  console.log('\n========================================');
  if (successCount === testResults.length) {
    console.log(`${colors.green}${colors.bright}🎉 ALL TESTS PASSED!${colors.reset}`);
    console.log('The app is fully integrated with the backend.');
  } else if (successCount > 0) {
    console.log(`${colors.yellow}${colors.bright}⚠️  PARTIAL SUCCESS${colors.reset}`);
    console.log('Some endpoints are working, but others need attention.');
  } else {
    console.log(`${colors.red}${colors.bright}❌ CRITICAL FAILURE${colors.reset}`);
    console.log('No endpoints are working. Please check if the backend is running.');
  }
  console.log('========================================\n');

  process.exit(failCount > 0 ? 1 : 0);
}

// Check if axios is installed
try {
  require.resolve('axios');
  // Run the tests
  runIntegrationTests().catch(error => {
    console.error(`${colors.red}Test execution failed:${colors.reset}`, error);
    process.exit(1);
  });
} catch(e) {
  console.log(`${colors.yellow}Installing axios...${colors.reset}`);
  const { execSync } = require('child_process');
  try {
    execSync('npm install axios', { stdio: 'inherit', cwd: __dirname });
    console.log(`${colors.green}axios installed successfully!${colors.reset}\n`);
    // Re-run the script
    delete require.cache[require.resolve('axios')];
    runIntegrationTests().catch(error => {
      console.error(`${colors.red}Test execution failed:${colors.reset}`, error);
      process.exit(1);
    });
  } catch (installError) {
    console.error(`${colors.red}Failed to install axios. Please run: npm install axios${colors.reset}`);
    process.exit(1);
  }
}
