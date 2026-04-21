-- Rename existing locations and add new ones
-- This migration updates existing data and extends the CHECK constraint

-- Step 1: Update existing location names in the data
UPDATE bookings SET location = 'Padelbox - Weiden' WHERE location = 'Padelbox Weiden';
UPDATE bookings SET location = 'Padelbox - Lövenich' WHERE location = 'Padelbox Lövenich';
UPDATE bookings SET location = 'Universität zu Köln - Lindenthal' WHERE location = 'Uni Köln';

-- Step 2: Drop old constraint and add new one with all locations
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS valid_location;

ALTER TABLE bookings ADD CONSTRAINT valid_location CHECK (
  location IN (
    'Padelbox - Weiden',
    'Padelbox - Lövenich',
    'Universität zu Köln - Lindenthal',
    'Padelbox - Widdersdorf',
    'The Cube - Mülheim',
    'Mitte Padel - Ehrenfeld'
  )
);
