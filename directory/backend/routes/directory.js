const express = require('express');
const router = express.Router();
const DirectoryListing = require('../models/DirectoryListing');
const Tenant = require('../models/Tenant');

// Get all public listings (with search and filter)
router.get('/listings', async (req, res) => {
    try {
        const { search, city } = req.query;
        const query = { isActive: true };

        // Build search query
        if (search) {
            query.$text = { $search: search };
        }

        if (city) {
            query.city = { $regex: city, $options: 'i' };
        }

        let listings = await DirectoryListing.find(query)
            .select('-logoCloudinaryId -bannerCloudinaryId')
            .sort({ createdAt: -1 });

        // Also get tenants that are listed in directory
        const tenantQuery = { isListedInDirectory: true, isActive: true };
        if (search) {
            tenantQuery.$text = { $search: search };
        }
        if (city) {
            tenantQuery.city = { $regex: city, $options: 'i' };
        }

        const tenants = await Tenant.find(tenantQuery)
            .select('-logoCloudinaryId -bannerCloudinaryId -plan -subscriptionStartDate -subscriptionEndDate')
            .sort({ createdAt: -1 });

        // Combine and format results
        const allListings = [
            ...listings.map(listing => ({
                _id: listing._id,
                name: listing.name,
                slug: listing.slug,
                description: listing.description,
                publicAddress: listing.publicAddress,
                publicPhone: listing.publicPhone,
                publicEmail: listing.publicEmail,
                city: listing.city,
                country: listing.country,
                logoUrl: listing.logoUrl,
                bannerUrl: listing.bannerUrl,
                type: 'listing',
            })),
            ...tenants.map(tenant => ({
                _id: tenant._id,
                name: tenant.name,
                slug: tenant.slug,
                description: tenant.description,
                publicAddress: tenant.publicAddress,
                publicPhone: tenant.publicPhone,
                publicEmail: tenant.publicEmail,
                city: tenant.city,
                country: tenant.country,
                logoUrl: tenant.logoUrl,
                bannerUrl: tenant.bannerUrl,
                type: 'tenant',
            })),
        ];

        res.json(allListings);
    } catch (error) {
        console.error('Error fetching public listings:', error);
        res.status(500).json({ message: 'Failed to fetch listings' });
    }
});

// Get business by slug (public)
router.get('/listings/:slug', async (req, res) => {
    try {
        const { slug } = req.params;

        // Try to find in DirectoryListing first
        let business = await DirectoryListing.findOne({ slug, isActive: true })
            .select('-logoCloudinaryId -bannerCloudinaryId');

        // If not found, try Tenant
        if (!business) {
            business = await Tenant.findOne({ slug, isListedInDirectory: true, isActive: true })
                .select('-logoCloudinaryId -bannerCloudinaryId -plan -subscriptionStartDate -subscriptionEndDate');
        }

        if (!business) {
            return res.status(404).json({ message: 'Business not found' });
        }

        res.json(business);
    } catch (error) {
        console.error('Error fetching business:', error);
        res.status(500).json({ message: 'Failed to fetch business' });
    }
});

module.exports = router;


