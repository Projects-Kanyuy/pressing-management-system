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
import DirectoryListing from '../models/DirectoryListing.js';

// --- STEP 1: INITIATE REGISTRATION & SEND OTP ---
const initiateRegistration = asyncHandler(async (req, res) => {
    const registrationData = req.body;
    const { adminUser, companyInfo } = registrationData;

    // --- Validation ---
    if (!adminUser?.email || !/^\S+@\S+\.\S+$/.test(adminUser.email)) { res.status(400); throw new Error('A valid email address is required.'); }
    if (!companyInfo?.name || !adminUser?.username || !adminUser?.password) { res.status(400); throw new Error('Business name, admin username, and password are required.'); }
    if (adminUser.password.length < 6) { res.status(400); throw new Error('Password must be at least 6 characters long.'); }

    const userExists = await User.findOne({ $or: [{ email: adminUser.email.toLowerCase() }, { username: adminUser.username.toLowerCase() }] });
    if (userExists) { res.status(400); throw new Error('A user with this email or username already exists.'); }

    const businessExists = await Tenant.findOne({ name: companyInfo.name });
    if (businessExists) { res.status(400); throw new Error('A business with this name already exists.'); }

    await PendingUser.deleteOne({ email: adminUser.email.toLowerCase() });

    const nanoid = customAlphabet('1234567890', 6);
    const otp = nanoid();

    // The pre-save hook in PendingUser model will hash the OTP
    const pendingUser = new PendingUser({
        email: adminUser.email.toLowerCase(),
        otpHash: otp, // Pass the plaintext OTP here; the model will hash it
        signupData: registrationData,
    });
    await pendingUser.save();

    try {
        await sendOtpEmail(adminUser.email, otp);
    } catch (emailError) {
        console.error(`[PublicCtrl] FAILED to send OTP email to ${adminUser.email}:`, emailError);
        res.status(500); throw new Error("Could not send verification email. Please check the address and try again.");
    }

    res.status(200).json({ message: `A verification code has been sent to ${adminUser.email}.` });
});

// --- STEP 2: VERIFY OTP & FINALIZE REGISTRATION ---

const finalizeRegistration = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) {
        res.status(400);
        throw new Error('Email and OTP are required.');
    }

    const pendingUser = await PendingUser.findOne({ email: email.toLowerCase() });

    if (!pendingUser) {
        res.status(400);
        throw new Error('Invalid registration request or it has expired. Please start over.');
    }
    
    if (new Date() > pendingUser.expireAt) {
        await pendingUser.deleteOne();
        res.status(400);
        throw new Error('Your OTP has expired. Please start the registration over.');
    }

    const isMatch = await pendingUser.matchOtp(otp);
    if (!isMatch) {
        res.status(400);
        throw new Error('Invalid verification code.');
    }

    const { adminUser, companyInfo, currencySymbol, itemTypes, serviceTypes, priceList, plan: planName } = pendingUser.signupData;

    if (!adminUser || !companyInfo) {
        throw new Error("Internal Server Error: Pending registration data is incomplete.");
    }

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        // --- Subscription Logic ---
        const chosenPlanName = planName ? (planName.charAt(0).toUpperCase() + planName.slice(1)) : 'Trial';
        const selectedPlan = await Plan.findOne({ name: chosenPlanName }).session(session);

        if (!selectedPlan) {
            throw new Error('Selected plan could not be found. Cannot create tenant.');
        }

        let trialEndDate = undefined;
        let nextBillingDate = undefined;
        let status = 'active';

        if (selectedPlan.name === 'Trial') {
            trialEndDate = new Date();
            trialEndDate.setDate(trialEndDate.getDate() + 30);
            status = 'trialing';
        } else {
            console.log(`Simulating payment for new Tenant ${companyInfo.name} for the ${selectedPlan.name} plan.`);
            nextBillingDate = new Date();
            nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
        }
        // --- End of Subscription Logic ---

        const tenant = new Tenant({ 
            name: companyInfo.name, 
            plan: selectedPlan.name,
            subscriptionStatus: status,
            trialEndsAt: trialEndDate,
            nextBillingAt: nextBillingDate
        });
        const savedTenant = await tenant.save({ session });
        const tenantId = savedTenant._id;

        const user = new User({
            tenantId,
            username: adminUser.username.toLowerCase(),
            password: adminUser.password, // Will be hashed by User model's pre-save hook
            email: adminUser.email.toLowerCase(),
            role: 'admin',
        });
        const savedUser = await user.save({ session });

        await Settings.findOneAndUpdate(
            { tenantId: tenantId },
            {
                $set: {
                    companyInfo: companyInfo,
                    defaultCurrencySymbol: currencySymbol,
                    itemTypes: itemTypes,
                    serviceTypes: serviceTypes
                }
            },
            { session, new: true, upsert: true } // Upsert ensures it gets created
        );

        if (priceList && priceList.length > 0) {
            await Price.insertMany(priceList.map(p => ({ ...p, tenantId })), { session });
        }

        await pendingUser.deleteOne({ session });
        await session.commitTransaction();

        const token = generateToken(savedUser._id, savedUser.username, savedUser.role, savedUser.tenantId);
        
        // Send back a comprehensive user object for the frontend context
        res.status(201).json({
            _id: savedUser._id, 
            username: savedUser.username, 
            role: savedUser.role,
            tenantId: savedUser.tenantId, 
            token,
            tenant: { // Include tenant subscription details in the login response
                plan: savedTenant.plan,
                subscriptionStatus: savedTenant.subscriptionStatus,
                trialEndsAt: savedTenant.trialEndsAt,
                nextBillingAt: savedTenant.nextBillingAt,
            },
            message: `Account for '${tenant.name}' created successfully!`
        });

    } catch (error) {
        await session.abortTransaction();
        console.error("Finalize Registration Transaction Failed:", error);
        if (error.code === 11000) { throw new Error('A business, user, or email with these details was registered while you were verifying.'); }
        throw new Error('A server error occurred during final account creation.');
    } finally {
        session.endSession();
    }
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
        // Return an empty array if no prices are found, don't throw an error
        return res.json([]);
    }

    res.json(prices);
});

export {
  initiateRegistration,
  finalizeRegistration,
  getPublicDirectory,
  getBusinessBySlug,
  getTenantPriceList
};