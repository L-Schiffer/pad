-- Add cost column to bookings table
ALTER TABLE bookings ADD COLUMN cost integer NOT NULL DEFAULT 10;

-- Add constraint to ensure cost is between 10 and 30
ALTER TABLE bookings ADD CONSTRAINT valid_cost CHECK (cost >= 10 AND cost <= 30);
