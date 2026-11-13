-- Esquema relacional PostgreSQL para Serrano Reservas
-- Villa Carlos Paz y Valle de Punilla, Córdoba, Argentina

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE user_role AS ENUM ('turista', 'propietario', 'administrador');
CREATE TYPE accommodation_type AS ENUM ('Cabaña', 'Hotel', 'Complejo', 'Apart', 'Posada');
CREATE TYPE accommodation_status AS ENUM ('publicado', 'revision', 'pausado');
CREATE TYPE booking_status AS ENUM ('confirmada', 'pendiente', 'cancelada', 'completada');
CREATE TYPE payment_status AS ENUM ('sena_abonada', 'pago_completo', 'pendiente');

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'turista',
  phone VARCHAR(40),
  city VARCHAR(100),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE accommodations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(140) UNIQUE NOT NULL,
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(150) NOT NULL,
  type accommodation_type NOT NULL,
  destination VARCHAR(100) NOT NULL,
  address VARCHAR(200) NOT NULL,
  zone_reference VARCHAR(150),
  latitude NUMERIC(9, 6),
  longitude NUMERIC(9, 6),
  distance_center_km NUMERIC(5, 2),
  distance_lake_km NUMERIC(5, 2),
  short_description VARCHAR(280) NOT NULL,
  description TEXT NOT NULL,
  price_per_night INTEGER NOT NULL CHECK (price_per_night > 0),
  max_guests INTEGER NOT NULL CHECK (max_guests > 0),
  bedrooms INTEGER NOT NULL DEFAULT 1,
  bathrooms INTEGER NOT NULL DEFAULT 1,
  amenities TEXT[] NOT NULL DEFAULT '{}',
  gallery_keys TEXT[] NOT NULL DEFAULT '{}',
  rating NUMERIC(3, 2) NOT NULL DEFAULT 4.80,
  review_count INTEGER NOT NULL DEFAULT 0,
  status accommodation_status NOT NULL DEFAULT 'revision',
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  check_in_time VARCHAR(10) NOT NULL DEFAULT '14:00',
  check_out_time VARCHAR(10) NOT NULL DEFAULT '10:00',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE accommodation_blocked_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  accommodation_id UUID NOT NULL REFERENCES accommodations(id) ON DELETE CASCADE,
  blocked_date DATE NOT NULL,
  reason VARCHAR(120) DEFAULT 'Bloqueo manual del propietario',
  UNIQUE (accommodation_id, blocked_date)
);

CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(20) UNIQUE NOT NULL,
  accommodation_id UUID NOT NULL REFERENCES accommodations(id) ON DELETE RESTRICT,
  tourist_id UUID REFERENCES users(id) ON DELETE SET NULL,
  guest_name VARCHAR(120) NOT NULL,
  guest_dni VARCHAR(20) NOT NULL,
  guest_email VARCHAR(160) NOT NULL,
  guest_phone VARCHAR(40) NOT NULL,
  arrival_time VARCHAR(20),
  special_requests TEXT,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  nights INTEGER NOT NULL CHECK (nights > 0),
  guests_count INTEGER NOT NULL CHECK (guests_count > 0),
  price_per_night INTEGER NOT NULL,
  total_amount INTEGER NOT NULL,
  deposit_amount INTEGER NOT NULL,
  balance_amount INTEGER NOT NULL,
  payment_method VARCHAR(60) NOT NULL,
  payment_status payment_status NOT NULL DEFAULT 'sena_abonada',
  status booking_status NOT NULL DEFAULT 'confirmada',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_date_range CHECK (check_out > check_in)
);

CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  accommodation_id UUID NOT NULL REFERENCES accommodations(id) ON DELETE CASCADE,
  author_name VARCHAR(100) NOT NULL,
  author_city VARCHAR(100) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  stay_date VARCHAR(40) NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_accommodations_destination ON accommodations(destination);
CREATE INDEX idx_accommodations_status ON accommodations(status);
CREATE INDEX idx_bookings_accommodation_dates ON bookings(accommodation_id, check_in, check_out);
CREATE INDEX idx_blocked_dates_accommodation ON accommodation_blocked_dates(accommodation_id, blocked_date);
