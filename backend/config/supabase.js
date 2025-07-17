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

// Simple class-based implementation to avoid method chaining issues
class SupabaseWrapper {
  constructor(url, key) {
    this._client = null;
    this._url = url;
    this._key = key;
    this._initialized = false;
    
    // Initialize on constructor
    this.initialize();
  }
  
  initialize() {
    if (this._initialized) return;
    
    try {
      if (!this._url || !this._key) {
        console.warn('[SupabaseWrapper] URL or key is missing. Using mock client.');
        this._client = this._createMockClient();
      } else {
        console.log(`[SupabaseWrapper] Initializing with URL: ${this._url}`);
        this._client = createClient(this._url, this._key, {
          auth: { persistSession: false }
        });
      }
      this._initialized = true;
    } catch (err) {
      console.error(`[SupabaseWrapper] Init error: ${err.message}`);
      this._client = this._createMockClient();
    }
  }
  
  _createMockClient() {
    // Return a simple mock client that won't throw errors
    return {
      storage: {
        from: () => ({
          upload: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
          download: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
          getPublicUrl: () => ({ data: { publicUrl: '' } }),
          list: async () => ({ data: [], error: null }),
          remove: async () => ({ data: null, error: null })
        })
      },
      from: () => ({
        insert: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
        upsert: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
        select: () => ({
          eq: () => ({
            order: () => ({
              limit: async () => ({ data: [], error: null })
            }),
            limit: async () => ({ data: [], error: null }),
            single: async () => ({ data: null, error: null })
          }),
          order: () => ({
            limit: async () => ({ data: [], error: null })
          }),
          limit: async () => ({ data: [], error: null })
        }),
        delete: () => ({
          eq: async () => ({ data: null, error: null })
        })
      })
    };
  }
  
  // Forward storage methods
  storage = {
    from: (bucket) => {
      if (!this._client) this.initialize();
      try {
        return this._client.storage.from(bucket);
      } catch (err) {
        console.error(`[SupabaseWrapper] Error accessing storage: ${err.message}`);
        return this._createMockClient().storage.from(bucket);
      }
    }
  }
  
  // Forward from method
  from(table) {
    if (!this._client) this.initialize();
    try {
      return this._client.from(table);
    } catch (err) {
      console.error(`[SupabaseWrapper] Error accessing table: ${err.message}`);
      return this._createMockClient().from(table);
    }
  }
}

// Create instance
const supabase = new SupabaseWrapper(supabaseUrl, supabaseKey);

// Export the client instance
export default supabase;
