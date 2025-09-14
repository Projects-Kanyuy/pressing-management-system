// client/src/components/Pricing/ChoosePlanButton.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { changeSubscriptionPlanApi } from '../../services/api'; // We'll create this
import Button from '../UI/Button';
import toast from 'react-hot-toast';

const ChoosePlanButton = ({ planName, planId, isFeatured }) => {
    const { user, login } = useAuth(); // Assuming your unified context has login to update user
    const navigate = useNavigate();

    const handleUpgrade = async () => {
        if (!window.confirm(`Are you sure you want to upgrade to the ${planName} plan?`)) {
            return;
        }
        try {
            const { data } = await changeSubscriptionPlanApi({ planId });
            // Update the user in the context with the new subscription details
            login(data.user, localStorage.getItem('token')); // Re-use login to set new user state
            toast.success(data.message);
            navigate('/dashboard'); // Redirect to their dashboard
        } catch (error) {
            toast.error("Failed to upgrade plan. Please try again.");
        }
    };

    if (user) {
        // User is logged in
        if (user.plan === planName) {
            return <Button variant="secondary" disabled>Current Plan</Button>;
        }
        return <Button variant={isFeatured ? 'primary' : 'secondary'} onClick={handleUpgrade}>Upgrade to {planName}</Button>;
    } else {
        // User is a guest
        return (
            <Link to={`/register?plan=${planName.toLowerCase()}`}>
                <Button variant={isFeatured ? 'primary' : 'secondary'}>Choose {planName}</Button>
            </Link>
        );
    }
};

export default ChoosePlanButton;