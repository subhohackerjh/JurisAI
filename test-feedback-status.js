// Test feedback status filtering
const API_BASE_URL = 'http://localhost:8000/api';

async function testFeedbackStatus() {
  try {
    console.log('=== Testing Feedback Status Values ===');
    
    // Login as admin
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
    const headers = {
      'Authorization': `Bearer ${loginData.access}`,
      'Content-Type': 'application/json',
    };
    
    // Get feedback data
    const feedbackResponse = await fetch(`${API_BASE_URL}/feedback/`, {
      headers
    });
    
    if (feedbackResponse.ok) {
      const feedbackData = await feedbackResponse.json();
      console.log('Total feedback count:', feedbackData.count || feedbackData.length);
      
      const feedbackList = feedbackData.results || feedbackData;
      feedbackList.forEach((feedback, index) => {
        console.log(`Feedback ${index + 1}:`);
        console.log(`  Subject: ${feedback.subject}`);
        console.log(`  Status: ${feedback.status}`);
        console.log(`  Status Display: ${feedback.status_display}`);
        console.log(`  Priority: ${feedback.priority}`);
        console.log(`  User: ${feedback.user_name}`);
        console.log('---');
      });
      
      // Count by status
      const statusCounts = {};
      feedbackList.forEach(f => {
        statusCounts[f.status] = (statusCounts[f.status] || 0) + 1;
      });
      
      console.log('Status counts:');
      Object.entries(statusCounts).forEach(([status, count]) => {
        console.log(`  ${status}: ${count}`);
      });
      
    } else {
      console.log('Feedback endpoint failed:', await feedbackResponse.text());
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testFeedbackStatus();
