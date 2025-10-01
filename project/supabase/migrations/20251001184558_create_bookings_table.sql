/*
  # Create Padel Bookings Table

  1. New Tables
    - `bookings`
      - `id` (uuid, primary key) - Unique identifier for each booking
      - `location` (text) - Court location (Padelbox Weiden, Padelbox Lövenich, or Uni Köln)
      - `start_time` (timestamptz) - Booking start time
      - `end_time` (timestamptz) - Booking end time
      - `slot_1` (text, nullable) - Name of person in slot 1
      - `slot_2` (text, nullable) - Name of person in slot 2
      - `slot_3` (text, nullable) - Name of person in slot 3
      - `slot_4` (text, nullable) - Name of person in slot 4
      - `created_by` (text) - Name of the creator
      - `created_at` (timestamptz) - Timestamp when booking was created

  2. Security
    - Enable RLS on `bookings` table
    - Add public read policy (anyone can view bookings)
    - Add public insert policy (anyone can create bookings)
    - Add public update policy (anyone can update slots)
    - Add public delete policy (anyone can delete bookings)
    
  3. Important Notes
    - This is a public app without authentication
    - All users have full access to create, read, update, and delete bookings
    - Past bookings (end_time < now()) should be filtered in the application layer
    - Real-time subscriptions will be used for live updates
*/

CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location text NOT NULL,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  slot_1 text DEFAULT NULL,
  slot_2 text DEFAULT NULL,
  slot_3 text DEFAULT NULL,
  slot_4 text DEFAULT NULL,
  created_by text NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_time_range CHECK (start_time < end_time),
  CONSTRAINT valid_location CHECK (location IN ('Padelbox Weiden', 'Padelbox Lövenich', 'Uni Köln'))
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view bookings"
  ON bookings FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can create bookings"
  ON bookings FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update bookings"
  ON bookings FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete bookings"
  ON bookings FOR DELETE
  TO anon, authenticated
  USING (true);

-- Create index for efficient querying of future bookings
CREATE INDEX IF NOT EXISTS idx_bookings_end_time ON bookings(end_time DESC);