// Test dashboard authentication flow
const API_BASE_URL = 'http://localhost:8000/api';

// Simulate the exact apiCall function from lib/api.ts
async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Get token from localStorage (simulating browser environment)
  const token = localStorage.getItem('accessToken');
  const headers = {
    ...(options.headers),
  };
  
  // Only set Content-Type for non-FormData requests
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  // Handle non-JSON responses (like HTML error pages)
  const contentType = response.headers.get('content-type');
  let data;
  
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }
  
  if (!response.ok) {
    if (typeof data === 'object' && data.detail) {
      throw new Error(data.detail);
    } else {
      throw new Error(data || 'Request failed');
    }
  }
  
  return { data, error: null };
}

// Simulate the API functions used in AdminDashboard
const advocatesApi = {
  listAdvocates: () => apiCall('/auth/advocates/'),
  listPendingAdvocates: () => apiCall('/auth/advocates/pending/'),
};

const casesApi = {
  listCases: () => apiCall('/cases/'),
};

const feedbackApi = {
  listFeedback: () => apiCall('/feedback/'),
};

async function testDashboardAuth() {
  try {
    console.log('=== Testing Dashboard Authentication Flow ===');
    
    // Step 1: Login (simulating browser login)
    console.log('1. Logging in...');
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
    console.log('Login successful, got tokens');
    
    // Step 2: Store tokens in localStorage (simulating browser)
    localStorage.setItem('accessToken', loginData.access);
    localStorage.setItem('refreshToken', loginData.refresh);
    
    // Step 3: Load dashboard data exactly like AdminDashboard does
    console.log('2. Loading dashboard data...');
    
    const loadDashboardData = async () => {
      try {
        // Fetch all data in parallel
        const [advocatesRes, pendingAdvocatesRes, casesRes, feedbackRes] = await Promise.all([
          advocatesApi.listAdvocates(),
          advocatesApi.listPendingAdvocates(),
          casesApi.listCases(),
          feedbackApi.listFeedback(),
        ]);

        console.log('API Responses:');
        console.log('Advocates:', advocatesRes.error ? 'ERROR' : 'SUCCESS');
        console.log('Pending Advocates:', pendingAdvocatesRes.error ? 'ERROR' : 'SUCCESS');
        console.log('Cases:', casesRes.error ? 'ERROR' : 'SUCCESS');
        console.log('Feedback:', feedbackRes.error ? 'ERROR' : 'SUCCESS');

        // Process data exactly like AdminDashboard
        let allAdvocates = [];
        
        if (advocatesRes.data && !advocatesRes.error) {
          let approvedAdvocates = [];
          if (Array.isArray(advocatesRes.data)) {
            approvedAdvocates = advocatesRes.data;
          } else if (advocatesRes.data && typeof advocatesRes.data === 'object' && 'results' in advocatesRes.data) {
            approvedAdvocates = (advocatesRes.data).results || [];
          }
          allAdvocates = [...allAdvocates, ...approvedAdvocates];
          console.log('Approved advocates processed:', approvedAdvocates.length);
        }
        
        if (pendingAdvocatesRes.data && !pendingAdvocatesRes.error) {
          let pendingAdvocates = [];
          if (Array.isArray(pendingAdvocatesRes.data)) {
            pendingAdvocates = pendingAdvocatesRes.data;
          } else if (pendingAdvocatesRes.data && typeof pendingAdvocatesRes.data === 'object' && 'results' in pendingAdvocatesRes.data) {
            pendingAdvocates = (pendingAdvocatesRes.data).results || [];
          }
          allAdvocates = [...allAdvocates, ...pendingAdvocates];
          console.log('Pending advocates processed:', pendingAdvocates.length);
        }
        
        let cases = [];
        if (casesRes.data && !casesRes.error) {
          let casesData = [];
          if (Array.isArray(casesRes.data)) {
            casesData = casesRes.data;
          } else if (casesRes.data && typeof casesRes.data === 'object' && 'results' in casesRes.data) {
            casesData = (casesRes.data).results || [];
          }
          cases = casesData;
          console.log('Cases processed:', cases.length);
        }

        let feedback = [];
        if (feedbackRes.data && !feedbackRes.error) {
          let feedbackData = [];
          if (Array.isArray(feedbackRes.data)) {
            feedbackData = feedbackRes.data;
          } else if (feedbackRes.data && typeof feedbackRes.data === 'object' && 'results' in feedbackRes.data) {
            feedbackData = (feedbackRes.data).results || [];
          }
          feedback = feedbackData;
          console.log('Feedback processed:', feedback.length);
        }

        // Calculate stats from actual data
        const newFeedbackCount = feedback.filter(f => f.status === 'new').length;
        const pendingAdvocatesCount = allAdvocates.filter(a => a.approval_status === 'pending').length;
        const approvedAdvocatesCount = allAdvocates.filter(a => a.approval_status === 'approved').length;
        
        console.log('\n=== Final Dashboard Stats ===');
        console.log('Total Advocates:', allAdvocates.length);
        console.log('Total Cases:', cases.length);
        console.log('Pending Approvals:', pendingAdvocatesCount);
        console.log('New Feedback:', newFeedbackCount);
        console.log('Approved Advocates:', approvedAdvocatesCount);
        
        return {
          advocates: allAdvocates,
          cases,
          feedback,
          stats: [
            { label: 'Total Advocates', value: allAdvocates.length },
            { label: 'Total Cases', value: cases.length },
            { label: 'Pending Approvals', value: pendingAdvocatesCount },
            { label: 'New Feedback', value: newFeedbackCount },
          ]
        };
        
      } catch (err) {
        console.error('Dashboard data loading error:', err);
        throw err;
      }
    };

    const dashboardData = await loadDashboardData();
    console.log('Dashboard data loaded successfully:', dashboardData.stats);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testDashboardAuth();
