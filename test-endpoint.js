// Test specific endpoint to debug 404 issue
const API_BASE_URL = 'http://localhost:8000/api';

async function testEndpoint() {
  console.log('Testing backend server...');
  
  // Test 1: Check if backend is running
  try {
    const response = await fetch('http://localhost:8000/');
    console.log('Backend server status:', response.status);
    const text = await response.text();
    console.log('Backend response (first 200 chars):', text.substring(0, 200));
  } catch (error) {
    console.error('Backend server not accessible:', error.message);
    return;
  }
  
  // Test 2: Check API base URL
  try {
    const response = await fetch(API_BASE_URL + '/');
    console.log('API base status:', response.status);
    const text = await response.text();
    console.log('API base response (first 200 chars):', text.substring(0, 200));
  } catch (error) {
    console.error('API base not accessible:', error.message);
  }
  
  // Test 3: Check auth endpoints
  try {
    const response = await fetch(API_BASE_URL + '/auth/');
    console.log('Auth endpoints status:', response.status);
    const text = await response.text();
    console.log('Auth response (first 200 chars):', text.substring(0, 200));
  } catch (error) {
    console.error('Auth endpoints not accessible:', error.message);
  }
  
  // Test 4: Check pending advocates endpoint (without auth)
  try {
    const response = await fetch(API_BASE_URL + '/auth/advocates/pending/');
    console.log('Pending advocates endpoint status:', response.status);
    const text = await response.text();
    console.log('Pending advocates response (first 200 chars):', text.substring(0, 200));
  } catch (error) {
    console.error('Pending advocates endpoint not accessible:', error.message);
  }
  
  // Test 5: Try login first
  try {
    console.log('\nTrying login...');
    const loginResponse = await fetch(API_BASE_URL + '/auth/login/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123'
      })
    });
    
    console.log('Login status:', loginResponse.status);
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('Login successful, token received');
      
      // Now try pending advocates with token
      const pendingResponse = await fetch(API_BASE_URL + '/auth/advocates/pending/', {
        headers: {
          'Authorization': `Bearer ${loginData.access}`,
          'Content-Type': 'application/json',
        }
      });
      
      console.log('Pending advocates with auth status:', pendingResponse.status);
      const pendingText = await pendingResponse.text();
      console.log('Pending advocates with auth response:', pendingText.substring(0, 200));
      
    } else {
      const loginText = await loginResponse.text();
      console.log('Login failed:', loginText);
    }
  } catch (error) {
    console.error('Login test error:', error.message);
  }
}

testEndpoint();
