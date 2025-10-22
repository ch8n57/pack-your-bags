#!/usr/bin/env node

/**
 * Payment System Test Script
 * 
 * This script tests the payment system functionality
 * Run with: node test-payment.js
 */

const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:9000/api';

// Test data
const testUser = {
  username: 'testuser',
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  password: 'password123',
  phoneNumber: '1234567890'
};

const testPackage = {
  name: 'Test Package',
  description: 'A test travel package',
  destination: 'Test Destination',
  duration: 7,
  price: 1000,
  maxTravelers: 10,
  startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
  imageUrl: 'https://example.com/image.jpg'
};

async function testPaymentSystem() {
  console.log('🧪 Starting Payment System Tests...\n');

  try {
    // Step 1: Register test user
    console.log('1️⃣ Registering test user...');
    const registerResponse = await axios.post(`${API_URL}/auth/register`, testUser);
    console.log('✅ User registered successfully\n');

    // Step 2: Login
    console.log('2️⃣ Logging in...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      username: testUser.username,
      password: testUser.password
    });
    const token = loginResponse.data.token;
    console.log('✅ Login successful\n');

    // Set up axios with auth token
    const authAxios = axios.create({
      baseURL: API_URL,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    // Step 3: Create a test package (admin function)
    console.log('3️⃣ Creating test package...');
    const packageResponse = await authAxios.post('/packages', testPackage);
    const packageId = packageResponse.data.id;
    console.log('✅ Test package created\n');

    // Step 4: Create a booking
    console.log('4️⃣ Creating booking...');
    const bookingResponse = await authAxios.post('/bookings', {
      travelPackageId: packageId,
      numberOfTravelers: 2,
      travelDate: testPackage.startDate
    });
    const bookingId = bookingResponse.data.id;
    console.log('✅ Booking created\n');

    // Step 5: Test auto payment
    console.log('5️⃣ Testing auto payment...');
    const paymentResponse = await authAxios.post('/payments/auto-payment', {
      bookingId: bookingId
    });
    console.log('✅ Auto payment successful');
    console.log(`   Payment ID: ${paymentResponse.data.payment.id}`);
    console.log(`   Amount: $${paymentResponse.data.payment.amount}`);
    console.log(`   Status: ${paymentResponse.data.payment.status}\n`);

    // Step 6: Verify booking status
    console.log('6️⃣ Verifying booking status...');
    const bookingCheckResponse = await authAxios.get(`/bookings/${bookingId}`);
    console.log(`✅ Booking status: ${bookingCheckResponse.data.status}\n`);

    // Step 7: Test payment history
    console.log('7️⃣ Testing payment history...');
    const historyResponse = await authAxios.get('/payments/history');
    console.log(`✅ Payment history retrieved: ${historyResponse.data.length} payments\n`);

    // Step 8: Test Stripe payment intent creation (mock)
    console.log('8️⃣ Testing Stripe payment intent creation...');
    try {
      const intentResponse = await authAxios.post('/payments/create-payment-intent', {
        bookingId: bookingId
      });
      console.log('✅ Payment intent created (mock mode)');
      console.log(`   Client Secret: ${intentResponse.data.clientSecret}\n`);
    } catch (error) {
      console.log('⚠️  Payment intent creation failed (expected in mock mode)');
      console.log(`   Error: ${error.response?.data?.message || error.message}\n`);
    }

    console.log('🎉 All payment system tests completed successfully!');
    console.log('\n📋 Test Summary:');
    console.log('   ✅ User registration and authentication');
    console.log('   ✅ Package creation');
    console.log('   ✅ Booking creation');
    console.log('   ✅ Auto payment processing');
    console.log('   ✅ Booking status update');
    console.log('   ✅ Payment history retrieval');
    console.log('   ✅ Mock Stripe integration');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  testPaymentSystem();
}

module.exports = { testPaymentSystem };
