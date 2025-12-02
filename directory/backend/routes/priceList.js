const express = require('express');
const router = express.Router();
const PriceList = require('../models/PriceList');
const Tenant = require('../models/Tenant');

// Get price list for a tenant (public)
router.get('/:tenantId', async (req, res) => {
    try {
        const { tenantId } = req.params;

        // Verify tenant exists and is listed
        const tenant = await Tenant.findOne({ 
            _id: tenantId, 
            isListedInDirectory: true, 
            isActive: true 
        });

        if (!tenant) {
            return res.status(404).json({ message: 'Tenant not found or not listed' });
        }

        const priceList = await PriceList.find({ tenantId }).sort({ itemType: 1, serviceType: 1 });
        res.json(priceList);
    } catch (error) {
        console.error('Error fetching price list:', error);
        res.status(500).json({ message: 'Failed to fetch price list' });
    }
});

module.exports = router;


