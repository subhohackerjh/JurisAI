// Test admin dashboard data fetching
const API_BASE_URL = 'http://localhost:8000/api';

async function testAdminDashboard() {
  try {
    console.log('=== Testing Admin Dashboard Data Fetching ===');
    
    // Login as admin
    console.log('1. Admin login...');
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
      console.log('Admin login failed:', await loginResponse.text());
      return;
    }
    
    const loginData = await loginResponse.json();
    console.log('Admin login successful');
    
    const headers = {
      'Authorization': `Bearer ${loginData.access}`,
      'Content-Type': 'application/json',
    };
    
    // Test advocates endpoint
    console.log('\n2. Testing advocates endpoint...');
    const advocatesResponse = await fetch(`${API_BASE_URL}/auth/advocates/`, {
      headers
    });
    
    if (advocatesResponse.ok) {
      const advocatesData = await advocatesResponse.json();
      console.log('Advocates response structure:', Object.keys(advocatesData));
      console.log('Advocates data type:', typeof advocatesData);
      console.log('Is array?', Array.isArray(advocatesData));
      
      if (advocatesData.results) {
        console.log('Results array length:', advocatesData.results.length);
        console.log('First advocate:', advocatesData.results[0]);
      } else if (Array.isArray(advocatesData)) {
        console.log('Direct array length:', advocatesData.length);
        console.log('First advocate:', advocatesData[0]);
      }
    } else {
      console.log('Advocates endpoint failed:', await advocatesResponse.text());
    }
    
    // Test pending advocates endpoint
    console.log('\n3. Testing pending advocates endpoint...');
    const pendingAdvocatesResponse = await fetch(`${API_BASE_URL}/auth/advocates/pending/`, {
      headers
    });
    
    if (pendingAdvocatesResponse.ok) {
      const pendingData = await pendingAdvocatesResponse.json();
      console.log('Pending advocates response structure:', Object.keys(pendingData));
      console.log('Pending advocates data type:', typeof pendingData);
      console.log('Is array?', Array.isArray(pendingData));
      
      if (pendingData.results) {
        console.log('Results array length:', pendingData.results.length);
      } else if (Array.isArray(pendingData)) {
        console.log('Direct array length:', pendingData.length);
      }
    } else {
      console.log('Pending advocates endpoint failed:', await pendingAdvocatesResponse.text());
    }
    
    // Test cases endpoint
    console.log('\n4. Testing cases endpoint...');
    const casesResponse = await fetch(`${API_BASE_URL}/cases/`, {
      headers
    });
    
    if (casesResponse.ok) {
      const casesData = await casesResponse.json();
      console.log('Cases response structure:', Object.keys(casesData));
      console.log('Cases data type:', typeof casesData);
      console.log('Is array?', Array.isArray(casesData));
      
      if (casesData.results) {
        console.log('Results array length:', casesData.results.length);
        console.log('First case:', casesData.results[0]);
      } else if (Array.isArray(casesData)) {
        console.log('Direct array length:', casesData.length);
        console.log('First case:', casesData[0]);
      }
    } else {
      console.log('Cases endpoint failed:', await casesResponse.text());
    }
    
    // Test feedback endpoint
    console.log('\n5. Testing feedback endpoint...');
    const feedbackResponse = await fetch(`${API_BASE_URL}/feedback/`, {
      headers
    });
    
    if (feedbackResponse.ok) {
      const feedbackData = await feedbackResponse.json();
      console.log('Feedback response structure:', Object.keys(feedbackData));
      console.log('Feedback data type:', typeof feedbackData);
      console.log('Is array?', Array.isArray(feedbackData));
      
      if (feedbackData.results) {
        console.log('Results array length:', feedbackData.results.length);
        console.log('First feedback:', feedbackData.results[0]);
      } else if (Array.isArray(feedbackData)) {
        console.log('Direct array length:', feedbackData.length);
        console.log('First feedback:', feedbackData[0]);
      }
    } else {
      console.log('Feedback endpoint failed:', await feedbackResponse.text());
    }
    
    console.log('\n=== Admin Dashboard Test Complete ===');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAdminDashboard();
