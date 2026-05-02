// Test advocate session management
const API_BASE_URL = 'http://localhost:8000/api';

// Simulate the complete login flow including token storage
async function testAdvocateSession() {
  try {
    console.log('=== Testing Advocate Session Management ===');
    
    // Step 1: Login as advocate
    console.log('1. Logging in as advocate...');
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'chiraghs@gmaill.com',
        password: 'admin123'
      })
    });
    
    if (!loginResponse.ok) {
      console.log('Login failed:', await loginResponse.text());
      return;
    }
    
    const loginData = await loginResponse.json();
    console.log('Login successful');
    console.log('Tokens received:', Object.keys(loginData));
    console.log('User data:', loginData.user);
    
    const { access, refresh, user } = loginData;
    
    // Step 2: Store tokens (simulating localStorage)
    console.log('\n2. Storing tokens...');
    const session = {
      user,
      isAuthenticated: true,
      accessToken: access,
      refreshToken: refresh,
    };
    
    console.log('Session created:', session);
    
    // Step 3: Test API call with token
    console.log('\n3. Testing API call with token...');
    const apiCall = async (endpoint) => {
      const url = `${API_BASE_URL}${endpoint}`;
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access}`,
      };
      
      console.log(`Making API call to: ${endpoint}`);
      console.log('Authorization header:', headers.Authorization);
      
      const response = await fetch(url, { headers });
      
      console.log(`Response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log(`Error response: ${errorText}`);
        return { data: null, error: errorText };
      }
      
      const data = await response.json();
      console.log(`Success response type: ${typeof data}`);
      console.log(`Response keys: ${Object.keys(data)}`);
      
      return { data, error: null };
    };
    
    // Test different API endpoints
    console.log('\n4. Testing advocate profile...');
    const profileResponse = await apiCall('/auth/profile/');
    
    console.log('\n5. Testing cases endpoint...');
    const casesResponse = await apiCall('/cases/');
    
    console.log('\n6. Testing advocates endpoint...');
    const advocatesResponse = await apiCall('/auth/advocates/');
    
    // Step 4: Test token expiration simulation
    console.log('\n7. Testing token expiration handling...');
    
    // Test with invalid token
    const invalidTokenResponse = await fetch(`${API_BASE_URL}/auth/profile/`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer invalid_token_here',
      },
    });
    
    console.log('Invalid token response status:', invalidTokenResponse.status);
    console.log('Invalid token response:', await invalidTokenResponse.text());
    
    // Step 5: Test token refresh
    console.log('\n8. Testing token refresh...');
    const refreshResponse = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refresh: refresh,
      }),
    });
    
    console.log('Token refresh status:', refreshResponse.status);
    if (refreshResponse.ok) {
      const refreshData = await refreshResponse.json();
      console.log('Token refresh successful:', Object.keys(refreshData));
    } else {
      console.log('Token refresh failed:', await refreshResponse.text());
    }
    
    console.log('\n=== Session Management Test Complete ===');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAdvocateSession();
