# Pack Your Bags - Travel Booking System

A full-stack travel booking application with payment integration.

## Features

- User authentication and authorization
- Travel package browsing and search
- Booking management
- Multiple payment methods (Stripe, Auto Payment, Bank Transfer, Digital Wallet)
- Admin dashboard
- Review system
- Itinerary management

## Tech Stack

### Backend
- Node.js with TypeScript
- Express.js
- TypeORM with PostgreSQL
- Stripe for payments
- JWT for authentication

### Frontend
- React with TypeScript
- Material-UI (MUI)
- Stripe Elements
- Axios for API calls
- React Router

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL database
- Stripe account (optional for development)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp env.example .env
```

4. Update the `.env` file with your configuration:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password
DB_NAME=pack_your_bags

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=9000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# Stripe Configuration (Optional for development)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

5. Set up your PostgreSQL database and run migrations:
```bash
npm run build
npm start
```

The server will automatically create tables and seed sample data.

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp env.example .env
```

4. Update the `.env` file:
```env
# API Configuration
VITE_API_URL=http://localhost:9000/api

# Stripe Configuration (Optional for development)
VITE_STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key_here

# App Configuration
VITE_APP_NAME=Pack Your Bags
VITE_APP_VERSION=1.0.0
```

5. Start the development server:
```bash
npm run dev
```

## Payment System

The application supports multiple payment methods:

### 1. Auto Payment (Demo Mode)
- Works without Stripe configuration
- Automatically processes payments for development/testing
- Updates booking status to confirmed

### 2. Stripe Integration
- Requires valid Stripe keys in environment variables
- Supports credit/debit card payments
- Includes proper error handling and validation

### 3. Bank Transfer
- Mock bank transfer details
- Shows account information for manual transfers
- Updates booking status after processing

### 4. Digital Wallet
- Placeholder for future integration
- Supports PayPal, Apple Pay, Google Pay (coming soon)

## Development Notes

### Payment Flow
1. User selects a travel package
2. Creates a booking
3. Chooses payment method
4. Payment is processed based on selected method
5. Booking status is updated to confirmed
6. User receives confirmation

### Error Handling
- Comprehensive error handling in both frontend and backend
- User-friendly error messages
- Graceful fallbacks when services are unavailable
- Proper logging for debugging

### Security
- JWT-based authentication
- Input validation and sanitization
- CORS configuration
- Environment variable protection

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Packages
- `GET /api/packages` - Get all packages
- `GET /api/packages/:id` - Get package by ID
- `GET /api/packages/search` - Search packages

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/my-bookings` - Get user bookings
- `PATCH /api/bookings/:id/status` - Update booking status

### Payments
- `POST /api/payments/create-payment-intent` - Create Stripe payment intent
- `POST /api/payments/confirm-payment` - Confirm payment
- `POST /api/payments/auto-payment` - Process auto payment
- `GET /api/payments/history` - Get payment history

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure PostgreSQL is running
   - Check database credentials in `.env`
   - Verify database exists

2. **Payment Errors**
   - Check Stripe keys are valid (if using Stripe)
   - Use auto payment for development
   - Check network connectivity

3. **CORS Issues**
   - Ensure frontend URL matches CORS_ORIGIN in backend `.env`
   - Check if both servers are running on correct ports

4. **Authentication Issues**
   - Clear localStorage if token is corrupted
   - Check JWT_SECRET is set in backend `.env`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
