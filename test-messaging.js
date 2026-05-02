// Test messaging functionality
const API_BASE_URL = 'http://localhost:8000/api';

async function testMessaging() {
  try {
    // Login as customer
    console.log('Testing customer login...');
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
    
    // Test starting a conversation
    console.log('\nTesting start conversation...');
    const startConversationResponse = await fetch(`${API_BASE_URL}/messaging/conversations/start/2/`, {
      method: 'POST',
      headers
    });
    
    if (startConversationResponse.ok) {
      const conversationData = await startConversationResponse.json();
      console.log('Conversation started:', conversationData);
      console.log('Conversation ID:', conversationData.id);
      
      // Test sending a message
      console.log('\nTesting send message...');
      const sendMessageResponse = await fetch(`${API_BASE_URL}/messaging/conversations/${conversationData.id}/send/`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          content: 'Hello, I need legal assistance with a family matter. Can you help me?'
        })
      });
      
      if (sendMessageResponse.ok) {
        const messageData = await sendMessageResponse.json();
        console.log('Message sent:', messageData);
      } else {
        console.log('Send message failed:', await sendMessageResponse.text());
      }
      
      // Test getting conversation
      console.log('\nTesting get conversation...');
      const getConversationResponse = await fetch(`${API_BASE_URL}/messaging/conversations/${conversationData.id}/`, {
        headers
      });
      
      if (getConversationResponse.ok) {
        const conversationDetail = await getConversationResponse.json();
        console.log('Conversation details:', conversationDetail);
        console.log('Messages count:', conversationDetail.messages.length);
      } else {
        console.log('Get conversation failed:', await getConversationResponse.text());
      }
      
    } else {
      console.log('Start conversation failed:', await startConversationResponse.text());
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testMessaging();
