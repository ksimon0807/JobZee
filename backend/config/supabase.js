import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, 'config.env') });

// Create Supabase client
const supabaseUrl = process.env.SUPABASE_PROJECT_URL;
// Use the service role key for backend operations to bypass RLS
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

let supabase;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase URL or key is missing. Some features may not work correctly.');
  // Create a mock client that will throw clear errors when used
  supabase = {
    storage: {
      from: () => {
        return {
          upload: async () => ({ data: null, error: { message: 'Supabase credentials not configured' } }),
          getPublicUrl: async () => ({ data: { publicUrl: '' }, error: null })
        };
      }
    },
    from: () => {
      return {
        insert: async () => ({ data: null, error: { message: 'Supabase credentials not configured' } }),
        select: async () => ({ data: [], error: null })
      };
    }
  };
} else {
  supabase = createClient(supabaseUrl, supabaseKey);
}

// Export the client instance
export default supabase;
