// Test pending advocates endpoint specifically
const API_BASE_URL = 'http://localhost:8000/api';

async function testPendingAdvocates() {
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
    
    // Test all advocates endpoint
    console.log('\nTesting all advocates endpoint...');
    const allAdvocatesResponse = await fetch(`${API_BASE_URL}/auth/advocates/`, {
      headers
    });
    
    if (allAdvocatesResponse.ok) {
      const allAdvocatesData = await allAdvocatesResponse.json();
      console.log('All advocates:', allAdvocatesData.results.length);
      allAdvocatesData.results.forEach(a => {
        console.log(`- ${a.name} (${a.email}) - ${a.approval_status}`);
      });
    } else {
      console.log('All advocates endpoint failed:', await allAdvocatesResponse.text());
    }
    
    // Test pending advocates endpoint
    console.log('\nTesting pending advocates endpoint...');
    const pendingAdvocatesResponse = await fetch(`${API_BASE_URL}/auth/advocates/pending/`, {
      headers
    });
    
    if (pendingAdvocatesResponse.ok) {
      const pendingAdvocatesData = await pendingAdvocatesResponse.json();
      console.log('Pending advocates:', pendingAdvocatesData.length);
      pendingAdvocatesData.forEach(a => {
        console.log(`- ${a.name} (${a.email}) - ${a.approval_status}`);
      });
    } else {
      console.log('Pending advocates endpoint failed:', await pendingAdvocatesResponse.text());
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testPendingAdvocates();
