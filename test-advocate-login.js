// Test advocate login authentication
const API_BASE_URL = 'http://localhost:8000/api';

async function testAdvocateLogin() {
  try {
    console.log('=== Testing Advocate Login Issue ===');
    
    // First, let's check what advocate accounts exist
    console.log('1. Checking existing advocate accounts...');
    
    // Try to login as admin to check advocate accounts
    const adminLoginResponse = await fetch(`${API_BASE_URL}/auth/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123'
      })
    });
    
    if (!adminLoginResponse.ok) {
      console.log('Admin login failed:', await adminLoginResponse.text());
      return;
    }
    
    const adminLoginData = await adminLoginResponse.json();
    const adminHeaders = {
      'Authorization': `Bearer ${adminLoginData.access}`,
      'Content-Type': 'application/json',
    };
    
    // Get all advocates to see what accounts exist
    const advocatesResponse = await fetch(`${API_BASE_URL}/auth/advocates/`, {
      headers: adminHeaders
    });
    
    if (advocatesResponse.ok) {
      const advocatesData = await advocatesResponse.json();
      const advocates = advocatesData.results || advocatesData;
      
      console.log('Found advocate accounts:');
      advocates.forEach((advocate, index) => {
        console.log(`${index + 1}. Email: ${advocate.email}`);
        console.log(`   Name: ${advocate.name}`);
        console.log(`   Role: ${advocate.role}`);
        console.log(`   Approval Status: ${advocate.approval_status}`);
        console.log(`   Is Active: ${advocate.is_active}`);
        console.log('---');
      });
      
      // Find the specific advocate account
      const chiraghsAdvocate = advocates.find(a => a.email === 'chiraghs@gmaill.com');
      if (chiraghsAdvocate) {
        console.log('Found chiraghs@gmaill.com account:');
        console.log('ID:', chiraghsAdvocate.id);
        console.log('Name:', chiraghsAdvocate.name);
        console.log('Approval Status:', chiraghsAdvocate.approval_status);
        console.log('Is Active:', chiraghsAdvocate.is_active);
      } else {
        console.log('chiraghs@gmaill.com account not found!');
        
        // Check if there's a similar email
        const similarAdvocates = advocates.filter(a => 
          a.email.includes('chiraghs') || a.email.includes('chirag')
        );
        if (similarAdvocates.length > 0) {
          console.log('Found similar advocate accounts:');
          similarAdvocates.forEach(a => {
            console.log(`  - ${a.email} (${a.approval_status})`);
          });
        }
      }
    } else {
      console.log('Failed to get advocates:', await advocatesResponse.text());
    }
    
    // Now test the specific login that's failing
    console.log('\n2. Testing chiraghs@gmaill.com login...');
    const advocateLoginResponse = await fetch(`${API_BASE_URL}/auth/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'chiraghs@gmaill.com',
        password: 'admin123' // Try common password
      })
    });
    
    console.log('Login Response Status:', advocateLoginResponse.status);
    console.log('Login Response Text:', await advocateLoginResponse.text());
    
    // Try with different passwords
    const passwords = ['password', 'admin123', 'test123', 'chirag123'];
    
    for (const password of passwords) {
      console.log(`\n3. Trying with password: ${password}`);
      const testLoginResponse = await fetch(`${API_BASE_URL}/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'chiraghs@gmaill.com',
          password: password
        })
      });
      
      if (testLoginResponse.ok) {
        console.log('SUCCESS! Login worked with password:', password);
        const loginData = await testLoginResponse.json();
        console.log('Tokens received:', Object.keys(loginData));
        break;
      } else {
        const errorText = await testLoginResponse.text();
        console.log(`Failed with ${password}:`, errorText);
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAdvocateLogin();
