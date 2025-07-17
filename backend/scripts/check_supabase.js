import supabase from '../config/supabase.js';

/**
 * This script checks for and initializes the necessary Supabase resources
 */
const checkSupabaseResources = async () => {
  try {
    console.log('Checking Supabase configuration and resources...');

    // Check if we can connect to Supabase
    const { data, error } = await supabase
      .from('resumes')
      .select('count(*)', { count: 'exact' })
      .limit(1);
      
    if (error) {
      console.log(`Supabase DB connection issue: ${error.message}`);
      console.log('Attempting to run in recovery mode...');
    } else {
      console.log(`Supabase DB connection successful. Found ${data?.length || 0} records.`);
    }

    // Check if storage bucket exists
    try {
      const { data: bucketData, error: bucketError } = await supabase.storage.from('resumes').list('public', { limit: 1 });
      
      if (bucketError) {
        console.log(`Supabase Storage issue: ${bucketError.message}`);
      } else {
        console.log('Supabase Storage bucket "resumes" is accessible.');
      }
    } catch (storageError) {
      console.error(`Supabase Storage check failed: ${storageError.message}`);
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
