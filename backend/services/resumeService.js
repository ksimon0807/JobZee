import supabase from '../config/supabase.js';
import ErrorHandler from '../middlewares/error.js';

// Helper function to safely log objects
const safeLog = (prefix, obj) => {
  try {
    console.log(`${prefix}:`, JSON.stringify(obj, null, 2));
  } catch (err) {
    console.log(`${prefix} (stringify failed):`, obj);
  }
};

// Resume operations service
export const ResumeService = {
  /**
   * Upload a resume to Supabase storage
   * @param {Object} file - The file object from express-fileupload
   * @param {string} userId - The user ID
   * @returns {Object} The uploaded file data
   */
  uploadResume: async (file, userId) => {
    try {
      console.log('[ResumeService] Uploading resume for user:', userId);
      
      if (!file || !file.tempFilePath) {
        throw new Error('No file provided or invalid file format');
      }
      
      // Generate a unique filename
      const timestamp = Date.now();
      
      // Handle file extension safely - ensure PDF files have .pdf extension
      let fileName;
      if (file.name && file.name.includes('.')) {
        // Get extension from original filename
        const fileExt = file.name.split('.').pop();
        fileName = `${userId}_${timestamp}.${fileExt}`;
      } else {
        // No extension found in original name, use mimetype
        const ext = file.mimetype === 'application/pdf' ? 'pdf' : 
                    file.mimetype === 'image/jpeg' ? 'jpg' : 
                    file.mimetype === 'image/png' ? 'png' : 'bin';
        fileName = `${userId}_${timestamp}.${ext}`;
      }
      
      console.log(`[ResumeService] Generated filename: ${fileName} from original: ${file.name}`);
      
      // Upload to Supabase Storage using the temporary file created by express-fileupload
      const fs = await import('fs');
      const fileBuffer = fs.readFileSync(file.tempFilePath);
      
      // Check if Supabase is properly configured
      if (!process.env.SUPABASE_PROJECT_URL || 
          !(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY)) {
        console.warn('[ResumeService] Supabase not configured, falling back to Cloudinary');
        
        // Upload to Cloudinary as fallback
        const { v2: cloudinary } = await import('cloudinary');
        const uploadResult = await cloudinary.uploader.upload(file.tempFilePath, {
          resource_type: file.mimetype === 'application/pdf' ? 'raw' : 'auto',
          folder: 'jobzee/resumes'
        });
        
        return {
          fileName: fileName,
          originalName: file.name,
          fileType: file.mimetype,
          fileSize: file.size,
          publicUrl: uploadResult.secure_url
        };
      }
      
      // Safely access storage methods
      const storage = supabase.storage;
      if (!storage || typeof storage.from !== 'function') {
        throw new Error('Storage functionality not available');
      }
      
      // Get bucket safely
      const bucket = storage.from('resumes');
      if (!bucket || typeof bucket.upload !== 'function') {
        throw new Error('Upload functionality not available');
      }
      
      // Perform the upload with basic options
      const { data, error } = await bucket.upload(`public/${fileName}`, fileBuffer, {
        contentType: file.mimetype,
        upsert: true
      });
      
      if (error) {
        console.error('[ResumeService] Upload error:', error);
        throw new Error(error.message);
      }
      
      console.log('[ResumeService] Upload successful:', data);
      
      // Get the public URL - safely
      let publicUrl = '';
      if (bucket.getPublicUrl && typeof bucket.getPublicUrl === 'function') {
        const urlResult = bucket.getPublicUrl(`public/${fileName}`);
        if (urlResult && urlResult.data && urlResult.data.publicUrl) {
          publicUrl = urlResult.data.publicUrl;
        }
      } else {
        // Fallback URL construction if method not available
        publicUrl = `${process.env.SUPABASE_PROJECT_URL}/storage/v1/object/public/resumes/public/${fileName}`;
      }
      
      console.log('[ResumeService] Resume uploaded successfully:', publicUrl);
      
      // Save resume metadata to the resumes table - with safety checks
      try {
        const table = supabase.from('resumes');
        if (!table || typeof table.insert !== 'function') {
          console.warn('[ResumeService] Database insert not available');
        } else {
          const { error: dbError } = await table.insert([
            {
              user_id: userId,
              file_name: fileName,
              original_name: file.originalname || file.name,
              file_type: file.mimetype,
              file_size: file.size,
              file_path: data?.path || `public/${fileName}`,
              public_url: publicUrl
            }
          ]);
          
          if (dbError) {
            console.error('[ResumeService] Database error:', dbError);
            // Continue anyway - we'll return the file info even if DB insert fails
          }
        }
      } catch (dbError) {
        console.error('[ResumeService] Error saving to database:', dbError);
        // Continue anyway
      }
      
      if (dbError) {
        console.error('[ResumeService] Database error:', dbError);
        throw new Error(dbError.message);
      }
      
      return {
        fileName,
        originalName: file.originalname || file.name,
        fileType: file.mimetype,
        fileSize: file.size,
        publicUrl: publicUrl
      };
    } catch (error) {
      console.error('[ResumeService] Error uploading resume:', error);
      throw error;
    }
  },
  
  /**
   * Get a user's resume
   * @param {string} userId - The user ID
   * @returns {Object|null} The resume data or null if not found
   */
  getUserResume: async (userId) => {
    try {
      console.log('[ResumeService] Getting resume for user:', userId);
      
      // Check if supabase is initialized
      if (!supabase || typeof supabase.from !== 'function') {
        console.warn('[ResumeService] Supabase not initialized properly');
        return null;
      }
      
      // First try to get from the resumes table - using a safety wrapper for method chaining
      try {
        // Get resumes table
        const resumesTable = supabase.from('resumes');
        
        // Only proceed if we have a valid query object
        if (!resumesTable || typeof resumesTable.select !== 'function') {
          console.warn('[ResumeService] Invalid resumes table access');
          throw new Error('Invalid database table access');
        }
        
        // Build and execute the query safely
        const query = resumesTable.select('*');
        
        if (typeof query.eq === 'function') {
          const filteredQuery = query.eq('user_id', userId);
          const { data, error } = await filteredQuery;
          
          if (error) {
            console.error('[ResumeService] Query error:', error);
          } else if (data && data.length > 0) {
            console.log('[ResumeService] Resume found in Supabase database');
            
            // Process the result
            const resume = data[0];
            
            // Ensure we have proper URLs
            if (!resume.public_url && resume.file_path) {
              try {
                const storage = supabase.storage;
                if (storage && typeof storage.from === 'function') {
                  const bucket = storage.from('resumes');
                  if (bucket && typeof bucket.getPublicUrl === 'function') {
                    const { data: urlData } = bucket.getPublicUrl(resume.file_path);
                    if (urlData && urlData.publicUrl) {
                      resume.public_url = urlData.publicUrl;
                    }
                  }
                }
              } catch (urlError) {
                console.error('[ResumeService] Error getting public URL:', urlError);
              }
            }
            
            return resume;
          }
        } else {
          console.error('[ResumeService] Query method eq not available');
        }
      } catch (dbError) {
        console.error('[ResumeService] Database query error:', dbError);
        // Continue to other methods
      }
      
      // If we can't find it in the database, try multiple fallback methods
      console.log('[ResumeService] No resume in database, checking storage...');
      
      // Create a function to try all methods in sequence
      const tryAllMethods = async () => {
        try {
          // METHOD 1: Check for metadata file
          try {
            const { data: metaData, error: metaError } = await supabase
              .storage
              .from('resumes')
              .download(`public/${userId}_metadata.json`);
              
            if (!metaError && metaData) {
              try {
                const metaText = await metaData.text();
                const metadata = JSON.parse(metaText);
                console.log(`[ResumeService] Found metadata file for user: ${userId}`);
                
                if (metadata.public_url) {
                  console.log(`[ResumeService] Using metadata's public URL: ${metadata.public_url}`);
                  return {
                    id: metadata.id || `${userId}_resume.pdf`,
                    file_name: metadata.file_name || `${userId}_resume.pdf`,
                    user_id: userId,
                    file_type: metadata.file_type || 'application/pdf',
                    file_size: metadata.file_size,
                    public_url: metadata.public_url,
                    created_at: metadata.created_at || new Date().toISOString()
                  };
                }
              } catch (parseErr) {
                console.error('[ResumeService] Error parsing metadata file:', parseErr);
                // Continue to next method
              }
            }
          } catch (metaErr) {
            // No metadata file, continue to next method
          }
          
          // METHOD 2: Check for simplified text metadata
          try {
            const { data: simpleMetaData, error: simpleMetaError } = await supabase
              .storage
              .from('resumes')
              .download(`public/${userId}_latest_resume_info.txt`);
              
            if (!simpleMetaError && simpleMetaData) {
              try {
                const metaText = await simpleMetaData.text();
                const [fileName, publicUrl] = metaText.split('\n');
                
                if (fileName && publicUrl) {
                  console.log(`[ResumeService] Found simple metadata file with URL: ${publicUrl}`);
                  return {
                    id: fileName,
                    file_name: fileName,
                    user_id: userId,
                    file_type: 'application/pdf',
                    public_url: publicUrl,
                    created_at: new Date().toISOString()
                  };
                }
              } catch (parseErr) {
                // Continue to next method
              }
            }
          } catch (simpleMetaErr) {
            // Continue to next method
          }
          
          // METHOD 3: List files in storage and find PDFs
          try {
            // Safely access storage
            const storage = supabase.storage;
            if (!storage || typeof storage.from !== 'function') {
              console.warn('[ResumeService] Storage access not available');
              throw new Error('Storage access not available');
            }
            
            // Get bucket safely
            const bucket = storage.from('resumes');
            if (!bucket || typeof bucket.list !== 'function') {
              console.warn('[ResumeService] Bucket access not available');
              throw new Error('Bucket access not available');
            }
            
            // List files with minimal options to avoid errors
            const { data: listData, error: listError } = await bucket.list('public');
            
            if (listError) {
              console.error('[ResumeService] Storage list error:', listError);
              throw listError;
            }
            
            if (listData && listData.length > 0) {
              console.log('[ResumeService] Found files in storage:', listData.length);
              
              // Debug file list
              console.log('[ResumeService] All files:', listData.map(file => file.name).join(', '));
              // Log detailed file information to help debug
              safeLog('[ResumeService] Detailed file list', listData);
              
              // Manually filter and sort on our side to avoid complex query parameters
              // Note: Some files might not have .pdf extension in their name
              const pdfFiles = listData
                .filter(file => {
                  // Check if the file exists and has a name
                  if (!file || !file.name) return false;
                  
                  // Check if this file belongs to the current user
                  const isUsersFile = file.name.includes(userId);
                  
                  // Check if it's a PDF file (either by extension or by naming pattern)
                  const isPdfByExtension = file.name.toLowerCase().endsWith('.pdf');
                  const isPdfByTimestamp = /^\d+_\d+$/.test(file.name); // Matches userId_timestamp pattern
                  
                  return isUsersFile && (isPdfByExtension || isPdfByTimestamp);
                })
                .sort((a, b) => b.name.localeCompare(a.name)); // Sort by name descending (newer files have higher timestamps)
              
              if (pdfFiles.length > 0) {
                const pdfFile = pdfFiles[0]; // Get most recent PDF
                console.log('[ResumeService] Found PDF in storage:', pdfFile.name);
                
                // Get the public URL
                const { data: urlData } = await supabase
                  .storage
                  .from('resumes')
                  .getPublicUrl(`public/${pdfFile.name}`);
                
                const resumeData = {
                  id: pdfFile.name,
                  file_name: pdfFile.name,
                  user_id: userId,
                  file_type: 'application/pdf',
                  public_url: urlData.publicUrl,
                  created_at: new Date().toISOString()
                };
                
                // Try to update metadata files and DB records for future queries
                try {
                  // Update DB record
                  await supabase
                    .from('resumes')
                    .upsert(resumeData, {
                      onConflict: 'user_id',
                      ignoreDuplicates: false
                    });
                    
                  // Update metadata file
                  await supabase
                    .storage
                    .from('resumes')
                    .upload(`public/${userId}_metadata.json`, JSON.stringify(resumeData), {
                      contentType: 'application/json',
                      upsert: true
                    });
                    
                  // Update simple metadata
                  await supabase
                    .storage
                    .from('resumes')
                    .upload(`public/${userId}_latest_resume_info.txt`, `${pdfFile.name}\n${urlData.publicUrl}`, {
                      contentType: 'text/plain',
                      upsert: true
                    });
                    
                  console.log('[ResumeService] Updated all metadata sources for future queries');
                } catch (updateErr) {
                  console.warn('[ResumeService] Could not update metadata:', updateErr.message);
                }
                
                return resumeData;
              } else {
                console.log(`[ResumeService] No PDF files found matching userId ${userId} after filtering`);
              }
            }
            
            console.log(`[ResumeService] No PDF files found for user: ${userId}`);
            return null;
          } catch (storageError) {
            console.error('[ResumeService] Storage search error:', storageError);
            throw storageError;
          }
        } catch (error) {
          console.error('[ResumeService] All resume retrieval methods failed:', error);
          return null;
        }
      };
      
      // Try all methods and return the result
      return await tryAllMethods();
    } catch (error) {
      console.error('[ResumeService] Error getting resume:', error);
      throw error;
    }
  },
  
  /**
   * Delete a resume
   * @param {string} resumeId - The resume ID
   * @param {string} userId - The user ID (for verification)
   * @returns {boolean} Success status
   */
  deleteResume: async (resumeId, userId) => {
    try {
      console.log('[ResumeService] Deleting resume:', resumeId, 'for user:', userId);
      
      // Get the resume to check ownership and get file path
      const { data, error: getError } = await supabase
        .from('resumes')
        .select('*')
        .eq('id', resumeId)
        .eq('user_id', userId)
        .single();
      
      if (getError || !data) {
        console.error('[ResumeService] Resume not found or not owned by user');
        throw new Error('Resume not found or access denied');
      }
      
      // Delete from storage
      const { error: storageError } = await supabase
        .storage
        .from('resumes')
        .remove([data.file_path]);
      
      if (storageError) {
        console.error('[ResumeService] Storage delete error:', storageError);
        throw new Error(storageError.message);
      }
      
      // Delete from database
      const { error: dbError } = await supabase
        .from('resumes')
        .delete()
        .eq('id', resumeId)
        .eq('user_id', userId);
      
      if (dbError) {
        console.error('[ResumeService] Database delete error:', dbError);
        throw new Error(dbError.message);
      }
      
      console.log('[ResumeService] Resume deleted successfully');
      return true;
    } catch (error) {
      console.error('[ResumeService] Error deleting resume:', error);
      throw error;
    }
  }
};

export default ResumeService;
