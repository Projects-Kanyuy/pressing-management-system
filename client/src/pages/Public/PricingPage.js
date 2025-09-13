// client/src/pages/Public/PricingPage.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLocalization } from '../../contexts/LocalizationContext';
import Spinner from '../../components/UI/Spinner';
import Button from '../../components/UI/Button'; // Assuming you have this component
import { Check } from 'lucide-react';

const CheckListItem = ({ children }) => (
    <li className="flex items-start">
        <Check size={20} className="text-green-500 mr-3 mt-1 flex-shrink-0" />
        <span className="text-gray-600 dark:text-apple-gray-300">{children}</span>
    </li>
);

const PricingPage = () => {
    const { t } = useTranslation();
    const { convertPrice, loading: isLocalizationLoading } = useLocalization();

    const basePrices = {
        basic: 29,
        pro: 59,
    };

    if (isLocalizationLoading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <Spinner text={t('public.pricing.localizing', 'Localizing prices...')} />
            </div>
        );
    }

    return (
        <div className="bg-gray-50 dark:bg-apple-gray-900">
            <main>
                <section className="py-12 md:py-20 text-center">
                    <div className="container mx-auto px-4">
                        <div className="max-w-3xl mx-auto">
                            <h1 className="text-4xl md:text-5xl font-bold tracking-tight dark:text-white">
                                {t('public.pricing.title', 'Fair & Simple Pricing')}
                            </h1>
                            <p className="mt-4 text-lg text-gray-600 dark:text-apple-gray-400">
                                {t('public.pricing.subtitle', 'Choose the perfect plan for your laundry business. No hidden fees, ever.')}
                            </p>
                        </div>
                    </div>
                </section>

                <section className="pb-12 md:pb-20">
                    <div className="container mx-auto px-4">
                        <div className="mt-16 grid lg:grid-cols-3 gap-8 items-stretch max-w-5xl mx-auto">
                            {/* --- Basic Plan --- */}
                            <div className="border dark:border-apple-gray-700 rounded-lg p-8 flex flex-col">
                                <h3 className="text-2xl font-semibold dark:text-white">{t('public.pricing.plans.basic.name', 'Basic')}</h3>
                                <p className="mt-4 text-4xl font-bold dark:text-white">
                                    {convertPrice(basePrices.basic)}
                                    <span className="text-lg font-medium text-gray-500 dark:text-apple-gray-400"> /{t('public.pricing.plans.basic.frequency', 'mo')}</span>
                                </p>
                                <ul className="mt-6 space-y-4">
                                    {t('public.pricing.plans.basic.features', { returnObjects: true }).map((feature, i) => <CheckListItem key={i}>{feature}</CheckListItem>)}
                                </ul>
                                <div className="flex-grow"></div>
                                <Link to="/register?plan=basic" className="mt-8 block w-full text-center bg-gray-200 dark:bg-apple-gray-800 text-gray-800 dark:text-white font-semibold py-3 rounded-lg hover:bg-gray-300 dark:hover:bg-apple-gray-700">
                                    {t('public.pricing.choose', 'Choose')} Basic
                                </Link>
                            </div>

                            {/* --- Pro Plan (Most Popular) --- */}
                            <div className="border-2 border-apple-blue rounded-lg p-8 relative flex flex-col shadow-2xl">
                                <span className="absolute top-0 -translate-y-1/2 bg-apple-blue text-white px-4 py-1 rounded-full text-sm font-semibold">{t('public.pricing.mostPopular', 'Most Popular')}</span>
                                <h3 className="text-2xl font-semibold dark:text-white">{t('public.pricing.plans.pro.name', 'Pro')}</h3>
                                <p className="mt-4 text-4xl font-bold dark:text-white">
                                    {convertPrice(basePrices.pro)}
                                    <span className="text-lg font-medium text-gray-500 dark:text-apple-gray-400"> /{t('public.pricing.plans.pro.frequency', 'mo')}</span>
                                </p>
                                <ul className="mt-6 space-y-4">
                                    {t('public.pricing.plans.pro.features', { returnObjects: true }).map((feature, i) => <CheckListItem key={i}>{feature}</CheckListItem>)}
                                </ul>
                                <div className="flex-grow"></div>
                                <Link to="/register?plan=pro" className="mt-8 block w-full text-center bg-apple-blue text-white font-semibold py-3 rounded-lg hover:bg-blue-600">
                                    {t('public.pricing.choose', 'Choose')} Pro
                                </Link>
                            </div>

                            {/* --- Enterprise Plan --- */}
                            <div className="border dark:border-apple-gray-700 rounded-lg p-8 flex flex-col">
                                <h3 className="text-2xl font-semibold dark:text-white">{t('public.pricing.plans.enterprise.name', 'Enterprise')}</h3>
                                <p className="mt-4 text-4xl font-bold dark:text-white">
                                    {t('public.pricing.plans.enterprise.price', 'Custom')}
                                    <span className="text-lg font-medium text-gray-500 dark:text-apple-gray-400"> /{t('public.pricing.plans.enterprise.frequency', 'contact')}</span>
                                </p>
                                <ul className="mt-6 space-y-4">
                                    {t('public.pricing.plans.enterprise.features', { returnObjects: true }).map((feature, i) => <CheckListItem key={i}>{feature}</CheckListItem>)}
                                </ul>
                                <div className="flex-grow"></div>
                                <Link to="/contact" className="mt-8 block w-full text-center bg-gray-200 dark:bg-apple-gray-800 text-gray-800 dark:text-white font-semibold py-3 rounded-lg hover:bg-gray-300 dark:hover:bg-apple-gray-700">
                                    {t('public.pricing.contactSales', 'Contact Sales')}
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
                
                {/* --- FAQ Section (Optional but good) --- */}
                <section className="py-20 bg-white dark:bg-apple-gray-900">
                    <div className="container mx-auto px-6 max-w-3xl">
                        <h2 className="text-3xl font-bold text-center mb-8 dark:text-white">{t('public.pricing.faq.title', 'Frequently Asked Questions')}</h2>
                        <div className="space-y-6">
                            {/* Dynamically render FAQs */}
                            {t('public.pricing.faq.items', { returnObjects: true, defaultValue: [] }).map((faq, i) => (
                                <div key={i}>
                                    <h4 className="font-semibold mb-1 dark:text-white">{faq.question}</h4>
                                    <p className="text-sm text-apple-gray-600 dark:text-apple-gray-400">{faq.answer}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default PricingPage;