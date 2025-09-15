// client/src/components/Dashboard/SubscriptionBanner.jsx

import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { AlertTriangle, CreditCard } from 'lucide-react';

const SubscriptionBanner = () => {
    const { user } = useAuth();

    // --- THIS IS THE FIX ---
    // The subscription information is now nested inside the 'tenant' property of the user object.
    const subscriptionInfo = user?.tenant;

    if (!subscriptionInfo || subscriptionInfo.subscriptionStatus === 'active') {
        return null;
    }

    let message = '';
    let daysLeft = 0;
    const isWarning = true;

    if (subscriptionInfo.subscriptionStatus === 'trialing' && subscriptionInfo.trialEndsAt) {
        const endDate = new Date(subscriptionInfo.trialEndsAt);
        const now = new Date();
        daysLeft = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));

        if (daysLeft <= 7) { // Only show banner if 7 days or less are left
            if (daysLeft > 0) {
                message = `Your free trial expires in ${daysLeft} day${daysLeft > 1 ? 's' : ''}.`;
            } else {
                message = "Your free trial has expired. Please upgrade to continue.";
            }
        }
    } else if (subscriptionInfo.subscriptionStatus === 'past_due') {
        message = "Your subscription payment is past due. Please update your payment method to continue service.";
    }

    if (!message) return null;

    return (
        <div className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300 p-3 text-center text-sm font-medium">
            <div className="container mx-auto flex justify-center items-center gap-3 flex-wrap">
                <AlertTriangle size={18} className="flex-shrink-0" />
                <span>{message}</span>
                <Link to="/pricing" className="ml-2 font-bold underline hover:text-yellow-900 dark:hover:text-yellow-200 flex items-center gap-2 bg-yellow-200/50 dark:bg-yellow-500/20 px-3 py-1 rounded-full">
                    <CreditCard size={16} /> Upgrade Now
                </Link>
            </div>
        </div>
    );
};

export default SubscriptionBanner;