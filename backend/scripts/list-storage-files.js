import supabase from '../config/supabase.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup paths for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../config/config.env') });

// List all files in the resumes bucket
async function listStorageFiles() {
  try {
    console.log('Connecting to Supabase storage...');
    
    // List all files in the resumes bucket
    const { data, error } = await supabase
      .storage
      .from('resumes')
      .list(undefined, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' },
      });
    
    if (error) {
      console.error('Error listing storage files:', error);
      return;
    }
    
    console.log(`Found ${data.length} file${data.length !== 1 ? 's' : ''} in storage bucket:`);
    console.log('----------------------------------------------------');
    
    data.forEach((file, index) => {
      console.log(`File #${index + 1}:`);
      console.log(`  Name: ${file.name}`);
      console.log(`  Size: ${file.metadata?.size || 'N/A'} bytes`);
      console.log(`  MIME Type: ${file.metadata?.mimetype || 'N/A'}`);
      console.log(`  Last Modified: ${file.metadata?.lastModified ? new Date(file.metadata.lastModified).toLocaleString() : 'N/A'}`);
      console.log(`  Created: ${file.created_at ? new Date(file.created_at).toLocaleString() : 'N/A'}`);
      console.log('----------------------------------------------------');
    });
    
    // Get bucket info
    const { data: bucketData, error: bucketError } = await supabase
      .storage
      .getBucket('resumes');
      
    if (bucketError) {
      console.error('Error getting bucket info:', bucketError);
      return;
    }
    
    console.log('\nBucket Information:');
    console.log(`  Name: ${bucketData.name}`);
    console.log(`  ID: ${bucketData.id}`);
    console.log(`  Public: ${bucketData.public ? 'Yes' : 'No'}`);
    console.log(`  Created At: ${new Date(bucketData.created_at).toLocaleString()}`);
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

listStorageFiles();
