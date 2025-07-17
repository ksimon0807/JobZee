import supabase from '../config/supabase.js';
import ErrorHandler from '../middlewares/error.js';

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
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}_${timestamp}.${fileExt}`;
      
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
      
      const { data, error } = await supabase
        .storage
        .from('resumes')
        .upload(`public/${fileName}`, fileBuffer, {
          contentType: file.mimetype,
          upsert: true
        });
      
      if (error) {
        console.error('[ResumeService] Upload error:', error);
        throw new Error(error.message);
      }
      
      // Get the public URL
      const { data: urlData } = await supabase
        .storage
        .from('resumes')
        .getPublicUrl(`public/${fileName}`);
      
      console.log('[ResumeService] Resume uploaded successfully:', urlData.publicUrl);
      
      // Save resume metadata to the resumes table
      const { error: dbError } = await supabase
        .from('resumes')
        .insert([
          {
            user_id: userId,
            file_name: fileName,
            original_name: file.originalname,
            file_type: file.mimetype,
            file_size: file.size,
            file_path: data.path,
            public_url: urlData.publicUrl
          }
        ]);
      
      if (dbError) {
        console.error('[ResumeService] Database error:', dbError);
        throw new Error(dbError.message);
      }
      
      return {
        fileName,
        originalName: file.originalname,
        fileType: file.mimetype,
        publicUrl: urlData.publicUrl
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
      
      // First try to get from the resumes table
      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error) {
        console.error('[ResumeService] Query error:', error);
        // Don't throw - we'll try other methods
      }
      
      // If we found a resume in the database
      if (data && data.length > 0) {
        console.log('[ResumeService] Resume found in Supabase database');
        
        // Ensure we have proper URLs
        const resume = data[0];
        if (!resume.public_url && resume.file_path) {
          // Try to construct the public URL if missing
          try {
            const { data: urlData } = await supabase
              .storage
              .from('resumes')
              .getPublicUrl(resume.file_path);
              
            resume.public_url = urlData.publicUrl;
          } catch (urlError) {
            console.error('[ResumeService] Error getting public URL:', urlError);
          }
        }
        
        return resume;
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
            const { data: listData, error: listError } = await supabase
              .storage
              .from('resumes')
              .list('public', {
                search: userId
              });
              
            if (listError) {
              console.error('[ResumeService] Storage list error:', listError);
              throw listError;
            }
            
            if (listData && listData.length > 0) {
              console.log('[ResumeService] Found files in storage:', listData.length);
              
              // Find PDF files and sort by name (which includes timestamp) to get the most recent one
              const pdfFiles = listData
                .filter(file => file.name.includes(userId) && file.name.toLowerCase().endsWith('.pdf'))
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
      
      return null;
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
