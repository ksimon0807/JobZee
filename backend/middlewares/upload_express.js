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
        const result = await cloudinary.uploader.upload(file.tempFilePath, {
            folder,
            ...options
        });
        
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

// Initialize Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

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
        
        // Upload to Supabase
        const userId = req.user._id.toString();
        const timestamp = Date.now();
        const fileExt = path.extname(resumeFile.name);
        const fileName = `${userId}_${timestamp}${fileExt}`;
        
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
            return res.status(500).json({
                success: false,
                message: `Failed to upload resume: ${error.message}`
            });
        }
        
        // Get the public URL
        const { data: urlData } = await supabase
            .storage
            .from('resumes')
            .getPublicUrl(`public/${fileName}`);
            
        // Clean up temp file
        fs.unlinkSync(resumeFile.tempFilePath);
        
        // Save resume metadata to the request
        req.resume = {
            id: fileName,
            fileName: fileName,
            contentType: resumeFile.mimetype,
            size: resumeFile.size,
            publicUrl: urlData.publicUrl,
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
