-- Create booking_history table to track all changes
CREATE TABLE IF NOT EXISTS booking_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  action text NOT NULL, -- 'created', 'slot_filled', 'slot_removed', 'updated', 'deleted'
  changed_by text,
  slot_number integer, -- which slot was changed (1-4), null if not slot-related
  slot_value text, -- name that was added/removed from slot
  field_name text, -- which field was changed (for general updates)
  old_value text, -- previous value
  new_value text, -- new value
  created_at timestamptz DEFAULT now()
);

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_booking_history_booking_id ON booking_history(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_history_created_at ON booking_history(created_at DESC);

-- Enable RLS
ALTER TABLE booking_history ENABLE ROW LEVEL SECURITY;

-- Anyone can view history
CREATE POLICY "Anyone can view booking history"
  ON booking_history FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only allow inserts (no updates/deletes - history is immutable)
CREATE POLICY "Anyone can insert booking history"
  ON booking_history FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Function to log booking creation
CREATE OR REPLACE FUNCTION log_booking_creation()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO booking_history (booking_id, action, changed_by, field_name, new_value)
  VALUES (
    NEW.id,
    'created',
    NEW.created_by,
    'booking',
    json_build_object(
      'location', NEW.location,
      'start_time', NEW.start_time,
      'end_time', NEW.end_time,
      'cost', NEW.cost
    )::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to log slot changes
CREATE OR REPLACE FUNCTION log_booking_changes()
RETURNS TRIGGER AS $$
DECLARE
  slot_num integer;
  old_slot text;
  new_slot text;
BEGIN
  -- Check each slot for changes
  FOR slot_num IN 1..4 LOOP
    old_slot := CASE slot_num
      WHEN 1 THEN OLD.slot_1
      WHEN 2 THEN OLD.slot_2
      WHEN 3 THEN OLD.slot_3
      WHEN 4 THEN OLD.slot_4
    END;

    new_slot := CASE slot_num
      WHEN 1 THEN NEW.slot_1
      WHEN 2 THEN NEW.slot_2
      WHEN 3 THEN NEW.slot_3
      WHEN 4 THEN NEW.slot_4
    END;

    -- Log if slot changed
    IF old_slot IS DISTINCT FROM new_slot THEN
      IF old_slot IS NULL AND new_slot IS NOT NULL THEN
        -- Slot filled
        INSERT INTO booking_history (booking_id, action, changed_by, slot_number, slot_value)
        VALUES (NEW.id, 'slot_filled', new_slot, slot_num, new_slot);
      ELSIF old_slot IS NOT NULL AND new_slot IS NULL THEN
        -- Slot removed
        INSERT INTO booking_history (booking_id, action, changed_by, slot_number, slot_value)
        VALUES (NEW.id, 'slot_removed', old_slot, slot_num, old_slot);
      END IF;
    END IF;
  END LOOP;

  -- Log other field changes
  IF OLD.location != NEW.location THEN
    INSERT INTO booking_history (booking_id, action, field_name, old_value, new_value)
    VALUES (NEW.id, 'updated', 'location', OLD.location, NEW.location);
  END IF;

  IF OLD.start_time != NEW.start_time THEN
    INSERT INTO booking_history (booking_id, action, field_name, old_value, new_value)
    VALUES (NEW.id, 'updated', 'start_time', OLD.start_time::text, NEW.start_time::text);
  END IF;

  IF OLD.end_time != NEW.end_time THEN
    INSERT INTO booking_history (booking_id, action, field_name, old_value, new_value)
    VALUES (NEW.id, 'updated', 'end_time', OLD.end_time::text, NEW.end_time::text);
  END IF;

  IF OLD.cost != NEW.cost THEN
    INSERT INTO booking_history (booking_id, action, field_name, old_value, new_value)
    VALUES (NEW.id, 'updated', 'cost', OLD.cost::text, NEW.cost::text);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER booking_created_trigger
  AFTER INSERT ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION log_booking_creation();

CREATE TRIGGER booking_updated_trigger
  AFTER UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION log_booking_changes();
