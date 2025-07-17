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

// Create wrapper function to handle initialization and reconnection
const createSupabaseClient = () => {
  try {
    if (!supabaseUrl || !supabaseKey) {
      console.warn('Supabase URL or key is missing. Some features may not work correctly.');
      return null;
    }
    
    console.log(`[Supabase] Initializing client with URL: ${supabaseUrl} (keys ${supabaseKey ? 'provided' : 'missing'})`);
    
    // Configure client with auto-refresh and higher timeouts
    const options = {
      auth: {
        persistSession: false,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
      global: {
        fetch: (url, options) => {
          const fetchOptions = {
            ...options,
            timeout: 30000, // 30 second timeout
            headers: {
              ...options?.headers,
              'Content-Type': 'application/json',
            }
          };
          return fetch(url, fetchOptions);
        }
      }
    };
    
    return createClient(supabaseUrl, supabaseKey, options);
  } catch (err) {
    console.error(`[Supabase] Error creating client: ${err.message}`);
    return null;
  }
};

// Create mock client to gracefully handle when Supabase is unavailable
const createMockClient = () => {
  console.warn('[Supabase] Creating mock client due to missing configuration');
  return {
    storage: {
      from: () => {
        return {
          upload: async () => ({ data: null, error: { message: 'Supabase credentials not configured' } }),
          download: async () => ({ data: null, error: { message: 'Supabase credentials not configured' } }),
          getPublicUrl: () => ({ data: { publicUrl: '' } }),
          list: async () => ({ data: [], error: null }),
          remove: async () => ({ data: null, error: { message: 'Supabase credentials not configured' } })
        };
      }
    },
    from: () => {
      return {
        insert: async () => ({ data: null, error: { message: 'Supabase credentials not configured' } }),
        upsert: async () => ({ data: null, error: { message: 'Supabase credentials not configured' } }),
        update: async () => ({ data: null, error: { message: 'Supabase credentials not configured' } }),
        select: async () => ({ data: [], error: null }),
        delete: async () => ({ data: null, error: { message: 'Supabase credentials not configured' } })
      };
    }
  };
};

// Initialize the client
const client = createSupabaseClient() || createMockClient();

// Export wrapped client with error handling
const supabase = {
  storage: {
    from: (bucket) => {
      const bucketClient = client.storage.from(bucket);
      return {
        upload: async (path, file, options) => {
          try {
            const result = await bucketClient.upload(path, file, options);
            return result;
          } catch (err) {
            console.error(`[Supabase] Storage upload error: ${err.message}`);
            return { data: null, error: err };
          }
        },
        download: async (path) => {
          try {
            return await bucketClient.download(path);
          } catch (err) {
            console.error(`[Supabase] Storage download error: ${err.message}`);
            return { data: null, error: err };
          }
        },
        getPublicUrl: (path) => {
          try {
            return bucketClient.getPublicUrl(path);
          } catch (err) {
            console.error(`[Supabase] GetPublicURL error: ${err.message}`);
            return { data: { publicUrl: '' } };
          }
        },
        list: async (folder, options) => {
          try {
            return await bucketClient.list(folder, options);
          } catch (err) {
            console.error(`[Supabase] Storage list error: ${err.message}`);
            return { data: [], error: err };
          }
        },
        remove: async (paths) => {
          try {
            return await bucketClient.remove(paths);
          } catch (err) {
            console.error(`[Supabase] Storage remove error: ${err.message}`);
            return { data: null, error: err };
          }
        }
      };
    }
  },
  from: (table) => {
    const tableClient = client.from(table);
    return {
      insert: async (data, options) => {
        try {
          return await tableClient.insert(data, options);
        } catch (err) {
          console.error(`[Supabase] Database insert error: ${err.message}`);
          return { data: null, error: err };
        }
      },
      upsert: async (data, options) => {
        try {
          return await tableClient.upsert(data, options);
        } catch (err) {
          console.error(`[Supabase] Database upsert error: ${err.message}`);
          return { data: null, error: err };
        }
      },
      update: async (data) => {
        try {
          return await tableClient.update(data);
        } catch (err) {
          console.error(`[Supabase] Database update error: ${err.message}`);
          return { data: null, error: err };
        }
      },
      select: async (columns) => {
        try {
          return await tableClient.select(columns);
        } catch (err) {
          console.error(`[Supabase] Database select error: ${err.message}`);
          return { data: [], error: err };
        }
      },
      delete: async () => {
        try {
          return await tableClient.delete();
        } catch (err) {
          console.error(`[Supabase] Database delete error: ${err.message}`);
          return { data: null, error: err };
        }
      },
      eq: (column, value) => {
        try {
          return tableClient.eq(column, value);
        } catch (err) {
          console.error(`[Supabase] Database eq error: ${err.message}`);
          // Return a chainable object
          return { select: async () => ({ data: [], error: err }), order: () => ({ limit: () => ({ data: [], error: err }) }) };
        }
      },
      order: (column, options) => {
        try {
          return tableClient.order(column, options);
        } catch (err) {
          console.error(`[Supabase] Database order error: ${err.message}`);
          return { limit: () => ({ data: [], error: err }) };
        }
      },
      limit: (count) => {
        try {
          return tableClient.limit(count);
        } catch (err) {
          console.error(`[Supabase] Database limit error: ${err.message}`);
          return { data: [], error: err };
        }
      },
      single: () => {
        try {
          return tableClient.single();
        } catch (err) {
          console.error(`[Supabase] Database single error: ${err.message}`);
          return { data: null, error: err };
        }
      }
    };
  }
};

// Export the client instance
export default supabase;
