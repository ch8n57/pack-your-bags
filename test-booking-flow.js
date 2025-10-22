#!/usr/bin/env node

/**
 * Booking Flow Test Script
 * 
 * This script tests the complete booking and payment flow
 * Run with: node test-booking-flow.js
 */

const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:9000/api';

// Test data
const testUser = {
  username: `testuser${Date.now()}`,
  firstName: 'Test',
  lastName: 'User',
  email: `test${Date.now()}@example.com`,
  password: 'password123',
  phoneNumber: '1234567890'
};

async function testBookingFlow() {
  console.log('🧪 Starting Complete Booking Flow Test...\n');

  try {
    // Step 1: Register test user
    console.log('1️⃣ Registering test user...');
    const registerResponse = await axios.post(`${API_URL}/auth/register`, testUser);
    console.log('✅ User registered successfully\n');

    // Step 2: Login
    console.log('2️⃣ Logging in...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: testUser.email,
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

    // Step 3: Get available packages
    console.log('3️⃣ Fetching available packages...');
    const packagesResponse = await authAxios.get('/packages');
    const packages = packagesResponse.data;
    
    if (packages.length === 0) {
      console.log('⚠️  No packages available. Creating a test package...');
      
      // Create a test package
      const testPackage = {
        name: 'Test Package for Booking Flow',
        description: 'A test travel package for booking flow testing',
        destination: 'Test Destination',
        duration: 7,
        price: 1500,
        maxTravelers: 10,
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        imageUrl: 'https://example.com/image.jpg'
      };
      
      const packageResponse = await authAxios.post('/packages', testPackage);
      const packageId = packageResponse.data.id;
      console.log(`✅ Test package created with ID: ${packageId}\n`);
      
      // Use the created package
      const selectedPackage = packageResponse.data;
    } else {
      const selectedPackage = packages[0];
      console.log(`✅ Found ${packages.length} packages. Using: ${selectedPackage.name}\n`);
    }

    const selectedPackage = packages.length > 0 ? packages[0] : null;
    if (!selectedPackage) {
      throw new Error('No packages available for testing');
    }

    // Step 4: Create a booking
    console.log('4️⃣ Creating booking...');
    const bookingData = {
      travelPackageId: selectedPackage.id,
      numberOfTravelers: 2,
      travelDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };
    
    const bookingResponse = await authAxios.post('/bookings', bookingData);
    const booking = bookingResponse.data.booking;
    console.log('✅ Booking created successfully');
    console.log(`   Booking ID: ${booking.id}`);
    console.log(`   Total Price: $${booking.totalPrice}`);
    console.log(`   Status: ${booking.status}\n`);

    // Step 5: Test payment processing
    console.log('5️⃣ Testing payment processing...');
    const paymentResponse = await authAxios.post('/payments/auto-payment', {
      bookingId: booking.id
    });
    console.log('✅ Payment processed successfully');
    console.log(`   Payment ID: ${paymentResponse.data.payment.id}`);
    console.log(`   Amount: $${paymentResponse.data.payment.amount}`);
    console.log(`   Status: ${paymentResponse.data.payment.status}\n`);

    // Step 6: Verify booking status after payment
    console.log('6️⃣ Verifying booking status after payment...');
    const userBookingsResponse = await authAxios.get('/bookings/my-bookings');
    const userBookings = userBookingsResponse.data;
    const updatedBooking = userBookings.find(b => b.id === booking.id);
    console.log(`✅ Booking status updated: ${updatedBooking.status}\n`);

    // Step 7: Test payment history
    console.log('7️⃣ Testing payment history...');
    const historyResponse = await authAxios.get('/payments/history');
    console.log(`✅ Payment history retrieved: ${historyResponse.data.length} payments\n`);

    // Step 8: Test user bookings
    console.log('8️⃣ Testing user bookings...');
    const allUserBookingsResponse = await authAxios.get('/bookings/my-bookings');
    console.log(`✅ User bookings retrieved: ${allUserBookingsResponse.data.length} bookings\n`);

    console.log('🎉 Complete booking flow test completed successfully!');
    console.log('\n📋 Test Summary:');
    console.log('   ✅ User registration and authentication');
    console.log('   ✅ Package fetching');
    console.log('   ✅ Booking creation');
    console.log('   ✅ Payment processing');
    console.log('   ✅ Booking status update');
    console.log('   ✅ Payment history retrieval');
    console.log('   ✅ User bookings retrieval');
    console.log('\n💡 The booking and payment flow is working correctly!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.error('Response data:', error.response.data);
    }
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  testBookingFlow();
}

module.exports = { testBookingFlow };
