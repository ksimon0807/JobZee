import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';

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

// Create Multer instances with middleware wrapper
export const uploadAvatar = (req, res, next) => {
    console.log('[uploadAvatar] Starting avatar upload middleware...');
    console.log('[uploadAvatar] Headers:', {
        contentType: req.headers['content-type'],
        hasAuthHeader: !!req.headers.authorization,
        contentLength: req.headers['content-length'],
        boundary: req.headers['content-type']?.split('boundary=')[1] || 'none'
    });
    
    if (!req.headers['content-type']?.includes('multipart/form-data')) {
        console.error('[uploadAvatar] Content-Type is not multipart/form-data:', req.headers['content-type']);
        return res.status(400).json({
            success: false,
            message: 'Invalid content type. Use multipart/form-data for file uploads.'
        });
    }
    
    const upload = multer({ 
        storage: avatarStorage,
        limits: {
            fileSize: 1024 * 1024 * 5 // Increased to 5MB max file size
        },
        fileFilter: (req, file, cb) => {
            console.log('[uploadAvatar] Processing file:', file.originalname, file.mimetype);
            
            if (!file) {
                return cb(new Error('No file uploaded'), false);
            }

            const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
            if (!allowedTypes.includes(file.mimetype)) {
                return cb(new Error('Only JPG, JPEG, and PNG files are allowed'), false);
            }
            cb(null, true);
        }
    }).single('avatar');

    upload(req, res, function(err) {
        console.log('[uploadAvatar] Upload attempt completed, checking for errors...');
        
        if (err instanceof multer.MulterError) {
            console.error('[uploadAvatar] Multer error:', err);
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    success: false,
                    message: 'File size cannot exceed 2MB'
                });
            }
            return res.status(400).json({
                success: false,
                message: err.message
            });
        } else if (err) {
            console.error('[uploadAvatar] General error:', err);
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }
        
        // Log request content details for debugging
        console.log('[uploadAvatar] Request content details:', {
            hasBody: !!req.body,
            bodyKeys: req.body ? Object.keys(req.body) : 'None',
            hasFile: !!req.file,
            hasFiles: !!req.files,
            authUser: req.user ? `${req.user._id} (${req.user.role})` : 'No user in request'
        });

        if (!req.file) {
            console.log('[uploadAvatar] No file in request after upload');
            return res.status(400).json({
                success: false,
                message: 'Please select a file to upload'
            });
        }

        console.log('[uploadAvatar] File upload successful:', req.file.originalname);
        next();
    });
};

export const uploadResume = (req, res, next) => {
    console.log('[uploadResume] Starting resume upload middleware...');
    console.log('[uploadResume] Headers:', {
        contentType: req.headers['content-type'],
        hasAuthHeader: !!req.headers.authorization,
        contentLength: req.headers['content-length'],
        boundary: req.headers['content-type']?.split('boundary=')[1] || 'none'
    });
    
    if (!req.headers['content-type']?.includes('multipart/form-data')) {
        console.error('[uploadResume] Content-Type is not multipart/form-data:', req.headers['content-type']);
        return res.status(400).json({
            success: false,
            message: 'Invalid content type. Use multipart/form-data for file uploads.'
        });
    }
    
    // For Supabase, we use memory storage to get the file buffer
    const storage = multer.memoryStorage();
    
    // Create a more robust upload handler
    console.log('[uploadResume] Setting up multer with memory storage');
    
    const upload = multer({
        storage,
        limits: {
            fileSize: 1024 * 1024 * 10 // Increased to 10MB max file size for resumes
        },
        fileFilter: (req, file, cb) => {
                console.log('[uploadResume] Processing file:', file.originalname, file.mimetype, 
                    file.size ? `${Math.round(file.size/1024)}KB` : 'size unknown');
                
                if (!file) {
                    console.log('[uploadResume] No file provided');
                    return cb(new Error('No file uploaded'), false);
                }

                // More permissive file type checking
                const allowedTypes = [
                    'application/pdf', 
                    'image/jpeg', 
                    'image/png', 
                    'image/jpg',
                    'application/msword',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                ];
                
                if (!allowedTypes.includes(file.mimetype)) {
                    console.log('[uploadResume] Invalid file type:', file.mimetype);
                    return cb(new Error(`Invalid file type: ${file.mimetype}. Only PDF, Word, and image files are allowed`), false);
                }
                
                console.log('[uploadResume] File accepted:', file.originalname);
                cb(null, true);
            }
        }).single('resume');

    upload(req, res, function(err) {
        console.log('[uploadResume] Upload attempt completed');
        
        if (err instanceof multer.MulterError) {
            console.error('[uploadResume] Multer error:', err.code, err.message);
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    success: false,
                    message: 'File size cannot exceed 10MB'
                });
            }
            return res.status(400).json({
                success: false,
                message: `Upload error: ${err.message}`
            });
        } else if (err) {
            // Log more details about the error
            console.error('[uploadResume] General error:', {
                message: err.message,
                code: err.code,
                name: err.name,
                stack: err.stack ? err.stack.split('\n').slice(0, 3).join('\n') : 'No stack'
            });
            
            // Check if it's an Unexpected end of form error
            if (err.message && err.message.includes('Unexpected end of form')) {
                return res.status(400).json({
                    success: false,
                    message: 'File upload was interrupted. Please try uploading a smaller file or check your connection.'
                });
            }
            
            return res.status(500).json({
                success: false,
                message: `Server error during upload: ${err.message}`
            });
        }
        
        // Log details about the file received
        if (req.file) {
            console.log('[uploadResume] File received successfully:', {
                originalname: req.file.originalname,
                mimetype: req.file.mimetype,
                size: req.file.size,
                buffer: req.file.buffer ? `${req.file.buffer.length} bytes` : 'None'
            });
        } else {
            console.log('[uploadResume] No file in request');
        }

        // Do NOT require a file. Just proceed.
        // if (!req.file) {
        //     return res.status(400).json({
        //         success: false,
        //         message: 'Please select a file to upload'
        //     });
        // }

        if (req.file) {
            console.log('[uploadResume] File received successfully:', {
                filename: req.file.originalname,
                size: req.file.size,
                mimetype: req.file.mimetype
            });
        } else {
            console.log('[uploadResume] No file in request, but proceeding anyway');
        }

        console.log('[uploadResume] Upload middleware complete. Proceeding to controller.');
        next();
    });
};
