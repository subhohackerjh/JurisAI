// Test complete customer-to-advocate-to-case workflow
const API_BASE_URL = 'http://localhost:8000/api';

async function testCompleteWorkflow() {
  try {
    // Login as customer
    console.log('=== Testing Complete Workflow ===');
    console.log('1. Customer login...');
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login/`, {
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
      console.log('Login failed:', await loginResponse.text());
      return;
    }
    
    const loginData = await loginResponse.json();
    console.log('Login successful');
    
    const headers = {
      'Authorization': `Bearer ${loginData.access}`,
      'Content-Type': 'application/json',
    };
    
    // Step 1: Customer starts conversation with advocate
    console.log('\n2. Starting conversation with advocate...');
    const startConversationResponse = await fetch(`${API_BASE_URL}/messaging/conversations/start/2/`, {
      method: 'POST',
      headers
    });
    
    if (!startConversationResponse.ok) {
      console.log('Start conversation failed:', await startConversationResponse.text());
      return;
    }
    
    const conversationData = await startConversationResponse.json();
    console.log('Conversation started:', conversationData.id);
    
    // Step 2: Customer sends initial message
    console.log('\n3. Customer sends initial message...');
    const sendMessageResponse = await fetch(`${API_BASE_URL}/messaging/conversations/${conversationData.id}/send/`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        content: 'Hello, I need help with a family law case. Can you assist me?'
      })
    });
    
    if (sendMessageResponse.ok) {
      const messageData = await sendMessageResponse.json();
      console.log('Message sent:', messageData.content);
    }
    
    // Step 3: Customer requests case creation
    console.log('\n4. Customer requests case creation...');
    const requestCaseResponse = await fetch(`${API_BASE_URL}/messaging/conversations/${conversationData.id}/request-case/`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        case_details: {
          title: 'Divorce Case - John vs Jane Doe',
          case_type: 'family',
          description: 'Contested divorce with child custody issues',
          urgency: 'high',
          estimated_duration: '6-12 months'
        }
      })
    });
    
    if (requestCaseResponse.ok) {
      const caseRequestData = await requestCaseResponse.json();
      console.log('Case requested successfully');
      console.log('Conversation status:', caseRequestData.status);
    }
    
    // Step 4: Login as advocate to confirm case
    console.log('\n5. Login as advocate...');
    const advocateLoginResponse = await fetch(`${API_BASE_URL}/auth/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'chiraghs@gmaill.com',
        password: 'admin123'
      })
    });
    
    if (!advocateLoginResponse.ok) {
      console.log('Advocate login failed:', await advocateLoginResponse.text());
      return;
    }
    
    const advocateLoginData = await advocateLoginResponse.json();
    console.log('Advocate login successful');
    
    const advocateHeaders = {
      'Authorization': `Bearer ${advocateLoginData.access}`,
      'Content-Type': 'application/json',
    };
    
    // Step 5: Advocate confirms case creation
    console.log('\n6. Advocate confirms case creation...');
    const confirmCaseResponse = await fetch(`${API_BASE_URL}/messaging/conversations/${conversationData.id}/confirm-case/`, {
      method: 'POST',
      headers: advocateHeaders,
      body: JSON.stringify({
        advocate_notes: 'Client seems genuine, case has merit. Will proceed with initial consultation.'
      })
    });
    
    if (confirmCaseResponse.ok) {
      const confirmData = await confirmCaseResponse.json();
      console.log('Case confirmed and created successfully!');
      console.log('Case ID:', confirmData.case_id);
      console.log('Conversation status:', confirmData.conversation.status);
      
      // Step 6: Verify case was created
      console.log('\n7. Verifying case creation...');
      const getCaseResponse = await fetch(`${API_BASE_URL}/cases/${confirmData.case_id}/`, {
        headers: advocateHeaders
      });
      
      if (getCaseResponse.ok) {
        const caseData = await getCaseResponse.json();
        console.log('Case verified:', caseData.title);
        console.log('Customer:', caseData.customer.name);
        console.log('Advocate:', caseData.advocate.name);
        console.log('Status:', caseData.status);
      }
    }
    
    console.log('\n=== Workflow Complete ===');
    console.log('Customer -> Advocate -> Case pipeline working perfectly!');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testCompleteWorkflow();
