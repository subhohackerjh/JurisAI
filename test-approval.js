// Test advocate approval endpoint
const API_BASE_URL = 'http://localhost:8000/api';

async function testApproval() {
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
    
    // Get pending advocates to see the ID format
    console.log('\nGetting pending advocates...');
    const pendingResponse = await fetch(`${API_BASE_URL}/auth/advocates/pending/`, {
      headers: {
        'Authorization': `Bearer ${loginData.access}`,
        'Content-Type': 'application/json',
      }
    });
    
    if (!pendingResponse.ok) {
      console.log('Failed to get pending advocates:', await pendingResponse.text());
      return;
    }
    
    const pendingData = await pendingResponse.json();
    console.log('Pending advocates:', pendingData);
    
    if (pendingData.length > 0) {
      const advocate = pendingData[0];
      console.log('\nAdvocate ID format:', advocate.id);
      console.log('Advocate ID type:', typeof advocate.id);
      
      // Test approval with the actual ID
      console.log('\nTesting approval...');
      const approveResponse = await fetch(`${API_BASE_URL}/auth/advocates/${advocate.id}/approve/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${loginData.access}`,
          'Content-Type': 'application/json',
        }
      });
      
      console.log('Approval response status:', approveResponse.status);
      const approveText = await approveResponse.text();
      console.log('Approval response:', approveText);
      
      if (approveResponse.ok) {
        console.log('Approval successful!');
      } else {
        console.log('Approval failed');
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testApproval();
