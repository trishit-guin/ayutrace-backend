const axios = require('axios');

async function testCollectionCreationWithAuth() {
  try {
    console.log('🧪 Testing Collection Creation with Blockchain Integration...\n');

    // Step 1: Login to get authentication token
    console.log('🔐 Step 1: Authenticating user...');
    
    const loginData = {
      email: "farmer@test.com",
      password: "password123"
    };

    let authToken;
    try {
      const loginResponse = await axios.post('http://localhost:3000/api/auth/login', loginData);
      authToken = loginResponse.data.token;
      console.log('✅ Authentication successful');
      console.log('👤 User:', loginResponse.data.user.firstName, loginResponse.data.user.lastName);
      console.log('🏢 Role:', loginResponse.data.user.orgType);
    } catch (loginError) {
      if (loginError.response?.status === 401) {
        console.log('❌ Login failed. Trying to register a new user...');
        
        // Try to register a new user
        const registerData = {
          email: "farmer@test.com",
          password: "password123",
          firstName: "Test",
          lastName: "Farmer",
          orgType: "FARMER",
          organizationId: "org-123-uuid", // This would need to be a valid org ID
          location: "Test Farm Location",
          latitude: 18.5204,
          longitude: 73.8567
        };

        try {
          const registerResponse = await axios.post('http://localhost:3000/api/auth/register', registerData);
          authToken = registerResponse.data.token;
          console.log('✅ User registration successful');
          console.log('👤 New user:', registerResponse.data.user.firstName, registerResponse.data.user.lastName);
        } catch (registerError) {
          console.error('❌ Registration also failed:', registerError.response?.data || registerError.message);
          console.log('\n💡 Note: You may need to create a valid organization first or use existing credentials');
          return;
        }
      } else {
        console.error('❌ Login failed:', loginError.response?.data || loginError.message);
        return;
      }
    }

    // Step 2: Test Collection Creation
    console.log('\n📦 Step 2: Creating collection with blockchain integration...');
    
    const testCollection = {
      herbSpeciesId: "species-456-uuid", 
      quantityKg: 100,
      initialQualityMetrics: JSON.stringify({
        moisture: 12.5,
        purity: 95,
        color: "green",
        aroma: "strong",
        grade: "A"
      }),
      photoUrl: "https://example.com/collection-photo.jpg",
      location: JSON.stringify({
        latitude: 18.5204,
        longitude: 73.8567
      })
    };

    console.log('📋 Test Collection Data:');
    console.log(JSON.stringify(testCollection, null, 2));

    // Make API call to create collection with auth token
    const response = await axios.post('http://localhost:3000/api/collections', testCollection, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    });

    console.log('\n✅ Collection Created Successfully!');
    console.log('📦 Response Status:', response.status);
    console.log('📦 Response Data:');
    console.log(JSON.stringify(response.data, null, 2));

    // Step 3: Verify blockchain integration logs
    console.log('\n🔗 Step 3: Check server logs for blockchain integration...');
    console.log('💡 Look for blockchain service logs in your server console');

  } catch (error) {
    console.error('\n❌ Test Failed:');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('No response received. Is the server running on port 3000?');
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Run the test
testCollectionCreationWithAuth();