import multer from 'multer';
import path from 'path';

// Shared file filter — only allow image types
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new Error('Only image files (jpeg, jpg, png, webp) are allowed'), false);
    }
};

// Shared filename generator — prevents duplicate names
const generateFilename = (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
};

// ==================== PROFILE IMAGE UPLOAD ====================
const profileStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/profiles/'),
    filename: generateFilename,
});

export const profileUpload = multer({
    storage: profileStorage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

// ==================== PRODUCT IMAGES UPLOAD ====================
const productStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/products/'),
    filename: generateFilename,
});

export const productUpload = multer({
    storage: productStorage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

// ==================== CATEGORY IMAGE UPLOAD ====================
const categoryStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/categories/'),
    filename: generateFilename,
});

export const categoryUpload = multer({
    storage: categoryStorage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

// ==================== BRAND LOGO UPLOAD ====================
const brandStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/brands/'),
    filename: generateFilename,
});

export const brandUpload = multer({
    storage: brandStorage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});
