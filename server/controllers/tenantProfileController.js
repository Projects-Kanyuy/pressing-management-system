// server/controllers/tenantProfileController.js
import asyncHandler from '../middleware/asyncHandler.js';
import Tenant from '../models/Tenant.js';

// @desc    Get the current tenant's public profile data for editing
// @route   GET /api/tenant-profile
// @access  Private/Admin
// From: server/controllers/tenantController.js


const getMyTenantProfile = asyncHandler(async (req, res) => {
    // req.tenantId is provided by the 'protect' middleware
    // We fetch the tenant document, excluding sensitive Stripe IDs
    const tenant = await Tenant.findById(req.tenantId).select('-stripeCustomerId -stripeSubscriptionId');

    if (!tenant) {
        res.status(404);
        throw new Error('Tenant profile not found. Please contact support.');
    }
    
    // Respond with a comprehensive object containing all necessary profile and subscription data
    res.status(200).json({
        // Standard tenant info
        _id: tenant._id,
        name: tenant.name,
        email: tenant.email,
        description: tenant.description,
        logoUrl: tenant.logoUrl,
        publicAddress: tenant.publicAddress,
        publicPhone: tenant.publicPhone,
        city: tenant.city,
        country: tenant.country,
        isListedInDirectory: tenant.isListedInDirectory,
        isActive: tenant.isActive,
        
        // Subscription details
        plan: tenant.plan,
        subscriptionStatus: tenant.subscriptionStatus,
        trialEndsAt: tenant.trialEndsAt,
        nextBillingAt: tenant.nextBillingAt,
    });
});
// @desc    Update the current tenant's public profile data
// @route   PUT /api/tenant-profile
// @access  Private/Admin
const updateMyTenantProfile = asyncHandler(async (req, res) => {
    const tenant = await Tenant.findById(req.tenantId);

    if (!tenant) {
        res.status(404);
        throw new Error('Tenant profile not found.');
    }
    
    // Destructure all possible updatable fields from the request body
    const {
        name,
        publicAddress,
        publicPhone,
        publicEmail,
        city,
        country,
        description,
        logoUrl,
        isListedInDirectory
    } = req.body;

    // Update fields if they were provided in the request
    tenant.name = name ?? tenant.name;
    tenant.publicAddress = publicAddress ?? tenant.publicAddress;
    tenant.publicPhone = publicPhone ?? tenant.publicPhone;
    tenant.publicEmail = publicEmail ?? tenant.publicEmail;
    tenant.city = city ?? tenant.city;
    tenant.country = country ?? tenant.country;
    tenant.description = description ?? tenant.description;
    tenant.logoUrl = logoUrl ?? tenant.logoUrl;
    tenant.isListedInDirectory = isListedInDirectory ?? tenant.isListedInDirectory;

    const updatedTenant = await tenant.save();
    res.json(updatedTenant);
});

export { getMyTenantProfile, updateMyTenantProfile };