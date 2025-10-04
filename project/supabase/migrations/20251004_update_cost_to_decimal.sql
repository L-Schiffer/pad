-- Change cost column from integer to decimal to support 50 cent increments

-- Step 1: Drop old constraint
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS valid_cost;

-- Step 2: Update any existing values above 20 to 20 (to fit new range)
UPDATE bookings SET cost = 20 WHERE cost > 20;

-- Step 3: Change column type to decimal
ALTER TABLE bookings ALTER COLUMN cost TYPE DECIMAL(5,2);
ALTER TABLE bookings ALTER COLUMN cost SET DEFAULT 10.00;

-- Step 4: Add new constraint to ensure cost is between 1.00 and 20.00
ALTER TABLE bookings ADD CONSTRAINT valid_cost CHECK (cost >= 1.00 AND cost <= 20.00);
