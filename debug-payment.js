#!/usr/bin/env node

/**
 * Payment Debug Script
 * 
 * This script helps debug payment processing issues
 * Run with: node debug-payment.js
 */

const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:9000/api';

async function debugPayment() {
  console.log('🔍 Debugging Payment Processing...\n');

  try {
    // Step 1: Test authentication
    console.log('1️⃣ Testing authentication...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@packyourbags.com',
      password: 'Admin@123'
    });
    const token = loginResponse.data.token;
    console.log('✅ Authentication successful\n');

    // Set up axios with auth token
    const authAxios = axios.create({
      baseURL: API_URL,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    // Step 2: Get packages
    console.log('2️⃣ Getting packages...');
    const packagesResponse = await authAxios.get('/packages');
    const packages = packagesResponse.data;
    console.log(`✅ Found ${packages.length} packages\n`);

    if (packages.length === 0) {
      console.log('❌ No packages available for testing');
      return;
    }

    const selectedPackage = packages[0];
    console.log(`Using package: ${selectedPackage.name} (ID: ${selectedPackage.id})`);

    // Step 3: Create a booking
    console.log('\n3️⃣ Creating booking...');
    const bookingData = {
      travelPackageId: selectedPackage.id,
      numberOfTravelers: 1,
      travelDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };
    
    console.log('Booking data:', bookingData);
    
    const bookingResponse = await authAxios.post('/bookings', bookingData);
    const booking = bookingResponse.data.booking;
    console.log('✅ Booking created successfully');
    console.log(`   Booking ID: ${booking.id}`);
    console.log(`   Total Price: $${booking.totalPrice}`);
    console.log(`   Status: ${booking.status}\n`);

    // Step 4: Test payment processing
    console.log('4️⃣ Testing payment processing...');
    console.log('Payment request data:', { bookingId: booking.id });
    
    const paymentResponse = await authAxios.post('/payments/auto-payment', {
      bookingId: booking.id
    });
    
    console.log('✅ Payment processed successfully');
    console.log('Payment response:', paymentResponse.data);

  } catch (error) {
    console.error('❌ Error occurred:');
    console.error('Status:', error.response?.status);
    console.error('Status Text:', error.response?.statusText);
    console.error('Response Data:', error.response?.data);
    console.error('Request URL:', error.config?.url);
    console.error('Request Method:', error.config?.method);
    console.error('Request Headers:', error.config?.headers);
    console.error('Full Error:', error.message);
    
    if (error.response?.data?.message) {
      console.error('\n🔍 Specific Error Message:', error.response.data.message);
    }
  }
}

// Run the debug
if (require.main === module) {
  debugPayment();
}

module.exports = { debugPayment };
