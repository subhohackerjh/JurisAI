// Test session persistence and validation
const API_BASE_URL = 'http://localhost:8000/api';

// Simulate localStorage operations
const localStorage = {
  data: {},
  getItem: function(key) {
    return this.data[key] || null;
  },
  setItem: function(key, value) {
    this.data[key] = value;
  },
  removeItem: function(key) {
    delete this.data[key];
  },
  clear: function() {
    this.data = {};
  }
};

async function testSessionPersistence() {
  try {
    console.log('=== Testing Session Persistence ===');
    
    // Step 1: Login and store session
    console.log('1. Logging in and storing session...');
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
    const { access, refresh, user } = loginData;
    
    // Create session object like AuthContext does
    const session = {
      user,
      isAuthenticated: true,
      accessToken: access,
      refreshToken: refresh,
    };
    
    // Store in localStorage like AuthContext does
    localStorage.setItem('authSession', JSON.stringify(session));
    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);
    
    console.log('Session stored successfully');
    console.log('Session keys:', Object.keys(session));
    
    // Step 2: Simulate page reload - retrieve session
    console.log('\n2. Simulating page reload - retrieving session...');
    const savedSession = localStorage.getItem('authSession');
    
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        console.log('Session retrieved successfully');
        console.log('Session isAuthenticated:', parsed.isAuthenticated);
        console.log('Session user:', parsed.user);
        console.log('Session has accessToken:', !!parsed.accessToken);
        console.log('Session has refreshToken:', !!parsed.refreshToken);
        
        // Step 3: Validate the retrieved session
        console.log('\n3. Validating retrieved session...');
        
        // Check if session is valid
        if (!parsed.isAuthenticated) {
          console.log('ERROR: Session is not authenticated');
          return;
        }
        
        if (!parsed.user) {
          console.log('ERROR: Session has no user');
          return;
        }
        
        if (!parsed.accessToken) {
          console.log('ERROR: Session has no access token');
          return;
        }
        
        if (parsed.user.role !== 'advocate') {
          console.log('ERROR: User is not an advocate:', parsed.user.role);
          return;
        }
        
        console.log('Session validation passed');
        
        // Step 4: Test API call with retrieved token
        console.log('\n4. Testing API call with retrieved token...');
        const apiResponse = await fetch(`${API_BASE_URL}/auth/profile/`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${parsed.accessToken}`,
          },
        });
        
        console.log('API call status:', apiResponse.status);
        
        if (apiResponse.ok) {
          const apiData = await apiResponse.json();
          console.log('API call successful');
          console.log('User data matches:', apiData.email === parsed.user.email);
        } else {
          const errorText = await apiResponse.text();
          console.log('API call failed:', errorText);
          
          if (apiResponse.status === 401) {
            console.log('Token is invalid or expired - session needs refresh');
            
            // Step 5: Test token refresh
            console.log('\n5. Testing token refresh...');
            const refreshResponse = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                refresh: parsed.refreshToken,
              }),
            });
            
            console.log('Token refresh status:', refreshResponse.status);
            
            if (refreshResponse.ok) {
              const refreshData = await refreshResponse.json();
              console.log('Token refresh successful');
              
              // Update session with new tokens
              const updatedSession = {
                ...parsed,
                accessToken: refreshData.access,
                refreshToken: refreshData.refresh || parsed.refreshToken,
              };
              
              localStorage.setItem('authSession', JSON.stringify(updatedSession));
              localStorage.setItem('accessToken', refreshData.access);
              localStorage.setItem('refreshToken', refreshData.refresh || parsed.refreshToken);
              
              console.log('Session updated with new tokens');
            } else {
              console.log('Token refresh failed:', await refreshResponse.text());
              console.log('Session is truly expired - user needs to login again');
            }
          }
        }
        
      } catch (error) {
        console.error('Failed to parse saved session:', error);
      }
    } else {
      console.log('No saved session found');
    }
    
    console.log('\n=== Session Persistence Test Complete ===');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testSessionPersistence();
