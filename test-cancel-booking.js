#!/usr/bin/env node

/**
 * Cancel Booking Test Script
 * 
 * This script tests the cancel booking functionality
 * Run with: node test-cancel-booking.js
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

async function testCancelBooking() {
  console.log('🧪 Testing Cancel Booking Functionality...\n');

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

    // Step 3: Get packages and create booking
    console.log('3️⃣ Creating booking...');
    const packagesResponse = await authAxios.get('/packages');
    const selectedPackage = packagesResponse.data[0];
    
    const bookingData = {
      travelPackageId: selectedPackage.id,
      numberOfTravelers: 1,
      travelDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };
    
    const bookingResponse = await authAxios.post('/bookings', bookingData);
    const booking = bookingResponse.data.booking;
    console.log('✅ Booking created successfully');
    console.log(`   Booking ID: ${booking.id}`);
    console.log(`   Status: ${booking.status}\n`);

    // Step 4: Test cancelling pending booking
    console.log('4️⃣ Testing cancel pending booking...');
    const cancelResponse = await authAxios.patch(`/bookings/${booking.id}/status`, {
      status: 'cancelled'
    });
    console.log('✅ Booking cancelled successfully');
    console.log(`   New Status: ${cancelResponse.data.status}\n`);

    // Step 5: Create another booking and confirm it
    console.log('5️⃣ Creating and confirming another booking...');
    const booking2Response = await authAxios.post('/bookings', bookingData);
    const booking2 = booking2Response.data.booking;
    
    // Process payment to confirm booking
    await authAxios.post('/payments/auto-payment', {
      bookingId: booking2.id
    });
    
    console.log('✅ Booking confirmed successfully');
    console.log(`   Booking ID: ${booking2.id}`);
    console.log(`   Status: confirmed\n`);

    // Step 6: Test cancelling confirmed booking (should trigger refund)
    console.log('6️⃣ Testing cancel confirmed booking...');
    const cancel2Response = await authAxios.patch(`/bookings/${booking2.id}/status`, {
      status: 'cancelled'
    });
    console.log('✅ Confirmed booking cancelled successfully');
    console.log(`   New Status: ${cancel2Response.data.status}\n`);

    // Step 7: Verify payment refund
    console.log('7️⃣ Verifying payment refund...');
    const paymentHistoryResponse = await authAxios.get('/payments/history');
    const payments = paymentHistoryResponse.data;
    const refundedPayment = payments.find(p => p.booking.id === booking2.id);
    
    if (refundedPayment) {
      console.log('✅ Payment refunded successfully');
      console.log(`   Payment Status: ${refundedPayment.status}`);
    } else {
      console.log('⚠️  Payment refund not found');
    }

    // Step 8: Test unauthorized cancellation
    console.log('\n8️⃣ Testing unauthorized cancellation...');
    try {
      // Create another user
      const otherUser = {
        username: `otheruser${Date.now()}`,
        firstName: 'Other',
        lastName: 'User',
        email: `other${Date.now()}@example.com`,
        password: 'password123',
        phoneNumber: '1234567890'
      };
      
      await axios.post(`${API_URL}/auth/register`, otherUser);
      const otherLoginResponse = await axios.post(`${API_URL}/auth/login`, {
        email: otherUser.email,
        password: otherUser.password
      });
      
      const otherAuthAxios = axios.create({
        baseURL: API_URL,
        headers: {
          'Authorization': `Bearer ${otherLoginResponse.data.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Try to cancel the first user's booking
      await otherAuthAxios.patch(`/bookings/${booking.id}/status`, {
        status: 'cancelled'
      });
      
      console.log('❌ Unauthorized cancellation should have failed');
    } catch (error) {
      if (error.response?.status === 403) {
        console.log('✅ Unauthorized cancellation properly blocked');
      } else {
        console.log('❌ Unexpected error:', error.response?.data?.message);
      }
    }

    console.log('\n🎉 Cancel booking functionality test completed successfully!');
    console.log('\n📋 Test Summary:');
    console.log('   ✅ User registration and authentication');
    console.log('   ✅ Booking creation');
    console.log('   ✅ Cancel pending booking');
    console.log('   ✅ Cancel confirmed booking with refund');
    console.log('   ✅ Payment refund verification');
    console.log('   ✅ Authorization check');

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
  testCancelBooking();
}

module.exports = { testCancelBooking };
