// Test script to simulate the exact API calls for favorite functionality
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

async function testFavoriteAPIs() {
  console.log('🧪 Testing Favorite APIs for restaurants starting with "Yogi" and "MLBB"');
  console.log('================================================================================');

  // Test data from our investigation
  const problematicRestaurants = [
    { id: 8, name: "Yogi", user_id: 3 },
    { id: 11, name: "MLBB Hot Pot 马路边边", user_id: 7 },
    { id: 13, name: "Yogi Korean Restaurant", user_id: 7 }
  ];

  // First, let's try to authenticate as a user (we'll try user 7 since they seem active)
  console.log('\n1. Testing Authentication...');
  
  // Try to login as a user (need to check what emails exist in database)
  try {
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'zhangxuyang.chn@gmail.com', // Using actual email from database
        password: 'Password123!' // Strong password that meets requirements
      })
    });

    const loginResult = await loginResponse.json();
    console.log('   Login response:', loginResponse.status, loginResult);

    if (loginResponse.ok && loginResult.data && loginResult.data.token) {
      const token = loginResult.data.token;
      console.log('   ✅ Authentication successful');

      // Now test the favorite endpoints
      console.log('\n2. Testing Cross-User Favorite Endpoints (user_favorites)...');
      
      for (const restaurant of problematicRestaurants) {
        console.log(`\n   Testing restaurant ${restaurant.id}: "${restaurant.name}"`);
        
        try {
          const response = await fetch(`${BASE_URL}/api/user-favorites/restaurants/${restaurant.id}/toggle`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            }
          });

          const result = await response.json();
          console.log(`   - Status: ${response.status}`);
          console.log(`   - Response:`, result);

          if (!response.ok) {
            console.log(`   ❌ Failed to toggle favorite for ${restaurant.name}`);
          } else {
            console.log(`   ✅ Successfully toggled favorite for ${restaurant.name}`);
          }
        } catch (error) {
          console.log(`   ❌ Error testing ${restaurant.name}:`, error.message);
        }
      }

      // Test own restaurant favorites (for restaurants owned by user 7)
      console.log('\n3. Testing Own Restaurant Favorite Endpoints...');
      
      const ownRestaurants = problematicRestaurants.filter(r => r.user_id === 7);
      
      for (const restaurant of ownRestaurants) {
        console.log(`\n   Testing own restaurant ${restaurant.id}: "${restaurant.name}"`);
        
        try {
          const response = await fetch(`${BASE_URL}/api/restaurants/${restaurant.id}/favorite`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              is_favorite: true
            })
          });

          const result = await response.json();
          console.log(`   - Status: ${response.status}`);
          console.log(`   - Response:`, result);

          if (!response.ok) {
            console.log(`   ❌ Failed to favorite own restaurant ${restaurant.name}`);
          } else {
            console.log(`   ✅ Successfully favorited own restaurant ${restaurant.name}`);
          }
        } catch (error) {
          console.log(`   ❌ Error testing own restaurant ${restaurant.name}:`, error.message);
        }
      }

    } else {
      console.log('   ❌ Authentication failed, trying with a test user...');
      
      // Try creating a test user
      const registerResponse = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'testfavorites',
          email: 'testfavorites@example.com',
          password: 'Password123!' // Strong password that meets requirements
        })
      });

      const registerResult = await registerResponse.json();
      console.log('   Register response:', registerResponse.status, registerResult);

      if (registerResponse.ok && registerResult.data && registerResult.data.token) {
        const token = registerResult.data.token;
        console.log('   ✅ Test user created and authenticated');

        // Test with new user
        console.log('\n2. Testing with new test user...');
        
        for (const restaurant of problematicRestaurants) {
          console.log(`\n   Testing restaurant ${restaurant.id}: "${restaurant.name}"`);
          
          try {
            const response = await fetch(`${BASE_URL}/api/user-favorites/restaurants/${restaurant.id}/toggle`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              }
            });

            const result = await response.json();
            console.log(`   - Status: ${response.status}`);
            console.log(`   - Response:`, result);

            if (!response.ok) {
              console.log(`   ❌ Failed to toggle favorite for ${restaurant.name}`);
            } else {
              console.log(`   ✅ Successfully toggled favorite for ${restaurant.name}`);
            }
          } catch (error) {
            console.log(`   ❌ Error testing ${restaurant.name}:`, error.message);
          }
        }
      }
    }

  } catch (error) {
    console.log('   ❌ Authentication error:', error.message);
    console.log('   This might be because the server is not running or the endpoint is different');
    console.log('   Make sure the server is running on port 3002');
  }

  console.log('\n================================================================================');
  console.log('API Testing complete!');
}

// Run the test
testFavoriteAPIs().catch(console.error);