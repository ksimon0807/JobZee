import supabase from '../config/supabase.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Setup paths for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../config/config.env') });

/**
 * Test Supabase connection and storage
 */
async function testSupabase() {
  console.log('Testing Supabase connection...');
  
  try {
    // Check connection
    const { data, error } = await supabase.from('resumes').select('count').limit(1);
    
    if (error) {
      console.error('Error connecting to Supabase:', error.message);
      return;
    }
    
    console.log('Successfully connected to Supabase!');
    
    // Test storage bucket
    console.log('Testing Supabase storage...');
    
    // Create a test file
    const testFilePath = path.join(__dirname, 'test-file.txt');
    fs.writeFileSync(testFilePath, 'This is a test file for Supabase storage.');
    
    // Upload to Supabase
    const fileContent = fs.readFileSync(testFilePath);
    const fileName = 'test-file.txt';
    
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('resumes')
      .upload(`test/${fileName}`, fileContent, {
        contentType: 'text/plain',
        upsert: true
      });
    
    if (uploadError) {
      console.error('Error uploading to Supabase storage:', uploadError.message);
      return;
    }
    
    console.log('Successfully uploaded file to Supabase storage!');
    
    // Get the public URL
    const { data: urlData } = supabase
      .storage
      .from('resumes')
      .getPublicUrl(`test/${fileName}`);
    
    console.log('File public URL:', urlData.publicUrl);
    
    // Clean up
    fs.unlinkSync(testFilePath);
    
    // Test the resumes table
    console.log('Testing resumes table...');
    
    const testEntry = {
      user_id: 'test-user-id',
      file_name: fileName,
      original_name: 'original-test-file.txt',
      file_type: 'text/plain',
      file_size: fileContent.length,
      file_path: `test/${fileName}`,
      public_url: urlData.publicUrl
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('resumes')
      .insert([testEntry])
      .select();
    
    if (insertError) {
      console.error('Error inserting into resumes table:', insertError.message);
      return;
    }
    
    console.log('Successfully inserted into resumes table!');
    console.log('Inserted data:', insertData);
    
    // Clean up the database entry
    const { error: deleteError } = await supabase
      .from('resumes')
      .delete()
      .eq('id', insertData[0].id);
    
    if (deleteError) {
      console.error('Error deleting test entry:', deleteError.message);
    } else {
      console.log('Successfully deleted test entry from database.');
    }
    
    // Clean up the storage file
    const { error: deleteFileError } = await supabase
      .storage
      .from('resumes')
      .remove([`test/${fileName}`]);
    
    if (deleteFileError) {
      console.error('Error deleting test file from storage:', deleteFileError.message);
    } else {
      console.log('Successfully deleted test file from storage.');
    }
    
    console.log('Supabase testing completed successfully!');
  } catch (error) {
    console.error('Unexpected error during Supabase testing:', error);
  }
}

// Run the test
testSupabase();
