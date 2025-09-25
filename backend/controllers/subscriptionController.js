// server/controllers/subscriptionController.js

import asyncHandler from '../middleware/asyncHandler.js';
import { createPaymentLink } from '../services/accountPeService.js';
import Tenant from '../models/Tenant.js';
import Plan from '../models/Plan.js';
import PendingUser from '../models/PendingUser.js';
import crypto from 'crypto';

// @desc    Initiate a PAID subscription for a NEW user AFTER OTP verification
// @route   POST /api/subscriptions/initiate
// @access  Public
const initiateSubscription = asyncHandler(async (req, res) => {
    // --- THIS IS THE UPDATE ---
    // We now require the OTP to be sent along with the email.
    const { email, otp } = req.body;

    const pendingUser = await PendingUser.findOne({ email });
    if (!pendingUser) {
        res.status(404);
        throw new Error('Registration process not found. Please start over.');
    }

    // --- NEW SECURITY CHECK ---
    // Verify the OTP one last time before creating a payment link.
    const isMatch = await pendingUser.matchOtp(otp);
    if (!isMatch) {
        res.status(400);
        throw new Error('Invalid verification code.');
    }

    // Now we can safely proceed, knowing the email is verified.
    const planName = pendingUser.signupData.plan;
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
    // --- THIS FUNCTION IS UNCHANGED ---
    const { planName } = req.body;
    const tenantId = req.tenant._id;

    const tenant = await Tenant.findById(tenantId);
    const newPlan = await Plan.findOne({ name: planName });

    if (!tenant || !newPlan) throw new Error('Tenant or Plan not found');
    if (tenant.plan === newPlan.name) throw new Error('You are already on this plan.');

    const priceDetails = newPlan.prices.find(p => p.currency === 'USD');
    if (!priceDetails) throw new Error(`Pricing for ${newPlan.name} is not configured.`);

    const transaction_id = `PRESSFLOW-UPGRADE-${tenantId}-${crypto.randomBytes(4).toString('hex')}`;
    
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
const verifyPaymentAndFinalize = asyncHandler(async (req, res) => {
    const { transaction_id } = req.body;

    if (!transaction_id) {
        res.status(400);
        throw new Error('Transaction ID is required for verification.');
    }

    // Find the pending user associated with this transaction
    const pendingUser = await PendingUser.findOne({ 'signupData.transactionId': transaction_id });
    if (!pendingUser) {
        res.status(404);
        throw new Error('Invalid transaction or registration session has expired. Please contact support.');
    }
    
    // Check the payment status with the AccountPe API
    const statusResponse = await getPaymentLinkStatus(transaction_id);
    
    // IMPORTANT: Check the exact success status from the AccountPe documentation. It might be 'success', 'SUCCESS', 'completed', etc.
    if (statusResponse.data.status !== 'success') {
        throw new Error('Payment has not been confirmed. If you have paid, please wait a moment or contact support.');
    }

    // Payment is successful, so we can now finalize the user's registration.
    const { tenant, user, token } = await finalizeRegistrationLogic(pendingUser);

    // Send back all the data the frontend needs to log the user in.
    res.status(201).json({
        _id: user._id, 
        username: user.username, 
        role: user.role,
        tenantId: user.tenantId, 
        token,
        tenant: {
            plan: tenant.plan,
            subscriptionStatus: tenant.subscriptionStatus,
            trialEndsAt: tenant.trialEndsAt,
            nextBillingAt: tenant.nextBillingAt,
        },
        message: `Payment successful! Account for '${tenant.name}' has been created.`
    });
});

export { initiateSubscription, changeSubscriptionPlan, verifyPaymentAndFinalize };