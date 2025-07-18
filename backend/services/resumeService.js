import supabase from '../config/supabase.js';
import ErrorHandler from '../middlewares/error.js';

// Resume operations service
export const ResumeService = {
  /**
   * Upload a resume to Supabase storage
   * @param {Object} file - The file object
   * @param {string} userId - The user ID
   * @returns {Object} The uploaded file data
   */
  uploadResume: async (file, userId) => {
    try {
      console.log('[ResumeService] Uploading resume for user:', userId);
      
      if (!file || !file.buffer) {
        throw new Error('No file provided');
      }
      
      // Generate a unique filename
      const timestamp = Date.now();
      const fileExt = file.originalname.split('.').pop();
      const fileName = `${userId}_${timestamp}.${fileExt}`;
      
      // Upload to Supabase Storage
      const { data, error } = await supabase
        .storage
        .from('resumes')
        .upload(`public/${fileName}`, file.buffer, {
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
      
      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error) {
        console.error('[ResumeService] Query error:', error);
        throw new Error(error.message);
      }
      
      return data.length > 0 ? data[0] : null;
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
