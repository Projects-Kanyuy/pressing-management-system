// client/src/components/Dashboard/UpgradeModal.js

import React, { useState, useEffect } from 'react';
import Modal from '../UI/Modal';
import Button from '../UI/Button';
import Spinner from '../UI/Spinner';
import { getPublicPlansApi, changeSubscriptionPlanApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useLocalization } from '../../contexts/LocalizationContext';
import { Check, Star } from 'lucide-react';
import toast from 'react-hot-toast';

// --- Reusable PlanCard component specific to this modal ---
const PlanCard = ({ plan, onSelect, currentPlan, isLoading }) => {
    const { location } = useLocalization();

    // --- THIS IS THE FIX ---
    // Destructure `isFeatured` from the plan object.
    const { isFeatured } = plan;

    const findPrice = () => {
        if (!plan || !location?.currency) return '...';
        const regionalPrice = plan.prices.find(p => p.currency === location.currency);
        const fallbackPrice = plan.prices.find(p => p.currency === 'USD');
        const priceToShow = regionalPrice || fallbackPrice;
        if (!priceToShow) return 'N/A';
        return new Intl.NumberFormat(undefined, { style: 'currency', currency: priceToShow.currency }).format(priceToShow.amount);
    };

    const isCurrent = plan.name === currentPlan;

    return (
        <div className={`border rounded-lg p-6 flex flex-col ${isFeatured ? 'border-apple-blue shadow-lg' : 'dark:border-apple-gray-700'}`}>
            {isFeatured && <div className="text-sm font-semibold text-apple-blue mb-2 flex items-center gap-1"><Star size={14}/> Most Popular</div>}
            <h3 className="text-2xl font-semibold dark:text-white">{plan.name}</h3>
            <p className="mt-2 text-3xl font-bold dark:text-white">
                {findPrice()}
                <span className="text-base font-medium text-gray-500 dark:text-apple-gray-400"> /mo</span>
            </p>
            <ul className="mt-6 space-y-3 text-sm text-gray-600 dark:text-apple-gray-300">
                {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start"><Check size={16} className="text-apple-green mr-2 mt-0.5" /><span>{feature}</span></li>
                ))}
            </ul>
            <div className="flex-grow"></div>
            <Button
                className="w-full mt-8"
                variant={isCurrent ? 'secondary' : (isFeatured ? 'primary' : 'secondary')}
                onClick={() => onSelect(plan)}
                disabled={isCurrent || isLoading}
            >
                {isCurrent ? 'Current Plan' : `Choose ${plan.name}`}
            </Button>
        </div>
    );
};

const UpgradeModal = ({ isOpen, onClose }) => {
    const { user, login } = useAuth();
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isUpgrading, setIsUpgrading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const fetchPlans = async () => {
                setLoading(true);
                try {
                    const { data } = await getPublicPlansApi();
                    setPlans(data.filter(p => p.name !== 'Trial' && p.name !== 'Enterprise'));
                } catch (error) {
                    console.error("Failed to fetch plans for upgrade:", error);
                    toast.error("Could not load subscription plans.");
                } finally {
                    setLoading(false);
                }
            };
            fetchPlans();
        }
    }, [isOpen]);

    const handleSelectPlan = async (plan) => {
        if (!window.confirm(`Are you sure you want to upgrade to the ${plan.name} plan?`)) return;
        
        setIsUpgrading(true);
        try {
            const { data } = await changeSubscriptionPlanApi({ planName: plan.name });
            login(data.user, localStorage.getItem('token'));
            toast.success(data.message);
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to upgrade plan.");
        } finally {
            setIsUpgrading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Upgrade Your Subscription" size="3xl">
            <div className="p-6">
                <p className="text-center text-apple-gray-500 dark:text-apple-gray-400 mb-8">
                    Your current trial has expired or is ending soon. Choose a plan to continue enjoying PressFlow.
                </p>
                {loading ? <div className="flex justify-center"><Spinner /></div> : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {plans.map(plan => (
                            <PlanCard 
                                key={plan._id} 
                                plan={plan} 
                                onSelect={handleSelectPlan}
                                currentPlan={user?.plan}
                                isLoading={isUpgrading}
                            />
                        ))}
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default UpgradeModal;