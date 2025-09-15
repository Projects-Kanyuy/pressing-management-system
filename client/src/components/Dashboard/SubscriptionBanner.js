// src/components/Dashboard/SubscriptionBanner.jsx

import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { AlertTriangle, CreditCard } from 'lucide-react';

/**
 * A banner that appears at the top of the tenant dashboard to warn about
 * expiring trials or past-due subscriptions.
 * @param {object} props
 * @param {function} props.onUpgradeClick - The function to call when the "Upgrade Now" button is clicked.
 */
const SubscriptionBanner = ({ onUpgradeClick }) => {
    const { user } = useAuth(); // Assuming 'user' holds the tenant profile with subscription details

    // Don't render anything if there's no user or if their subscription is active.
    if (!user || user.subscriptionStatus === 'active') {
        return null;
    }

    let message = '';
    let daysLeft = 0;

    // Logic for a user currently in their trial period
    if (user.subscriptionStatus === 'trialing' && user.trialEndsAt) {
        const endDate = new Date(user.trialEndsAt);
        const now = new Date();
        // Calculate the difference in days, rounding up.
        daysLeft = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));

        if (daysLeft > 7) {
            // If more than a week is left, don't show the banner yet.
            return null; 
        } else if (daysLeft > 0) {
            // If 7 days or less are left in the trial.
            message = `Your free trial expires in ${daysLeft} day${daysLeft > 1 ? 's' : ''}.`;
        } else {
            // If the trial has already expired.
            message = "Your free trial has expired. Please upgrade to continue.";
        }
    } 
    // Logic for a user whose payment has failed
    else if (user.subscriptionStatus === 'past_due') {
        message = "Your subscription payment is past due. Please update your plan to continue service.";
    }

    // If no message was generated, don't render the banner.
    if (!message) {
        return null;
    }

    return (
        <div className="bg-yellow-100 text-yellow-900 p-3 text-center text-sm font-medium">
            <div className="container mx-auto flex justify-center items-center gap-3 flex-wrap">
                <AlertTriangle size={18} className="flex-shrink-0" />
                <span>{message}</span>
                {/* This is now a button that triggers the onUpgradeClick function passed from the layout */}
                <button 
                    onClick={onUpgradeClick} 
                    className="ml-2 font-bold underline hover:text-yellow-900 flex items-center gap-2 bg-yellow-200 px-3 py-1 rounded-full transition-colors"
                >
                    <CreditCard size={16} />
                    <span>Upgrade Now</span>
                </button>
            </div>
        </div>
    );
};

export default SubscriptionBanner;