// Simple test script to verify API endpoints are working
const API_BASE_URL = 'http://localhost:8000/api';

async function testLogin() {
  try {
    console.log('Testing login endpoint...');
    
    const response = await fetch(`${API_BASE_URL}/auth/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123'
      })
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers.get('content-type'));
    
    const text = await response.text();
    console.log('Response text:', text.substring(0, 200));
    
    if (response.ok) {
      const data = JSON.parse(text);
      console.log('Login successful!');
      console.log('Access token:', data.access ? 'Present' : 'Missing');
    } else {
      console.log('Login failed');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

async function testPendingAdvocates() {
  try {
    console.log('\nTesting pending advocates endpoint...');
    
    // First get a token (you'll need to replace with actual login)
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123'
      })
    });
    
    if (!loginResponse.ok) {
      console.log('Cannot test pending advocates - login failed');
      return;
    }
    
    const loginData = await loginResponse.json();
    const token = loginData.access;
    
    const response = await fetch(`${API_BASE_URL}/auth/advocates/pending/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers.get('content-type'));
    
    const text = await response.text();
    console.log('Response text:', text.substring(0, 200));
    
    if (response.ok) {
      const data = JSON.parse(text);
      console.log('Pending advocates loaded successfully!');
      console.log('Number of pending advocates:', data.length);
    } else {
      console.log('Failed to load pending advocates');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run tests
testLogin();
testPendingAdvocates();
