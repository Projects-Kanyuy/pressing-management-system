// server/schedulers/subscriptionScheduler.js
import cron from 'node-cron';
import Tenant from '../models/Tenant.js';

const checkSubscriptions = () => {
    // Runs once every day at 2 AM server time.
    cron.schedule('0 2 * * *', async () => {
        console.log(`[Scheduler] Running daily subscription checks at ${new Date().toISOString()}`);

        const now = new Date();
        try {
            const expiringTrials = await Tenant.find({
                subscriptionStatus: 'trialing',
                trialEndsAt: { $lt: now }
            });

            for (const tenant of expiringTrials) {
                console.log(`Tenant ${tenant.name} (${tenant.email}) trial has expired.`);
                tenant.subscriptionStatus = 'past_due';
                await tenant.save();
                // TODO: Send "Trial Expired" email
            }

            const expiringSubscriptions = await Tenant.find({
                subscriptionStatus: 'active',
                nextBillingAt: { $lt: now }
            });

            for (const tenant of expiringSubscriptions) {
                console.log(`Tenant ${tenant.name} (${tenant.email}) subscription is past due.`);
                tenant.subscriptionStatus = 'past_due';
                await tenant.save();
                // TODO: Send "Payment Failed" email and attempt to charge card
            }

        } catch (error) {
            console.error("[Scheduler] Error during subscription check:", error);
        }
    });
};

export default checkSubscriptions;