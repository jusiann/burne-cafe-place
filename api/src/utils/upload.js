import fs from 'node:fs';
import path from 'node:path';
import multer from 'multer';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const productUploadDir = path.join(__dirname, '../../public/uploads/products');

if (!fs.existsSync(productUploadDir)) {
    fs.mkdirSync(productUploadDir, { recursive: true });
}

const imageMimeTypes = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, productUploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname || '').toLowerCase();
        const baseName = path
            .basename(file.originalname || 'product-image', ext)
            .replace(/[^a-zA-Z0-9-_]/g, '-')
            .slice(0, 60);

        cb(null, `${Date.now()}-${baseName}${ext}`);
    },
});

const uploader = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (!imageMimeTypes.has(file.mimetype)) {
            return cb(new Error('Only JPG, PNG, and WEBP image files are allowed.'));
        }

        cb(null, true);
    },
});

export const uploadProductImage = (req, res, next) => {
    const singleUpload = uploader.single('image');

    singleUpload(req, res, (error) => {
        if (error instanceof multer.MulterError) {
            if (error.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    success: false,
                    error: 'Image must be smaller than 5MB.',
                });
            }

            return res.status(400).json({
                success: false,
                error: error.message || 'File upload failed.',
            });
        }

        if (error) {
            return res.status(400).json({
                success: false,
                error: error.message || 'Invalid image file.',
            });
        }

        return next();
    });
};
