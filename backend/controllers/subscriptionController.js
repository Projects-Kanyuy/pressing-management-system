// server/controllers/subscriptionController.js

import asyncHandler from '../middleware/asyncHandler.js';
import Tenant from '../models/Tenant.js';
import Plan from '../models/Plan.js';

// @desc    Change or upgrade a tenant's subscription plan
// @route   POST /api/subscriptions/change-plan
// @access  Private (Tenant)
const changeSubscriptionPlan = asyncHandler(async (req, res) => {
    const { planId } = req.body; // e.g., 'pro', 'basic'
    const tenantId = req.tenant._id; // Comes from the 'protect' middleware

    const tenant = await Tenant.findById(tenantId);
    const newPlan = await Plan.findOne({ name: planId }); // Assuming plan name is the ID for simplicity

    if (!tenant || !newPlan) {
        res.status(404);
        throw new Error('Tenant or Plan not found');
    }
    
    // --- PAYMENT SIMULATION ---
    // In a real app, you would process a payment via Stripe/PayPal here.
    // If payment is successful, you proceed.
    console.log(`Simulating payment for Tenant ${tenant.name} for the ${newPlan.name} plan.`);
    // --- END OF SIMULATION ---

    // Calculate the next billing date (one month from now)
    const nextBillingDate = new Date();
    nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

    // Update the tenant's subscription details
    tenant.plan = newPlan.name;
    tenant.subscriptionStatus = 'active';
    tenant.trialEndsAt = undefined; // Remove trial end date
    tenant.nextBillingAt = nextBillingDate;
    
    const updatedTenant = await tenant.save();

    res.json({
        message: `Successfully subscribed to the ${newPlan.name} plan!`,
        user: { // Send back updated user info for the frontend context
            _id: updatedTenant._id,
            name: updatedTenant.name,
            email: updatedTenant.email,
            plan: updatedTenant.plan,
            subscriptionStatus: updatedTenant.subscriptionStatus,
            trialEndsAt: updatedTenant.trialEndsAt,
            nextBillingAt: updatedTenant.nextBillingAt,
        }
    });
});

export { changeSubscriptionPlan };