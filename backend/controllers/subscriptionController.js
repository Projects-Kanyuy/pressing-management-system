// server/controllers/subscriptionController.js
import asyncHandler from '../middleware/asyncHandler.js';
import { createPaymentLink } from '../services/accountPeService.js';
import Tenant from '../models/Tenant.js';
import Plan from '../models/Plan.js';
import PendingUser from '../models/PendingUser.js';
import crypto from 'crypto';

// @desc    Initiate a PAID subscription for a NEW user
// @route   POST /api/subscriptions/initiate
// @access  Public
const initiateSubscription = asyncHandler(async (req, res) => {
    const { email, planName } = req.body;

    const plan = await Plan.findOne({ name: planName });
    if (!plan || plan.name === 'Trial' || plan.name === 'Enterprise') {
        res.status(400);
        throw new Error('Invalid plan selected for payment.');
    }

    const priceDetails = plan.prices.find(p => p.currency === 'USD'); // Defaulting to USD for now
    if (!priceDetails || priceDetails.amount <= 0) {
        res.status(500);
        throw new Error(`Pricing for ${plan.name} is not configured.`);
    }

    const pendingUser = await PendingUser.findOne({ email });
    if (!pendingUser) {
        res.status(404);
        throw new Error('Registration process not found. Please start over.');
    }

    const transaction_id = `PRESSFLOW-SUB-${pendingUser._id}-${crypto.randomBytes(4).toString('hex')}`;
    pendingUser.signupData.transactionId = transaction_id;
    await pendingUser.save();

    const paymentData = {
        country_code: "US", // Should be dynamic based on user input
        name: pendingUser.signupData.adminUser.username,
        email: pendingUser.email,
        amount: priceDetails.amount,
        transaction_id,
        description: `Subscription to PressFlow ${plan.name} Plan`,
        pass_digital_charge: true,
    };
    
    const response = await createPaymentLink(paymentData);
    res.status(201).json(response.data);
});

// @desc    Generate a payment link for an EXISTING tenant to upgrade their plan
// @route   POST /api/subscriptions/change-plan
// @access  Private (Tenant)
const changeSubscriptionPlan = asyncHandler(async (req, res) => {
    const { planName } = req.body;
    const tenantId = req.tenant._id;

    const tenant = await Tenant.findById(tenantId);
    const newPlan = await Plan.findOne({ name: planName });

    if (!tenant || !newPlan) throw new Error('Tenant or Plan not found');
    if (tenant.plan === newPlan.name) throw new Error('You are already on this plan.');

    const priceDetails = newPlan.prices.find(p => p.currency === 'USD');
    if (!priceDetails) throw new Error(`Pricing for ${newPlan.name} is not configured.`);

    const transaction_id = `PRESSFLOW-UPGRADE-${tenantId}-${crypto.randomBytes(4).toString('hex')}`;
    
    // In a real app, you would save this transactionId to the tenant document
    // to link the payment to the upgrade attempt.
    // E.g., tenant.paymentIntent = { transactionId, newPlan: newPlan.name }; await tenant.save();
    
    const paymentData = {
        country_code: tenant.country || "US",
        name: tenant.name,
        email: tenant.email,
        amount: priceDetails.amount,
        transaction_id,
        description: `Upgrade to PressFlow ${newPlan.name} Plan`,
        pass_digital_charge: true,
    };

    const response = await createPaymentLink(paymentData);
    res.status(201).json(response.data);
});

export { initiateSubscription, changeSubscriptionPlan };