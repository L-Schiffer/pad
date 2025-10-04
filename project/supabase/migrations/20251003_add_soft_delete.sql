-- Add soft delete column to bookings table
ALTER TABLE bookings ADD COLUMN deleted_at timestamptz DEFAULT NULL;

-- Create index for efficient querying of non-deleted bookings
CREATE INDEX IF NOT EXISTS idx_bookings_deleted_at ON bookings(deleted_at) WHERE deleted_at IS NULL;
