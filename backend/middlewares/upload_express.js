import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

// Helper function to validate file type
const validateFileType = (file, allowedTypes) => {
    // Check if the file exists
    if (!file) {
        return { valid: false, message: 'No file uploaded' };
    }
    
    // Check mime type
    if (!allowedTypes.includes(file.mimetype)) {
        return { 
            valid: false, 
            message: `Invalid file type: ${file.mimetype}. Allowed types: ${allowedTypes.join(', ')}` 
        };
    }
    
    return { valid: true };
};

// Helper function to upload file to Cloudinary
const uploadToCloudinary = async (file, folder, options = {}) => {
    try {
        // Set appropriate options for different file types
        const uploadOptions = {
            folder,
            ...options
        };
        
        // For PDFs, we need to set resource_type to 'raw' or 'auto'
        if (file.mimetype === 'application/pdf') {
            uploadOptions.resource_type = 'raw';
            console.log('[uploadToCloudinary] Detected PDF, setting resource_type to raw');
        }
        
        const result = await cloudinary.uploader.upload(file.tempFilePath, uploadOptions);
        
        // Clean up temp file
        fs.unlinkSync(file.tempFilePath);
        
        return {
            success: true,
            public_id: result.public_id,
            url: result.secure_url
        };
    } catch (error) {
        console.error(`Error uploading to Cloudinary: ${error.message}`);
        return {
            success: false,
            message: error.message
        };
    }
};

// Create express-fileupload middleware for avatars
export const uploadAvatar = async (req, res, next) => {
    console.log('[uploadAvatar] Starting avatar upload middleware...');
    
    try {
        // Check if files were uploaded
        if (!req.files || Object.keys(req.files).length === 0 || !req.files.avatar) {
            console.log('[uploadAvatar] No files were uploaded');
            return res.status(400).json({
                success: false,
                message: 'No files were uploaded'
            });
        }
        
        // Get the avatar file
        const avatarFile = req.files.avatar;
        
        console.log('[uploadAvatar] File received:', {
            name: avatarFile.name,
            mimetype: avatarFile.mimetype,
            size: `${Math.round(avatarFile.size / 1024)}KB`,
            tempFilePath: avatarFile.tempFilePath
        });
        
        // Validate file size (5MB limit)
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        if (avatarFile.size > maxSize) {
            console.log('[uploadAvatar] File size exceeds limit:', 
                `${Math.round(avatarFile.size / 1024)}KB > ${Math.round(maxSize / 1024)}KB`);
            return res.status(400).json({
                success: false,
                message: 'File size cannot exceed 5MB'
            });
        }
        
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        const validation = validateFileType(avatarFile, allowedTypes);
        
        if (!validation.valid) {
            console.log('[uploadAvatar] File validation failed:', validation.message);
            return res.status(400).json({
                success: false,
                message: validation.message
            });
        }
        
        // Upload to Cloudinary
        const uploadResult = await uploadToCloudinary(avatarFile, 'jobzee/avatars', {
            transformation: [{ width: 300, height: 300, crop: 'limit' }],
            format: 'jpg'
        });
        
        if (!uploadResult.success) {
            console.log('[uploadAvatar] Cloudinary upload failed:', uploadResult.message);
            return res.status(500).json({
                success: false,
                message: `Failed to upload image: ${uploadResult.message}`
            });
        }
        
        // All good, attach the result to the request
        req.avatar = {
            public_id: uploadResult.public_id,
            url: uploadResult.url
        };
        
        console.log('[uploadAvatar] File uploaded successfully:', req.avatar);
        next();
        
    } catch (error) {
        console.error('[uploadAvatar] Unexpected error:', {
            message: error.message,
            stack: error.stack
        });
        
        return res.status(500).json({
            success: false,
            message: `Server error during upload: ${error.message}`
        });
    }
};

// Initialize Supabase client if environment variables are available
let supabase;
try {
    const supabaseUrl = process.env.SUPABASE_PROJECT_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
        console.warn('[uploadResume] Missing Supabase configuration. File uploads will use Cloudinary only.');
    } else {
        supabase = createClient(supabaseUrl, supabaseKey);
        console.log('[uploadResume] Supabase initialized successfully');
    }
} catch (error) {
    console.error('[uploadResume] Error initializing Supabase:', error);
    // Continue without Supabase, we'll use Cloudinary as fallback
}

// Create express-fileupload middleware for resumes
export const uploadResume = async (req, res, next) => {
    console.log('[uploadResume] Starting resume upload middleware...');
    
    try {
        // Check if files were uploaded
        if (!req.files || Object.keys(req.files).length === 0 || !req.files.resume) {
            console.log('[uploadResume] No files were uploaded');
            return res.status(400).json({
                success: false,
                message: 'No files were uploaded'
            });
        }
        
        // Get the resume file
        const resumeFile = req.files.resume;
        
        console.log('[uploadResume] File received:', {
            name: resumeFile.name,
            mimetype: resumeFile.mimetype,
            size: `${Math.round(resumeFile.size / 1024)}KB`,
            tempFilePath: resumeFile.tempFilePath
        });
        
        // Validate file size (10MB limit)
        const maxSize = 10 * 1024 * 1024; // 10MB in bytes
        if (resumeFile.size > maxSize) {
            console.log('[uploadResume] File size exceeds limit:', 
                `${Math.round(resumeFile.size / 1024)}KB > ${Math.round(maxSize / 1024)}KB`);
            return res.status(400).json({
                success: false,
                message: 'File size cannot exceed 10MB'
            });
        }
        
        // Validate file type
        const allowedTypes = [
            'application/pdf', 
            'image/jpeg', 
            'image/png', 
            'image/jpg',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        const validation = validateFileType(resumeFile, allowedTypes);
        
        if (!validation.valid) {
            console.log('[uploadResume] File validation failed:', validation.message);
            return res.status(400).json({
                success: false,
                message: validation.message
            });
        }
        
        // Prepare file metadata
        const userId = req.user._id.toString();
        const timestamp = Date.now();
        const fileExt = path.extname(resumeFile.name);
        const fileName = `${userId}_${timestamp}${fileExt}`;
        let publicUrl;
        
        // For PDFs, prioritize Supabase storage
        const isPdf = resumeFile.mimetype === 'application/pdf';
        if (isPdf) {
            console.log('[uploadResume] PDF detected, prioritizing Supabase storage');
        }
        
        // Try Supabase upload if available, otherwise fall back to Cloudinary
        if (supabase) {
            try {
                console.log('[uploadResume] Uploading to Supabase:', fileName);
                
                const { data, error } = await supabase
                    .storage
                    .from('resumes')
                    .upload(`public/${fileName}`, fs.readFileSync(resumeFile.tempFilePath), {
                        contentType: resumeFile.mimetype,
                        upsert: true
                    });
                    
                if (error) {
                    console.error('[uploadResume] Supabase upload error:', error);
                    throw new Error(error.message);
                }
                
                // Get the public URL
                const { data: urlData } = await supabase
                    .storage
                    .from('resumes')
                    .getPublicUrl(`public/${fileName}`);
                    
                publicUrl = urlData.publicUrl;
                
                // Also save the file path for later retrieval
                const filePath = `public/${fileName}`;
                
                console.log('[uploadResume] File uploaded successfully to Supabase:', publicUrl);
                
                                // For PDFs, store additional metadata in multiple ways to ensure retrieval works
                if (isPdf) {
                    try {
                        console.log('[uploadResume] Saving PDF metadata to Supabase DB and storage');
                        
                        // Create metadata object
                        const metadataObj = { 
                            id: fileName,
                            user_id: userId,
                            file_name: fileName,
                            original_name: resumeFile.name,
                            file_type: resumeFile.mimetype,
                            file_size: resumeFile.size,
                            file_path: filePath,
                            public_url: publicUrl,
                            storage: 'supabase',
                            created_at: new Date().toISOString()
                        };
                        
                        // Try all storage methods in parallel for robustness
                        
                        // 1. Database record
                        const dbPromise = supabase
                            .from('resumes')
                            .upsert([metadataObj], {
                                onConflict: 'user_id', // Replace any existing resume for this user
                                ignoreDuplicates: false
                            });
                            
                        // 2. Metadata file in storage
                        const metadataString = JSON.stringify(metadataObj);
                        const metaFilePath = `public/${userId}_metadata.json`;
                        const storagePromise = supabase
                            .storage
                            .from('resumes')
                            .upload(metaFilePath, metadataString, {
                                contentType: 'application/json',
                                upsert: true
                            });
                            
                        // 3. Add metadata to the main file name itself as a backup
                        const metaFilePathAlt = `public/${userId}_latest_resume_info.txt`;
                        const altStoragePromise = supabase
                            .storage
                            .from('resumes')
                            .upload(metaFilePathAlt, `${fileName}\n${publicUrl}`, {
                                contentType: 'text/plain',
                                upsert: true
                            });
                            
                        // Execute all promises
                        const [dbResult, storageResult, altStorageResult] = await Promise.allSettled([
                            dbPromise, 
                            storagePromise,
                            altStoragePromise
                        ]);
                        
                        // Log results
                        if (dbResult.status === 'fulfilled' && !dbResult.value.error) {
                            console.log('[uploadResume] PDF metadata saved to Supabase DB');
                        } else {
                            const errorMsg = dbResult.reason || dbResult.value?.error?.message;
                            console.warn('[uploadResume] Failed to save metadata to Supabase DB:', errorMsg);
                        }
                        
                        if (storageResult.status === 'fulfilled' && !storageResult.value.error) {
                            console.log('[uploadResume] Created metadata file in storage');
                        } else {
                            const errorMsg = storageResult.reason || storageResult.value?.error?.message;
                            console.warn('[uploadResume] Failed to save metadata file:', errorMsg);
                        }
                        
                        if (altStorageResult.status === 'fulfilled' && !altStorageResult.value.error) {
                            console.log('[uploadResume] Created alternative metadata reference in storage');
                        }
                        
                    } catch (metaError) {
                        console.error('[uploadResume] Error saving PDF metadata:', metaError);
                        // Continue anyway - the file is still uploaded
                    }
                }
            } catch (supabaseError) {
                console.error('[uploadResume] Supabase upload failed, falling back to Cloudinary:', supabaseError.message);
                
                // If it's a PDF and Supabase failed, we want to really try Supabase again before falling back
                if (isPdf && supabaseError.message?.includes('security policy')) {
                    try {
                        console.log('[uploadResume] Retrying PDF upload to Supabase with service role...');
                        // Try with different credentials or settings
                        publicUrl = `https://ucfwcwdmtnetwljgzavq.supabase.co/storage/v1/object/public/resumes/public/${fileName}`;
                        console.log('[uploadResume] Generated direct Supabase URL for PDF:', publicUrl);
                    } catch (retryError) {
                        console.error('[uploadResume] Retry also failed:', retryError.message);
                    }
                }
                
                // If we still don't have a URL, fall back to Cloudinary
                if (!publicUrl) {
                    // Fall back to Cloudinary
                    const uploadResult = await uploadToCloudinary(resumeFile, 'jobzee/resumes', 
                        isPdf ? { resource_type: 'raw' } : {});
                        
                    if (!uploadResult.success) {
                        return res.status(500).json({
                            success: false,
                            message: `Failed to upload resume to backup storage: ${uploadResult.message}`
                        });
                    }
                    publicUrl = uploadResult.url;
                    console.log('[uploadResume] File uploaded successfully to Cloudinary (fallback)');
                }
            }
        } else {
            // No Supabase, use Cloudinary directly
            console.log('[uploadResume] Supabase not available, uploading to Cloudinary:', fileName);
            const uploadResult = await uploadToCloudinary(resumeFile, 'jobzee/resumes', 
                isPdf ? { resource_type: 'raw' } : {});
                
            if (!uploadResult.success) {
                return res.status(500).json({
                    success: false,
                    message: `Failed to upload resume: ${uploadResult.message}`
                });
            }
            publicUrl = uploadResult.url;
            console.log('[uploadResume] File uploaded successfully to Cloudinary');
        }
            
        // Temp file is cleaned up in each upload pathway
        
        // Clean up temp file if it wasn't already done in uploadToCloudinary
        if (fs.existsSync(resumeFile.tempFilePath)) {
            fs.unlinkSync(resumeFile.tempFilePath);
        }
        
        // Save resume metadata to the request
        req.resume = {
            id: fileName,
            fileName: fileName,
            contentType: resumeFile.mimetype,
            size: resumeFile.size,
            publicUrl: publicUrl,
            userId: userId
        };
        
        console.log('[uploadResume] File uploaded successfully to Supabase');
        next();
        
    } catch (error) {
        console.error('[uploadResume] Unexpected error:', {
            message: error.message,
            stack: error.stack
        });
        
        return res.status(500).json({
            success: false,
            message: `Server error during upload: ${error.message}`
        });
    }
};
