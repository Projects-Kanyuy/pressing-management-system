// backend/services/registrationService.js
import mongoose from 'mongoose';
import Tenant from '../models/Tenant.js';
import User from '../models/User.js';
import Plan from '../models/Plan.js';
import Settings from '../models/Settings.js';
import Price from '../models/Price.js';
import generateToken from '../utils/generateToken.js';

export const finalizeRegistrationLogic = async (pendingUser) => {
    const { adminUser, companyInfo, currencySymbol, itemTypes, serviceTypes, priceList, plan: planName } = pendingUser.signupData;

    if (!adminUser || !companyInfo) {
        throw new Error("Pending registration data is incomplete.");
    }

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const chosenPlanName = planName ? (planName.charAt(0).toUpperCase() + planName.slice(1)) : 'Trial';
        const selectedPlan = await Plan.findOne({ name: chosenPlanName }).session(session);
        if (!selectedPlan) throw new Error(`Plan '${chosenPlanName}' not found.`);

        let trialEndDate, nextBillingDate, status = 'active';
        if (selectedPlan.name === 'Trial') {
            trialEndDate = new Date();
            trialEndDate.setDate(trialEndDate.getDate() + 30);
            status = 'trialing';
        } else {
            nextBillingDate = new Date();
            nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
        }

        const tenant = new Tenant({ 
            name: companyInfo.name, 
            plan: selectedPlan.name,
            subscriptionStatus: status,
            trialEndsAt: trialEndDate,
            nextBillingAt: nextBillingDate,
        });
        const savedTenant = await tenant.save({ session });
        const tenantId = savedTenant._id;

        const user = new User({
            tenantId,
            username: adminUser.username.toLowerCase(),
            password: adminUser.password,
            email: adminUser.email.toLowerCase(),
            role: 'admin',
        });
        const savedUser = await user.save({ session });

        await Settings.findOneAndUpdate(
            { tenantId },
            { $set: { companyInfo, defaultCurrencySymbol: currencySymbol, itemTypes, serviceTypes } },
            { session, new: true, upsert: true }
        );

        if (priceList?.length > 0) {
            await Price.insertMany(priceList.map(p => ({ ...p, tenantId })), { session });
        }

        await pendingUser.deleteOne({ session });
        await session.commitTransaction();
        
        // TODO: In a real app, send a "Welcome" email here.

        return { tenant: savedTenant, user: savedUser };
    } catch (error) {
        await session.abortTransaction();
        console.error("Transaction failed in registrationService:", error);
        throw error;
    } finally {
        session.endSession();
    }
};