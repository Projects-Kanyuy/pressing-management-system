const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    slug: {
        type: String,
        unique: true,
        sparse: true,
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
    isListedInDirectory: {
        type: Boolean,
        default: false,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    plan: {
        type: String,
        enum: ['trial', 'basic', 'pro'],
        default: 'trial',
    },
    subscriptionStartDate: {
        type: Date,
    },
    subscriptionEndDate: {
        type: Date,
    },
}, {
    timestamps: true,
});

// Generate slug from name before saving
tenantSchema.pre('save', function(next) {
    if (this.isModified('name') && !this.slug && this.isListedInDirectory) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }
    next();
});

// Index for search
tenantSchema.index({ name: 'text', description: 'text', city: 'text' });
tenantSchema.index({ slug: 1 });
tenantSchema.index({ isListedInDirectory: 1, isActive: 1 });

module.exports = mongoose.model('Tenant', tenantSchema);


