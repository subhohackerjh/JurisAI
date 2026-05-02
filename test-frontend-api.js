// Test frontend API calls exactly as the dashboard would make them
const API_BASE_URL = 'http://localhost:8000/api';

// Simulate the frontend apiCall function
async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Get token from localStorage (simulating frontend)
  const token = 'test_token'; // We'll replace this with actual token
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.error('API call failed:', error);
    return { data: null, error: error.message };
  }
}

async function testFrontendAPI() {
  try {
    console.log('=== Testing Frontend API Calls ===');
    
    // Login first to get token
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
    const token = loginData.access;
    
    // Now test API calls with token
    console.log('\n1. Testing advocates API...');
    const advocatesRes = await apiCall('/auth/advocates/', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Advocates result:', advocatesRes);

    console.log('\n2. Testing pending advocates API...');
    const pendingAdvocatesRes = await apiCall('/auth/advocates/pending/', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Pending advocates result:', pendingAdvocatesRes);

    console.log('\n3. Testing cases API...');
    const casesRes = await apiCall('/cases/', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Cases result:', casesRes);

    console.log('\n4. Testing feedback API...');
    const feedbackRes = await apiCall('/feedback/', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Feedback result:', feedbackRes);

    // Simulate dashboard data processing
    if (advocatesRes.data && pendingAdvocatesRes.data && casesRes.data && feedbackRes.data) {
      let allAdvocates = [];
      
      // Process approved advocates
      let approvedAdvocates = [];
      if (Array.isArray(advocatesRes.data)) {
        approvedAdvocates = advocatesRes.data;
      } else if (advocatesRes.data && typeof advocatesRes.data === 'object' && 'results' in advocatesRes.data) {
        approvedAdvocates = advocatesRes.data.results || [];
      }
      allAdvocates = [...allAdvocates, ...approvedAdvocates];
      
      // Process pending advocates
      let pendingAdvocates = [];
      if (Array.isArray(pendingAdvocatesRes.data)) {
        pendingAdvocates = pendingAdvocatesRes.data;
      } else if (pendingAdvocatesRes.data && typeof pendingAdvocatesRes.data === 'object' && 'results' in pendingAdvocatesRes.data) {
        pendingAdvocates = pendingAdvocatesRes.data.results || [];
      }
      allAdvocates = [...allAdvocates, ...pendingAdvocates];
      
      // Process cases
      let casesData = [];
      if (Array.isArray(casesRes.data)) {
        casesData = casesRes.data;
      } else if (casesRes.data && typeof casesRes.data === 'object' && 'results' in casesRes.data) {
        casesData = casesRes.data.results || [];
      }
      
      // Process feedback
      let feedbackData = [];
      if (Array.isArray(feedbackRes.data)) {
        feedbackData = feedbackRes.data;
      } else if (feedbackRes.data && typeof feedbackRes.data === 'object' && 'results' in feedbackRes.data) {
        feedbackData = feedbackRes.data.results || [];
      }
      
      // Calculate stats
      const newFeedbackCount = feedbackData.filter(f => f.status === 'new').length;
      const pendingAdvocatesCount = allAdvocates.filter(a => a.approval_status === 'pending').length;
      const approvedAdvocatesCount = allAdvocates.filter(a => a.approval_status === 'approved').length;
      
      console.log('\n=== Dashboard Stats Calculation ===');
      console.log('Total Advocates:', allAdvocates.length);
      console.log('Total Cases:', casesData.length);
      console.log('Pending Approvals:', pendingAdvocatesCount);
      console.log('New Feedback:', newFeedbackCount);
      console.log('Approved Advocates:', approvedAdvocatesCount);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testFrontendAPI();
