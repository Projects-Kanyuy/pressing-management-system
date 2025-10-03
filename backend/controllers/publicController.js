// server/controllers/publicController.js
import asyncHandler from '../middleware/asyncHandler.js';
import mongoose from 'mongoose';
import { customAlphabet } from 'nanoid';
import PendingUser from '../models/PendingUser.js';
import Tenant from '../models/Tenant.js';
import User from '../models/User.js';
import Settings from '../models/Settings.js';
import Price from '../models/Price.js';
import Plan from '../models/Plan.js';
import { sendOtpEmail } from '../services/notificationService.js';
import generateToken from '../utils/generateToken.js';
import { createPaymentLink } from '../services/accountPeService.js';
import { finalizeRegistrationLogic } from '../services/registrationService.js';
import crypto from 'crypto';
import DirectoryListing from '../models/DirectoryListing.js';
import { sendContactFormEmail } from '../services/notificationService.js';

// --- STEP 1: INITIATE REGISTRATION & SEND OTP ---
const initiateRegistration = asyncHandler(async (req, res) => {
    const registrationData = req.body;
    const { adminUser, companyInfo, plan: planName } = registrationData;

    // --- Validation ---
    if (!adminUser?.email || !/^\S+@\S+\.\S+$/.test(adminUser.email)) { res.status(400); throw new Error('A valid email address is required.'); }
    if (!companyInfo?.name || !adminUser?.username || !adminUser?.password) { res.status(400); throw new Error('Business name, admin username, and password are required.'); }
    
    const userExists = await User.findOne({ email: adminUser.email.toLowerCase() });
    if (userExists) { res.status(400); throw new Error('A user with this email already exists.'); }

    // --- End Validation ---

    await PendingUser.deleteOne({ email: adminUser.email.toLowerCase() });

    const nanoid = customAlphabet('1234567890', 6);
    const otp = nanoid();

    const pendingUser = new PendingUser({
        email: adminUser.email.toLowerCase(),
        otpHash: otp,
        signupData: registrationData,
    });
    
    // --- NEW LOGIC: TRIAL vs. PAID ---
    if (planName && planName.toLowerCase() === 'trial') {
        // --- TRIAL FLOW ---
        await pendingUser.save();
        
        try {
            await sendOtpEmail(adminUser.email, otp);
        } catch (emailError) {
            console.error(`FAILED to send OTP email:`, emailError);
            throw new Error("Could not send verification email.");
        }

        res.status(200).json({ 
            message: `A verification code has been sent to ${adminUser.email}.`,
            paymentRequired: false
        });
    } else {
        // --- PAID PLAN FLOW ---
        const plan = await Plan.findOne({ name: planName });
        if (!plan) throw new Error('Invalid plan selected.');

        const priceDetails = plan.prices.find(p => p.currency === 'USD');
        if (!priceDetails || priceDetails.amount <= 0) throw new Error(`Pricing for ${plan.name} not configured.`);

        const transaction_id = `PRESSFLOW-SUB-${pendingUser._id}-${crypto.randomBytes(4).toString('hex')}`;
        pendingUser.signupData.transactionId = transaction_id;
        
        await pendingUser.save();

        try {
            await sendOtpEmail(adminUser.email, otp);
        } catch (emailError) { /* Log or handle email failure */ }

        const paymentData = {
            country_code: "CM", // Should be dynamic
            name: pendingUser.signupData.adminUser.username,
            email: pendingUser.email,
            amount: priceDetails.amount,
            transaction_id,
            description: `Subscription to PressFlow ${plan.name} Plan`,
            pass_digital_charge: true,
            redirect_url: `${process.env.FRONTEND_URL}/#/verify-payment?transaction_id=${transaction_id}`
        };
  try {
            // This call is succeeding!
            const paymentResponse = await createPaymentLink(paymentData);

            // --- THIS IS THE DEBUGGING STEP ---
            // Log the entire successful response data to the terminal.
            console.log("--- SUCCESSFUL RESPONSE FROM AccountPe ---");
            console.log(JSON.stringify(paymentResponse.data, null, 2));
            console.log("-----------------------------------------");

            // Now, let's try to access the link safely
            const paymentLink = paymentResponse.data?.data?.payment_link;

            if (!paymentLink) {
                // This error is firing correctly. The log above will tell us why.
                throw new Error("Payment provider did not return a valid payment link in the expected format.");
            }
            
            res.status(200).json({
                message: "OTP sent. Redirecting to payment.",
                paymentRequired: true,
                paymentLink: paymentLink
            });
        } catch (paymentError) {
            console.error("Payment Link Creation Failed Inside Controller:", paymentError);
            throw new Error("Could not create payment link.");
        }
    }
});


// --- THIS FUNCTION IS NOW ONLY FOR TRIAL USERS ---
const finalizeRegistration = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) throw new Error('Email and OTP are required.');

    const pendingUser = await PendingUser.findOne({ email: email.toLowerCase() });
    if (!pendingUser) throw new Error('Invalid registration request.');
    
    const isMatch = await pendingUser.matchOtp(otp);
    if (!isMatch) throw new Error('Invalid verification code.');

    // Finalize the registration using the reusable service
    const { tenant, user, token } = await finalizeRegistrationLogic(pendingUser);

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
        message: `Account for '${tenant.name}' created successfully!`
    });
});

// @desc    Get a list of publicly listed businesses for the directory
// @route   GET /api/public/directory
// @access  Public
const getPublicDirectory = asyncHandler(async (req, res) => {
    const { city, search } = req.query;

    // --- THIS IS THE FIX ---
    // Create a base query that will be used for BOTH collections
    let baseQuery = {};
    if (city) {
        baseQuery.city = { $regex: city, $options: 'i' };
    }
    if (search) {
        baseQuery.name = { $regex: search, $options: 'i' };
    }

    // Create specific queries by extending the base query
    const tenantQuery = {
        ...baseQuery,
        isActive: true,
        isListedInDirectory: true,
    };

    const listingQuery = {
        ...baseQuery,
        isActive: true,
    };
    // --- END OF FIX ---


    const publicFields = 'name slug description publicAddress publicPhone publicEmail city country logoUrl';

    console.log("[Public Directory] Querying Tenants with:", tenantQuery);
    console.log("[Public Directory] Querying Manual Listings with:", listingQuery);

    // Run queries for both collections in parallel with the correct filters
    const [softwareCustomers, manualListings] = await Promise.all([
        Tenant.find(tenantQuery).select(publicFields).lean(),
        DirectoryListing.find(listingQuery).select(publicFields).lean()
    ]);
    
    // Combine, sort, and send the results
    const combinedResults = [...softwareCustomers, ...manualListings]
        .sort((a, b) => a.name.localeCompare(b.name));

    console.log(`[Public Directory] Found ${softwareCustomers.length} software customers and ${manualListings.length} manual listings. Total: ${combinedResults.length}`);

    res.json(combinedResults);
});

// @desc    Get a single business profile by slug (checking both collections)
// @route   GET /api/public/directory/:slug
// @access  Public
const getBusinessBySlug = asyncHandler(async (req, res) => {
    const slug = req.params.slug;
    const publicFields = 'name slug description publicAddress publicPhone publicEmail city country logoUrl bannerUrl ';

    let business = await Tenant.findOne({ slug, isActive: true, isListedInDirectory: true }).select(publicFields).lean();
    if (!business) {
        business = await DirectoryListing.findOne({ slug, isActive: true }).select(publicFields).lean();
    }

    if (!business) {
        res.status(404);
        throw new Error('Business profile not found.');
    }
    res.json(business);
});
// @desc    Get the public price list for a single tenant
// @route   GET /api/public/tenants/:tenantId/prices
// @access  Public
const getTenantPriceList = asyncHandler(async (req, res) => {
    const tenantId = req.params.tenantId;

    if (!mongoose.Types.ObjectId.isValid(tenantId)) {
        res.status(400);
        throw new Error('Invalid Tenant ID format');
    }

    const prices = await Price.find({ tenantId: tenantId });
    
    if (!prices) {
        return res.json([]);
    }

    res.json(prices);
});
const handleContactForm = asyncHandler(async (req, res) => {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
        res.status(400);
        throw new Error('Name, email, and message are required.');
    }

    try {
        await sendContactFormEmail({ name, from: email, message });
        res.status(200).json({ message: 'Message sent successfully.' });
    } catch (error) {
        console.error("Failed to send contact form email:", error);
        throw new Error('Could not send message at this time.');
    }
});

export {
  initiateRegistration,
  finalizeRegistration,
  getPublicDirectory,
  getBusinessBySlug,
  getTenantPriceList,
  handleContactForm
};