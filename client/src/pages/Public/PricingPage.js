// client/src/pages/Public/PricingPage.jsx

import React from 'react';
import { useLocalization } from '../../contexts/LocalizationContext';
import Spinner from '../../components/UI/Spinner';
import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const PricingPage = () => {
    const { convertPrice, loading: isLocalizationLoading } = useLocalization();

    const basePrices = {
        basic: 29,
        pro: 59,
    };

    const CheckListItem = ({ children }) => (
        <li className="flex items-start">
            <Check size={20} className="text-green-500 mr-3 mt-1 flex-shrink-0" />
            <span>{children}</span>
        </li>
    );

    if (isLocalizationLoading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <Spinner text="Localizing prices..." />
            </div>
        );
    }

    return (
        <div className="bg-gray-50 dark:bg-apple-gray-900 py-12 md:py-20">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-3xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Fair & Simple Pricing</h1>
                    <p className="mt-4 text-lg text-gray-600 dark:text-apple-gray-400">
                        Choose the perfect plan for your laundry business. No hidden fees, ever.
                    </p>
                </div>

                <div className="mt-16 grid lg:grid-cols-3 gap-8 items-stretch">
                    {/* --- Basic Plan --- */}
                    <div className="border dark:border-apple-gray-700 rounded-lg p-8 flex flex-col">
                        <h3 className="text-2xl font-semibold">Basic</h3>
                        <p className="mt-4 text-4xl font-bold">
                            {convertPrice(basePrices.basic)}
                            <span className="text-lg font-medium text-gray-500 dark:text-apple-gray-400"> /mo</span>
                        </p>
                        <ul className="mt-6 space-y-4 text-gray-600 dark:text-apple-gray-300">
                            <CheckListItem>Up to 250 Orders per month</CheckListItem>
                            <CheckListItem>2 Staff Accounts</CheckListItem>
                            <CheckListItem>Customer Management</CheckListItem>
                            <CheckListItem>Payment Tracking</CheckListItem>
                            <CheckListItem>Email Notifications</CheckListItem>
                        </ul>
                        <div className="flex-grow"></div> {/* Pushes button to bottom */}
                        <Link to="/register?plan=basic" className="mt-8 block w-full text-center bg-gray-200 dark:bg-apple-gray-800 text-gray-800 dark:text-white font-semibold py-3 rounded-lg hover:bg-gray-300 dark:hover:bg-apple-gray-700">
                            Choose Basic
                        </Link>
                    </div>

                    {/* --- Pro Plan (Most Popular) --- */}
                    <div className="border-2 border-apple-blue rounded-lg p-8 relative flex flex-col shadow-2xl">
                        <span className="absolute top-0 -translate-y-1/2 bg-apple-blue text-white px-4 py-1 rounded-full text-sm font-semibold">Most Popular</span>
                        <h3 className="text-2xl font-semibold">Pro</h3>
                        <p className="mt-4 text-4xl font-bold">
                            {convertPrice(basePrices.pro)}
                            <span className="text-lg font-medium text-gray-500 dark:text-apple-gray-400"> /mo</span>
                        </p>
                        <ul className="mt-6 space-y-4 text-gray-600 dark:text-apple-gray-300">
                            <CheckListItem>Unlimited Orders</CheckListItem>
                            <CheckListItem>Up to 10 Staff Accounts</CheckListItem>
                            <CheckListItem>Everything in Basic</CheckListItem>
                            <CheckListItem>SMS Notifications (Twilio)</CheckListItem>
                            <CheckListItem>Basic Sales Reports</CheckListItem>
                            <CheckListItem>Admin Bell Notifications</CheckListItem>
                        </ul>
                        <div className="flex-grow"></div>
                        <Link to="/register?plan=pro" className="mt-8 block w-full text-center bg-apple-blue text-white font-semibold py-3 rounded-lg hover:bg-blue-600">
                            Choose Pro
                        </Link>
                    </div>

                    {/* --- Enterprise Plan --- */}
                    <div className="border dark:border-apple-gray-700 rounded-lg p-8 flex flex-col">
                        <h3 className="text-2xl font-semibold">Enterprise</h3>
                        <p className="mt-4 text-4xl font-bold">
                            Custom
                            <span className="text-lg font-medium text-gray-500 dark:text-apple-gray-400"> /contact</span>
                        </p>
                        <ul className="mt-6 space-y-4 text-gray-600 dark:text-apple-gray-300">
                            <CheckListItem>Everything in Pro</CheckListItem>
                            <CheckListItem>Unlimited Staff Accounts</CheckListItem>
                            <CheckListItem>Custom Branding</CheckListItem>
                            <CheckListItem>Advanced Analytics</CheckListItem>
                            <CheckListItem>Priority Support</CheckListItem>
                            <CheckListItem>Onboarding Assistance</CheckListItem>
                        </ul>
                        <div className="flex-grow"></div>
                        <Link to="/contact" className="mt-8 block w-full text-center bg-gray-200 dark:bg-apple-gray-800 text-gray-800 dark:text-white font-semibold py-3 rounded-lg hover:bg-gray-300 dark:hover:bg-apple-gray-700">
                            Contact Sales
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PricingPage;