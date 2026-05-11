-- Hop In — Initial Schema
-- Migration 001

-- ENUM types
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('driver', 'passenger', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE trip_status AS ENUM ('active', 'completed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'rejected', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Users
CREATE TABLE IF NOT EXISTS users (
  user_id         SERIAL PRIMARY KEY,
  full_name       VARCHAR(100) NOT NULL,
  email           VARCHAR(150) UNIQUE NOT NULL,
  phone           VARCHAR(20) NOT NULL,
  password_hash   VARCHAR(255) NOT NULL,
  role            user_role NOT NULL DEFAULT 'passenger',
  profile_picture VARCHAR(255),
  average_rating  DECIMAL(3,2) DEFAULT 0.00,
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMP DEFAULT NOW()
);

-- Trips
CREATE TABLE IF NOT EXISTS trips (
  trip_id          SERIAL PRIMARY KEY,
  driver_id        INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  departure_city   VARCHAR(100) NOT NULL,
  destination_city VARCHAR(100) NOT NULL,
  departure_date   DATE NOT NULL,
  departure_time   TIME NOT NULL,
  total_seats      INTEGER NOT NULL CHECK (total_seats > 0),
  available_seats  INTEGER NOT NULL CHECK (available_seats >= 0),
  price_per_seat   DECIMAL(10,2) NOT NULL CHECK (price_per_seat >= 0),
  status           trip_status NOT NULL DEFAULT 'active',
  created_at       TIMESTAMP DEFAULT NOW()
);

-- Pickup Points
CREATE TABLE IF NOT EXISTS pickup_points (
  pickup_id     SERIAL PRIMARY KEY,
  trip_id       INTEGER NOT NULL REFERENCES trips(trip_id) ON DELETE CASCADE,
  location_name VARCHAR(150) NOT NULL,
  pickup_time   TIME NOT NULL
);

-- Bookings
CREATE TABLE IF NOT EXISTS bookings (
  booking_id   SERIAL PRIMARY KEY,
  trip_id      INTEGER NOT NULL REFERENCES trips(trip_id) ON DELETE CASCADE,
  passenger_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  pickup_id    INTEGER NOT NULL REFERENCES pickup_points(pickup_id),
  status       booking_status NOT NULL DEFAULT 'pending',
  booked_at    TIMESTAMP DEFAULT NOW()
);

-- Ratings
CREATE TABLE IF NOT EXISTS ratings (
  rating_id   SERIAL PRIMARY KEY,
  trip_id     INTEGER NOT NULL REFERENCES trips(trip_id) ON DELETE CASCADE,
  reviewer_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  reviewee_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  stars       INTEGER NOT NULL CHECK (stars BETWEEN 1 AND 5),
  review_text TEXT,
  created_at  TIMESTAMP DEFAULT NOW(),
  UNIQUE (trip_id, reviewer_id, reviewee_id)
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  notification_id SERIAL PRIMARY KEY,
  user_id         INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  message         TEXT NOT NULL,
  is_read         BOOLEAN DEFAULT false,
  created_at      TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_trips_departure ON trips(departure_date, departure_city, destination_city);
CREATE INDEX IF NOT EXISTS idx_trips_driver ON trips(driver_id);
CREATE INDEX IF NOT EXISTS idx_trips_status ON trips(status);
CREATE INDEX IF NOT EXISTS idx_bookings_trip ON bookings(trip_id);
CREATE INDEX IF NOT EXISTS idx_bookings_passenger ON bookings(passenger_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_ratings_reviewee ON ratings(reviewee_id);
