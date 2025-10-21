-- Pack Your Bags - Initial PostgreSQL Schema (DDL)
-- This defines core entities and relationships. Aligns with current codebase naming.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(50) UNIQUE NOT NULL,
  firstName VARCHAR(50) NOT NULL,
  lastName VARCHAR(50) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  phoneNumber VARCHAR(32),
  role VARCHAR(16) NOT NULL DEFAULT 'user',
  createdAt TIMESTAMP NOT NULL DEFAULT now(),
  updatedAt TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Travel Packages
CREATE TABLE IF NOT EXISTS travel_packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(150) NOT NULL,
  destination VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  duration INTEGER NOT NULL CHECK (duration > 0),
  inclusions TEXT[] NOT NULL DEFAULT '{}',
  maxTravelers INTEGER NOT NULL DEFAULT 16 CHECK (maxTravelers > 0),
  isAvailable BOOLEAN NOT NULL DEFAULT TRUE,
  rating NUMERIC(2,1) NOT NULL DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  createdAt TIMESTAMP NOT NULL DEFAULT now(),
  updatedAt TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_packages_destination ON travel_packages(LOWER(destination));

-- Bookings
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  userId UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  travelPackageId UUID NOT NULL REFERENCES travel_packages(id) ON DELETE CASCADE,
  numberOfTravelers INTEGER NOT NULL CHECK (numberOfTravelers > 0),
  totalPrice NUMERIC(10,2) NOT NULL CHECK (totalPrice >= 0),
  status VARCHAR(16) NOT NULL DEFAULT 'pending',
  travelDate DATE NOT NULL,
  travelerDetails JSONB,
  createdAt TIMESTAMP NOT NULL DEFAULT now(),
  updatedAt TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(userId);
CREATE INDEX IF NOT EXISTS idx_bookings_package ON bookings(travelPackageId);
CREATE INDEX IF NOT EXISTS idx_bookings_travel_date ON bookings(travelDate);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bookingId UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL CHECK (amount >= 0),
  status VARCHAR(16) NOT NULL DEFAULT 'pending',
  transactionId VARCHAR(255),
  paymentMode VARCHAR(50),
  paymentDetails JSONB,
  createdAt TIMESTAMP NOT NULL DEFAULT now(),
  updatedAt TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_payments_booking ON payments(bookingId);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  userId UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  travelPackageId UUID NOT NULL REFERENCES travel_packages(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL,
  status VARCHAR(16) NOT NULL DEFAULT 'pending',
  createdAt TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_reviews_package ON reviews(travelPackageId);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(userId);

-- Itineraries
CREATE TABLE IF NOT EXISTS itineraries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  userId UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  travelPackageId UUID NOT NULL REFERENCES travel_packages(id) ON DELETE CASCADE,
  travelDate DATE NOT NULL,
  title VARCHAR(150),
  description TEXT,
  items JSONB,
  createdAt TIMESTAMP NOT NULL DEFAULT now(),
  updatedAt TIMESTAMP
);

-- Messages (in-app messaging outline)
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bookingId UUID REFERENCES bookings(id) ON DELETE CASCADE,
  senderId UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  isRead BOOLEAN NOT NULL DEFAULT FALSE,
  createdAt TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_messages_booking ON messages(bookingId);
