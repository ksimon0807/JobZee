import supabase from '../config/supabase.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup paths for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../config/config.env') });

// Usage: node list-resumes.js [userId]
// If userId is not provided, lists all resumes
async function listResumes() {
  try {
    const userId = process.argv[2]; // Optional userId from command line
    
    console.log('Connecting to Supabase and querying resumes...');
    
    let query = supabase.from('resumes').select('*');
    
    if (userId) {
      query = query.eq('user_id', userId);
      console.log(`Filtering by user ID: ${userId}`);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error querying resumes:', error);
      return;
    }
    
    console.log(`Found ${data.length} resume${data.length !== 1 ? 's' : ''}:`);
    console.log('----------------------------------------------------');
    
    data.forEach((resume, index) => {
      console.log(`Resume #${index + 1}:`);
      console.log(`  ID: ${resume.id}`);
      console.log(`  User ID: ${resume.user_id}`);
      console.log(`  File Name: ${resume.file_name}`);
      console.log(`  Original Name: ${resume.original_name || 'N/A'}`);
      console.log(`  Type: ${resume.file_type}`);
      console.log(`  Size: ${resume.file_size} bytes`);
      console.log(`  URL: ${resume.public_url}`);
      console.log(`  Uploaded: ${new Date(resume.created_at).toLocaleString()}`);
      console.log('----------------------------------------------------');
    });
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

listResumes();
