const mongoose = require('mongoose');

const directoryListingSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    description: {
        type: String,
        default: '',
    },
    publicAddress: {
        type: String,
        default: '',
    },
    publicPhone: {
        type: String,
        default: '',
    },
    publicEmail: {
        type: String,
        default: '',
    },
    city: {
        type: String,
        default: '',
    },
    country: {
        type: String,
        default: '',
    },
    logoUrl: {
        type: String,
        default: '',
    },
    logoCloudinaryId: {
        type: String,
        default: '',
    },
    bannerUrl: {
        type: String,
        default: '',
    },
    bannerCloudinaryId: {
        type: String,
        default: '',
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});

// Generate slug from name before saving
directoryListingSchema.pre('save', function(next) {
    if (this.isModified('name') && !this.slug) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }
    next();
});

// Index for search
directoryListingSchema.index({ name: 'text', description: 'text', city: 'text' });
directoryListingSchema.index({ slug: 1 });
directoryListingSchema.index({ isActive: 1 });

module.exports = mongoose.model('DirectoryListing', directoryListingSchema);


