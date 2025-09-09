// client/src/pages/Public/PricingPage.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from '../../components/UI/Button';
import { Check } from 'lucide-react';

// --- Reusable Public Header and Footer (Ideally from shared components) ---



// --- Reusable Pricing Card Component ---
const PricingCard = ({ plan, price, frequency, features, isFeatured = false, chooseText }) => (
    <div className={`relative p-8 rounded-apple-xl border ${isFeatured ? 'border-apple-blue shadow-apple-xl' : 'border-apple-gray-200 dark:border-apple-gray-700 bg-white dark:bg-apple-gray-800/50'}`}>
        {isFeatured && (
            <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center px-4 py-1 rounded-full text-sm font-semibold text-white bg-apple-blue">
                    {chooseText}
                </span>
            </div>
        )}
        <h3 className="text-2xl font-semibold text-apple-gray-800 dark:text-white mb-2">{plan}</h3>
        <div className="flex items-baseline mb-6">
            <span className="text-5xl font-bold tracking-tight text-apple-gray-900 dark:text-white">{price}</span>
            <span className="ml-1 text-xl font-medium text-apple-gray-500 dark:text-apple-gray-400">/{frequency}</span>
        </div>
        <ul className="space-y-3 mb-8">
            {features.map((feature, index) => (
                <li key={index} className="flex items-start">
                    <Check size={16} className="text-apple-green flex-shrink-0 mr-3 mt-1" />
                    <span className="text-apple-gray-600 dark:text-apple-gray-300">{feature}</span>
                </li>
            ))}
        </ul>
        <Link to="/signup" className="w-full">
             <Button variant={isFeatured ? 'primary' : 'secondary'} size="lg" className="w-full">
                {chooseText} {plan}
            </Button>
        </Link>
    </div>
);


const PricingPage = () => {
    const { t } = useTranslation();
    // You can manage this with state if you have monthly/yearly toggles
    const [billingCycle, setBillingCycle] = useState('monthly');

    const plans = {
        monthly: [
            {
                plan: t('public.pricing.plans.basic.name'),
                price: t('public.pricing.plans.basic.price'),
                frequency: t('public.pricing.plans.basic.frequency'),
                features: t('public.pricing.plans.basic.features', { returnObjects: true }),
                isFeatured: false,
            },
            {
                plan: t('public.pricing.plans.pro.name'),
                price: t('public.pricing.plans.pro.price'),
                frequency: t('public.pricing.plans.pro.frequency'),
                features: t('public.pricing.plans.pro.features', { returnObjects: true }),
                isFeatured: true,
            },
            {
                plan: t('public.pricing.plans.enterprise.name'),
                price: t('public.pricing.plans.enterprise.price'),
                frequency: t('public.pricing.plans.enterprise.frequency'),
                features: t('public.pricing.plans.enterprise.features', { returnObjects: true }),
                isFeatured: false,
            },
        ],
        // You could define yearly plans here and toggle between them
        // yearly: [ ... ]
    };

    return (
        <div className="bg-apple-gray-50 dark:bg-apple-gray-950">
          

            <main>
                {/* --- Page Header Section --- */}
                <section className="py-20 text-center">
                    <div className="container mx-auto px-6">
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-apple-gray-900 dark:text-white mb-4">
                            {t('public.pricing.title')}
                        </h1>
                        <p className="text-lg text-apple-gray-600 dark:text-apple-gray-400 max-w-2xl mx-auto">
                            {t('public.pricing.subtitle')}
                        </p>
                    </div>
                </section>

                {/* --- Pricing Cards Section --- */}
                <section className="pb-20">
                    <div className="container mx-auto px-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
                           {plans[billingCycle].map((p, index) => (
                               <PricingCard
                                   key={index}
                                   plan={p.plan}
                                   price={p.price}
                                   frequency={p.frequency}
                                   features={p.features}
                                   isFeatured={p.isFeatured}
                                   chooseText={p.isFeatured ? t('public.pricing.mostPopular') : t('public.pricing.choose')}
                               />
                           ))}
                        </div>
                    </div>
                </section>

                {/* --- FAQ Section (Optional but good) --- */}
                <section className="py-20 bg-white dark:bg-apple-gray-900">
                    <div className="container mx-auto px-6 max-w-3xl">
                        <h2 className="text-3xl font-bold text-center mb-8">{t('public.pricing.faq.title')}</h2>
                        <div className="space-y-6">
                            <div>
                                <h4 className="font-semibold mb-1">{t('public.pricing.faq.freeTrial.question')}</h4>
                                <p className="text-sm text-apple-gray-600 dark:text-apple-gray-400">{t('public.pricing.faq.freeTrial.answer')}</p>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-1">{t('public.pricing.faq.changePlan.question')}</h4>
                                <p className="text-sm text-apple-gray-600 dark:text-apple-gray-400">{t('public.pricing.faq.changePlan.answer')}</p>
                            </div>
                             <div>
                                <h4 className="font-semibold mb-1">{t('public.pricing.faq.smsRequirements.question')}</h4>
                                <p className="text-sm text-apple-gray-600 dark:text-apple-gray-400">{t('public.pricing.faq.smsRequirements.answer')}</p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

        </div>
    );
};

export default PricingPage;