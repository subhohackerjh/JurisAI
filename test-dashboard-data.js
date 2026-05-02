// Test dashboard data endpoints
const API_BASE_URL = 'http://localhost:8000/api';

async function testDashboardData() {
  try {
    // First login to get token
    console.log('Testing login...');
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
      console.log('Login failed:', await loginResponse.text());
      return;
    }
    
    const loginData = await loginResponse.json();
    console.log('Login successful');
    
    const headers = {
      'Authorization': `Bearer ${loginData.access}`,
      'Content-Type': 'application/json',
    };
    
    // Test advocates endpoint
    console.log('\nTesting advocates endpoint...');
    const advocatesResponse = await fetch(`${API_BASE_URL}/auth/advocates/`, {
      headers
    });
    
    if (advocatesResponse.ok) {
      const advocatesData = await advocatesResponse.json();
      console.log('Advocates data:', advocatesData);
      console.log('Number of advocates:', Array.isArray(advocatesData) ? advocatesData.length : 'Not an array');
    } else {
      console.log('Advocates endpoint failed:', await advocatesResponse.text());
    }
    
    // Test cases endpoint
    console.log('\nTesting cases endpoint...');
    const casesResponse = await fetch(`${API_BASE_URL}/cases/`, {
      headers
    });
    
    if (casesResponse.ok) {
      const casesData = await casesResponse.json();
      console.log('Cases data:', casesData);
      console.log('Number of cases:', Array.isArray(casesData) ? casesData.length : 'Not an array');
    } else {
      console.log('Cases endpoint failed:', await casesResponse.text());
    }
    
    // Test feedback endpoint
    console.log('\nTesting feedback endpoint...');
    const feedbackResponse = await fetch(`${API_BASE_URL}/feedback/`, {
      headers
    });
    
    if (feedbackResponse.ok) {
      const feedbackData = await feedbackResponse.json();
      console.log('Feedback data:', feedbackData);
      console.log('Number of feedback entries:', Array.isArray(feedbackData) ? feedbackData.length : 'Not an array');
    } else {
      console.log('Feedback endpoint failed:', await feedbackResponse.text());
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testDashboardData();
