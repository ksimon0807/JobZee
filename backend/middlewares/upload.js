import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';

// Configure Storage for Profile Pictures
const avatarStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'jobzee/avatars',
        allowed_formats: ['jpg', 'jpeg', 'png'],
        transformation: [{ width: 300, height: 300, crop: 'limit' }],
        format: 'jpg'
    }
});

// Configure Storage for Resumes
const resumeStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'jobzee/resumes',
        allowed_formats: ['pdf'],
        resource_type: 'raw',
        public_id: (req, file) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            return `resume-${uniqueSuffix}`;
        }
    }
});

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
            fileSize: 1024 * 1024 * 2 // 2MB max file size
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
    
    const upload = multer({
        storage,
        limits: {
            fileSize: 1024 * 1024 * 5 // 5MB max file size for resumes
        },
        fileFilter: (req, file, cb) => {
            console.log('[uploadResume] Processing file:', file.originalname, file.mimetype, file.size);
            
            if (!file) {
                console.log('[uploadResume] No file provided');
                return cb(new Error('No file uploaded'), false);
            }

            // Allow PDFs and common image formats
            const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
            if (!allowedTypes.includes(file.mimetype)) {
                return cb(new Error('Only PDF and image files are allowed'), false);
            }
            cb(null, true);
        }
    }).single('resume');

    upload(req, res, function(err) {
        console.log('[uploadResume] Upload attempt completed');
        
        if (err instanceof multer.MulterError) {
            console.error('[uploadResume] Multer error:', err);
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    success: false,
                    message: 'File size cannot exceed 5MB'
                });
            }
            return res.status(400).json({
                success: false,
                message: err.message
            });
        } else if (err) {
            console.error('[uploadResume] General error:', err);
            return res.status(500).json({
                success: false,
                message: err.message
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
