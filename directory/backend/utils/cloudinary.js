const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadImage = async (file, folder = 'press-directory') => {
    try {
        const result = await cloudinary.uploader.upload(file.path, {
            folder: folder,
            resource_type: 'image',
            transformation: [
                { width: 800, height: 800, crop: 'limit' },
                { quality: 'auto' },
            ],
        });
        return {
            imageUrl: result.secure_url,
            cloudinaryId: result.public_id,
        };
    } catch (error) {
        throw new Error(`Cloudinary upload failed: ${error.message}`);
    }
};

const deleteImage = async (cloudinaryId) => {
    try {
        await cloudinary.uploader.destroy(cloudinaryId);
    } catch (error) {
        console.error('Cloudinary delete failed:', error);
    }
};

module.exports = { uploadImage, deleteImage };


