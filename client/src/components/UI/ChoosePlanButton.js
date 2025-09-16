// client/src/components/UI/ChoosePlanButton.js

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { changeSubscriptionPlanApi } from '../../services/api';
import Button from './Button';
import toast from 'react-hot-toast';

const ChoosePlanButton = ({ planName, isFeatured }) => {
    const { user, login } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);

    const handleUpgrade = async () => {
        if (!window.confirm(`Are you sure you want to upgrade to the ${planName} plan?`)) {
            return;
        }
        setIsLoading(true);
        try {
            const { data } = await changeSubscriptionPlanApi({ planName });
            // The backend returns the updated user object and a new token
            // We use the login function to update the global auth state
            login(data.user, data.token); 
            toast.success(data.message);
            navigate('/app/dashboard'); // Redirect to their dashboard after successful upgrade
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to upgrade plan. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    // --- RENDER LOGIC ---

    // 1. If a user is logged in...
    if (user) {
        // ...and they are already on this plan, show a disabled button.
        if (user.tenant?.plan === planName) {
            return (
                <Button variant="secondary" size="lg" className="w-full" disabled>
                    {t('public.pricing.currentPlan', 'Current Plan')}
                </Button>
            );
        }
        // ...otherwise, show the "Upgrade" button which triggers the API call.
        return (
            <Button 
                variant={isFeatured ? 'primary' : 'secondary'} 
                size="lg" 
                className="w-full" 
                onClick={handleUpgrade} 
                isLoading={isLoading}
            >
                {t('public.pricing.upgrade', 'Upgrade to')} {planName}
            </Button>
        );
    } 
    
    // 2. If no user is logged in (guest), show a link to the registration page.
    // This link correctly passes the chosen plan in the URL.
    return (
        <Link to={`/signup?plan=${planName.toLowerCase()}`} className="w-full">
            <Button variant={isFeatured ? 'primary' : 'secondary'} size="lg" className="w-full">
                {t('public.pricing.choose', 'Choose')} {planName}
            </Button>
        </Link>
    );
};

export default ChoosePlanButton;