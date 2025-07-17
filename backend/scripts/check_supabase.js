import supabase from '../config/supabase.js';

/**
 * This script checks for and initializes the necessary Supabase resources
 * with comprehensive error handling to avoid chaining issues
 */
const checkSupabaseResources = async () => {
  try {
    console.log('Checking Supabase configuration and resources...');
    
    // First verify we have a valid client
    if (!supabase) {
      console.error('Supabase client not initialized');
      return { success: false, error: 'Client not initialized' };
    }
    
    // Check for required environment variables
    const supabaseUrl = process.env.SUPABASE_PROJECT_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.warn('Missing Supabase configuration. Set SUPABASE_PROJECT_URL and SUPABASE_SERVICE_ROLE_KEY/SUPABASE_ANON_KEY');
      return { success: false, error: 'Missing configuration' };
    }
    
    // Check database connection with proper error handling
    try {
      // Safely check if the database methods are available
      if (supabase.from && typeof supabase.from === 'function') {
        const resumesTable = supabase.from('resumes');
        
        if (resumesTable && typeof resumesTable.select === 'function') {
          // Use a simple select without count to avoid parsing errors
          const query = resumesTable.select('id');
          
          if (query && typeof query.limit === 'function') {
            const { data, error } = await query.limit(1);
            
            if (error) {
              console.log(`Supabase DB connection issue: ${error.message}`);
            } else {
              console.log(`Supabase DB connection successful. Found ${data?.length || 0} records.`);
            }
          } else {
            console.warn('Supabase query limit method not available');
          }
        } else {
          console.warn('Supabase select method not available');
        }
      } else {
        console.warn('Supabase from method not available');
      }
    } catch (dbError) {
      console.error(`Database check failed: ${dbError.message}`);
    }
    
    // Check storage access with proper error handling
    try {
      // First check if storage exists
      if (supabase.storage && typeof supabase.storage.from === 'function') {
        const bucket = supabase.storage.from('resumes');
        
        if (bucket && typeof bucket.list === 'function') {
          const { data, error } = await bucket.list('public');
          
          if (error) {
            console.log(`Supabase Storage issue: ${error.message}`);
          } else {
            console.log(`Supabase Storage accessible. Found ${data?.length || 0} files.`);
          }
        } else {
          console.warn('Storage list method not available');
        }
      } else {
        console.warn('Storage from method not available');
      }
    } catch (storageError) {
      console.error(`Storage check failed: ${storageError.message}`);
    }

    return { success: true };
  } catch (err) {
    console.error(`Supabase resource check failed: ${err.message}`);
    return { success: false, error: err.message };
  }
};

// Run the check
checkSupabaseResources()
  .then(() => console.log('Supabase resource check completed.'))
  .catch(err => console.error('Error:', err));

export default checkSupabaseResources;
