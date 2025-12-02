const express = require('express');
const router = express.Router();
const DirectoryAdmin = require('../models/DirectoryAdmin');
const DirectoryListing = require('../models/DirectoryListing');
const Tenant = require('../models/Tenant');
const { authenticateDirectoryAdmin } = require('../middleware/auth');
const { generateToken } = require('../utils/jwt');

// Login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        const admin = await DirectoryAdmin.findOne({ username: username.toLowerCase() });
        
        if (!admin) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isPasswordValid = await admin.comparePassword(password);
        
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (!admin.isActive) {
            return res.status(401).json({ message: 'Account is inactive' });
        }

        admin.lastLogin = new Date();
        await admin.save();

        const token = generateToken({ id: admin._id, username: admin.username });

        res.json({
            token,
            admin: {
                id: admin._id,
                username: admin.username,
                email: admin.email,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

// Get all listings (protected)
router.get('/listings', authenticateDirectoryAdmin, async (req, res) => {
    try {
        const listings = await DirectoryListing.find().sort({ createdAt: -1 });
        res.json(listings);
    } catch (error) {
        console.error('Error fetching listings:', error);
        res.status(500).json({ message: 'Failed to fetch listings' });
    }
});

// Create listing (protected)
router.post('/listings', authenticateDirectoryAdmin, async (req, res) => {
    try {
        const listingData = req.body;
        
        // Generate slug if not provided
        if (!listingData.slug && listingData.name) {
            listingData.slug = listingData.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
        }

        const listing = new DirectoryListing(listingData);
        await listing.save();

        res.status(201).json(listing);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Listing with this slug already exists' });
        }
        console.error('Error creating listing:', error);
        res.status(500).json({ message: 'Failed to create listing' });
    }
});

// Update listing (protected)
router.put('/listings/:id', authenticateDirectoryAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Generate slug if name changed and slug not provided
        if (updateData.name && !updateData.slug) {
            updateData.slug = updateData.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
        }

        const listing = await DirectoryListing.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!listing) {
            return res.status(404).json({ message: 'Listing not found' });
        }

        res.json(listing);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Listing with this slug already exists' });
        }
        console.error('Error updating listing:', error);
        res.status(500).json({ message: 'Failed to update listing' });
    }
});

// Delete listing (protected)
router.delete('/listings/:id', authenticateDirectoryAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const listing = await DirectoryListing.findByIdAndDelete(id);

        if (!listing) {
            return res.status(404).json({ message: 'Listing not found' });
        }

        // Delete image from Cloudinary if exists
        if (listing.logoCloudinaryId) {
            const { deleteImage } = require('../utils/cloudinary');
            await deleteImage(listing.logoCloudinaryId);
        }

        res.json({ message: 'Listing deleted successfully' });
    } catch (error) {
        console.error('Error deleting listing:', error);
        res.status(500).json({ message: 'Failed to delete listing' });
    }
});

// Get all tenants (protected)
router.get('/tenants', authenticateDirectoryAdmin, async (req, res) => {
    try {
        const tenants = await Tenant.find().sort({ createdAt: -1 });
        res.json(tenants);
    } catch (error) {
        console.error('Error fetching tenants:', error);
        res.status(500).json({ message: 'Failed to fetch tenants' });
    }
});

// Update tenant (protected)
router.put('/tenants/:id', authenticateDirectoryAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Generate slug if name changed and isListedInDirectory is true
        if (updateData.name && updateData.isListedInDirectory && !updateData.slug) {
            updateData.slug = updateData.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
        }

        const tenant = await Tenant.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!tenant) {
            return res.status(404).json({ message: 'Tenant not found' });
        }

        res.json(tenant);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Tenant with this slug already exists' });
        }
        console.error('Error updating tenant:', error);
        res.status(500).json({ message: 'Failed to update tenant' });
    }
});

// Get all plans (protected)
router.get('/plans', authenticateDirectoryAdmin, async (req, res) => {
    try {
        const Plan = require('../models/Plan');
        const plans = await Plan.find({ isActive: true }).sort({ name: 1 });
        res.json(plans);
    } catch (error) {
        console.error('Error fetching plans:', error);
        res.status(500).json({ message: 'Failed to fetch plans' });
    }
});

// Update plan prices (protected)
router.put('/plans/:id', authenticateDirectoryAdmin, async (req, res) => {
    try {
        const Plan = require('../models/Plan');
        const { id } = req.params;
        const { prices } = req.body;

        if (!prices || !Array.isArray(prices)) {
            return res.status(400).json({ message: 'Prices array is required' });
        }

        const plan = await Plan.findByIdAndUpdate(
            id,
            { prices },
            { new: true, runValidators: true }
        );

        if (!plan) {
            return res.status(404).json({ message: 'Plan not found' });
        }

        res.json(plan);
    } catch (error) {
        console.error('Error updating plan:', error);
        res.status(500).json({ message: 'Failed to update plan' });
    }
});

module.exports = router;

