// server/middleware/usageLimitMiddleware.js
import asyncHandler from './asyncHandler.js';
import Tenant from '../models/Tenant.js';
import Plan from '../models/Plan.js';
import User from '../models/User.js';
import Order from '../models/Order.js';

// Middleware to check if a tenant can create a new staff member
export const canCreateStaff = asyncHandler(async (req, res, next) => {
    const tenantId = req.tenant._id;
    const tenant = await Tenant.findById(tenantId).populate('plan'); // Populate is not needed if plan name is stored

    if (!tenant) throw new Error('Tenant not found.');

    const plan = await Plan.findOne({ name: tenant.plan });
    if (!plan) throw new Error('Subscription plan not found.');

    const currentStaffCount = await User.countDocuments({ tenantId: tenantId });

    if (currentStaffCount >= plan.limits.maxStaff) {
        res.status(403); // 403 Forbidden
        throw new Error(`Your '${plan.name}' plan is limited to ${plan.limits.maxStaff} staff members. Please upgrade your plan to add more.`);
    }

    next(); // If limit is not reached, proceed
});

// Middleware to check if a tenant can create a new order
export const canCreateOrder = asyncHandler(async (req, res, next) => {
    const tenantId = req.tenant._id;
    const tenant = await Tenant.findById(tenantId);
    
    if (!tenant) throw new Error('Tenant not found.');
    if (tenant.subscriptionStatus !== 'active' && tenant.subscriptionStatus !== 'trialing') {
        res.status(403);
        throw new Error('Your subscription is inactive. Please upgrade to create new orders.');
    }
    
    const plan = await Plan.findOne({ name: tenant.plan });
    if (!plan) throw new Error('Subscription plan not found.');

    // Get the start of the current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const currentOrderCount = await Order.countDocuments({
        tenantId: tenantId,
        createdAt: { $gte: startOfMonth } // $gte = greater than or equal to
    });

    if (currentOrderCount >= plan.limits.maxOrdersPerMonth) {
        res.status(403);
        throw new Error(`You have reached your monthly limit of ${plan.limits.maxOrdersPerMonth} orders for the '${plan.name}' plan. Please upgrade to continue.`);
    }
    
    next(); // If limit is not reached, proceed
});