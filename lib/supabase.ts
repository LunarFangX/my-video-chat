import { createClient } from '@supabase/supabase-js';

// Create a test client that doesn't make actual API calls
export const supabase = createClient(
  'https://test.supabase.co',
  'test-anon-key',
  {
    auth: {
      persistSession: false // Disable session persistence
    }
  }
);