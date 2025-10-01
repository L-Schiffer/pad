import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Booking = {
  id: string;
  location: string;
  start_time: string;
  end_time: string;
  slot_1: string | null;
  slot_2: string | null;
  slot_3: string | null;
  slot_4: string | null;
  created_by: string;
  created_at: string;
};
