// client/src/components/Dashboard/SubscriptionBanner.jsx
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { AlertTriangle, CreditCard } from 'lucide-react';

const SubscriptionBanner = () => {
    const { user } = useAuth();

    if (!user || user.subscriptionStatus === 'active') {
        return null;
    }

    let message = '';
    let daysLeft = 0;
    const isWarning = true; // All messages will be warnings

    if (user.subscriptionStatus === 'trialing' && user.trialEndsAt) {
        const endDate = new Date(user.trialEndsAt);
        const now = new Date();
        daysLeft = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));

        if (daysLeft > 7) {
            return null; // Don't show the banner until a week is left
        } else if (daysLeft > 0) {
            message = `Your free trial expires in ${daysLeft} day${daysLeft > 1 ? 's' : ''}.`;
        } else {
            message = "Your free trial has expired. Please upgrade to continue.";
        }
    } else if (user.subscriptionStatus === 'past_due') {
        message = "Your subscription payment is past due. Please update your payment method to continue service.";
    }

    if (!message) return null;

    return (
        <div className="bg-yellow-100 text-yellow-800 p-3 text-center text-sm font-medium">
            <div className="container mx-auto flex justify-center items-center gap-3 flex-wrap">
                <AlertTriangle size={18} className="flex-shrink-0" />
                <span>{message}</span>
                <Link to="/pricing" className="ml-2 font-bold underline hover:text-yellow-900 flex items-center gap-2 bg-yellow-200 px-3 py-1 rounded-full">
                    <CreditCard size={16} /> Upgrade Now
                </Link>
            </div>
        </div>
    );
};

export default SubscriptionBanner;