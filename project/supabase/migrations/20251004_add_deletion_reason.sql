-- Add deletion_reason column to booking_history table
ALTER TABLE booking_history ADD COLUMN deletion_reason TEXT;

-- Add deletion_details column for additional free-text details
ALTER TABLE booking_history ADD COLUMN deletion_details TEXT;
