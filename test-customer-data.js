// Test customer dashboard data endpoints
const API_BASE_URL = 'http://localhost:8000/api';

async function testCustomerData() {
  try {
    // First login as a customer (create one if needed)
    console.log('Testing customer login...');
    
    // Try logging in as customer, if fails we'll create one
    let loginResponse = await fetch(`${API_BASE_URL}/auth/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'customer@example.com',
        password: 'test123'
      })
    });
    
    if (!loginResponse.ok) {
      console.log('Customer login failed, creating customer account...');
      // Create customer account first
      const registerResponse = await fetch(`${API_BASE_URL}/auth/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'customer@example.com',
          password: 'test123',
          name: 'Test Customer',
          role: 'customer',
          phone: '+91 9876543210'
        })
      });
      
      if (registerResponse.ok) {
        console.log('Customer account created, now logging in...');
        loginResponse = await fetch(`${API_BASE_URL}/auth/login/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: 'customer@example.com',
            password: 'test123'
          })
        });
      }
    }
    
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
      console.log('Number of advocates:', Array.isArray(advocatesData) ? advocatesData.length : (advocatesData.results?.length || 0));
      
      if (advocatesData.results) {
        console.log('Approved advocates:');
        advocatesData.results.forEach(a => {
          console.log(`- ${a.name} (${a.email}) - ${a.approval_status}`);
        });
      }
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
      console.log('Number of cases:', Array.isArray(casesData) ? casesData.length : (casesData.results?.length || 0));
    } else {
      console.log('Cases endpoint failed:', await casesResponse.text());
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testCustomerData();
