// More detailed test to check for specific edge cases
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Use built-in fetch if available (Node 18+) or http module
const fetch = globalThis.fetch || (async (url, options) => {
  const http = require('http');
  const https = require('https');
  const { URL } = require('url');
  
  const urlObj = new URL(url);
  const client = urlObj.protocol === 'https:' ? https : http;
  
  return new Promise((resolve, reject) => {
    const req = client.request(url, {
      method: options?.method || 'GET',
      headers: options?.headers || {},
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          ok: res.statusCode >= 200 && res.statusCode < 300,
          status: res.statusCode,
          json: () => Promise.resolve(JSON.parse(data))
        });
      });
    });
    
    req.on('error', reject);
    
    if (options?.body) {
      req.write(options.body);
    }
    
    req.end();
  });
});

const BASE_URL = 'http://localhost:3002';

async function detailedTest() {
  console.log('🔍 Detailed test for restaurants starting with "Yogi" and "MLBB"');
  console.log('================================================================================');

  // Create a test user
  const registerResponse = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: 'detailedtest',
      email: 'detailedtest@example.com',
      password: 'Password123!'
    })
  });

  const registerResult = await registerResponse.json();
  
  if (!registerResponse.ok) {
    console.log('Failed to create test user:', registerResult);
    return;
  }

  const token = registerResult.data.token;
  console.log('✅ Test user created');

  // Test specific scenarios that might be causing issues
  const problematicRestaurants = [
    { id: 8, name: "Yogi", user_id: 3 },
    { id: 11, name: "MLBB Hot Pot 马路边边", user_id: 7 },
    { id: 13, name: "Yogi Korean Restaurant", user_id: 7 }
  ];

  console.log('\n1. Testing multiple toggles (favorite -> unfavorite -> favorite):');
  
  for (const restaurant of problematicRestaurants) {
    console.log(`\n   Testing ${restaurant.name} (ID: ${restaurant.id}):`);
    
    // First toggle (should favorite)
    let response = await fetch(`${BASE_URL}/api/user-favorites/restaurants/${restaurant.id}/toggle`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
    let result = await response.json();
    console.log(`   - First toggle: ${response.status} - ${result.message} (${result.data?.is_favorite})`);

    // Second toggle (should unfavorite)
    response = await fetch(`${BASE_URL}/api/user-favorites/restaurants/${restaurant.id}/toggle`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
    result = await response.json();
    console.log(`   - Second toggle: ${response.status} - ${result.message} (${result.data?.is_favorite})`);

    // Third toggle (should favorite again)
    response = await fetch(`${BASE_URL}/api/user-favorites/restaurants/${restaurant.id}/toggle`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
    result = await response.json();
    console.log(`   - Third toggle: ${response.status} - ${result.message} (${result.data?.is_favorite})`);
  }

  console.log('\n2. Testing with different HTTP methods and headers:');
  
  // Test with different Content-Type
  console.log('\n   Testing without Content-Type header:');
  let response = await fetch(`${BASE_URL}/api/user-favorites/restaurants/8/toggle`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    }
  });
  let result = await response.json();
  console.log(`   - Status: ${response.status}, Message: ${result.message}`);

  // Test with invalid restaurant ID
  console.log('\n   Testing with non-existent restaurant:');
  response = await fetch(`${BASE_URL}/api/user-favorites/restaurants/99999/toggle`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  });
  result = await response.json();
  console.log(`   - Status: ${response.status}, Message: ${result.error || result.message}`);

  console.log('\n3. Testing concurrent requests to same restaurant:');
  
  // Test concurrent requests
  const promises = [];
  for (let i = 0; i < 3; i++) {
    promises.push(
      fetch(`${BASE_URL}/api/user-favorites/restaurants/8/toggle`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      })
    );
  }

  const concurrentResults = await Promise.all(promises);
  for (let i = 0; i < concurrentResults.length; i++) {
    const res = concurrentResults[i];
    const data = await res.json();
    console.log(`   - Concurrent request ${i + 1}: ${res.status} - ${data.message} (${data.data?.is_favorite})`);
  }

  console.log('\n4. Testing character encoding issues:');
  
  // Test the restaurant with Chinese characters specifically
  response = await fetch(`${BASE_URL}/api/user-favorites/restaurants/11/toggle`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json; charset=utf-8',
    }
  });
  result = await response.json();
  console.log(`   - MLBB Hot Pot with UTF-8: ${response.status} - ${result.message}`);

  console.log('\n5. Testing rate limiting:');
  
  // Test rapid requests
  for (let i = 0; i < 5; i++) {
    response = await fetch(`${BASE_URL}/api/user-favorites/restaurants/8/toggle`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
    result = await response.json();
    console.log(`   - Rapid request ${i + 1}: ${response.status} - ${result.message || result.error}`);
  }

  console.log('\n================================================================================');
  console.log('Detailed testing complete!');
}

detailedTest().catch(console.error);