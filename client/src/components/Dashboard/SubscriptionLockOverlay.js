// src/components/Dashboard/SubscriptionLockOverlay.jsx

import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Lock } from 'lucide-react';
import Button from '../UI/Button';

/**
 * A full-screen overlay that blocks app usage for users with inactive
 * subscriptions and prompts them to upgrade.
 * @param {object} props
 * @param {function} props.onUpgradeClick - The function to call when the "View Pricing Plans" button is clicked.
 */
const SubscriptionLockOverlay = ({ onUpgradeClick }) => {
    const { user } = useAuth();

    // Determine if the user's account should be locked.
    // It's locked if they are not active and not in a trial.
    const isLocked = user && !['active', 'trialing'].includes(user.subscriptionStatus);

    // If the account is not locked, render nothing.
    if (!isLocked) {
        return null;
    }

    // Determine the message based on the specific inactive status.
    let title = "Your Account is Inactive";
    let message = "Please upgrade your subscription to regain access to all features.";
    
    if (user.subscriptionStatus === 'past_due') {
        title = "Payment Required";
        message = "Your subscription is past due. Please update your plan to restore access.";
    } else if (user.subscriptionStatus === 'canceled') {
        title = "Subscription Canceled";
        message = "Your subscription has been canceled. Please choose a new plan to reactivate your account.";
    }

    return (
        // The overlay itself: fixed position, covers the screen, with a backdrop blur.
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-apple-gray-800 p-8 rounded-xl shadow-2xl text-center max-w-md w-full">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                    <Lock className="h-6 w-6 text-red-600" />
                </div>
                <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
                <p className="mt-2 text-gray-600 dark:text-apple-gray-400">
                    {message}
                </p>
                <div className="mt-6">
                    {/* This button now opens the in-app upgrade modal via the onUpgradeClick prop */}
                    <Button 
                        variant="primary" 
                        size="lg" 
                        onClick={onUpgradeClick}
                    >
                        View Pricing Plans
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionLockOverlay;