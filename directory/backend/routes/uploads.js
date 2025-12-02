const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { uploadImage, deleteImage } = require('../utils/cloudinary');
const fs = require('fs');
const path = require('path');
const { authenticateDirectoryAdmin } = require('../middleware/auth');

// Upload tenant logo (protected)
router.post('/tenant-logo', authenticateDirectoryAdmin, upload.single('logoImage'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const result = await uploadImage(req.file, 'press-directory/tenant-logos');

        // Delete local file after upload
        fs.unlinkSync(req.file.path);

        res.json({
            imageUrl: result.imageUrl,
            cloudinaryId: result.cloudinaryId,
        });
    } catch (error) {
        // Clean up local file on error
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        console.error('Upload error:', error);
        res.status(500).json({ message: 'Failed to upload image' });
    }
});

// Upload listing logo (protected)
router.post('/listing-logo', authenticateDirectoryAdmin, upload.single('logoImage'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const result = await uploadImage(req.file, 'press-directory/listing-logos');

        // Delete local file after upload
        fs.unlinkSync(req.file.path);

        res.json({
            imageUrl: result.imageUrl,
            cloudinaryId: result.cloudinaryId,
        });
    } catch (error) {
        // Clean up local file on error
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        console.error('Upload error:', error);
        res.status(500).json({ message: 'Failed to upload image' });
    }
});

module.exports = router;


