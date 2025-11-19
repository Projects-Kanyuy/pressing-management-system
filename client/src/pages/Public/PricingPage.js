// client/src/pages/Public/PricingPage.js

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocalization } from '../../contexts/LocalizationContext';
import Spinner from '../../components/UI/Spinner';
import { Check, CheckCircle2 } from 'lucide-react';
import { getPublicPlansApi } from '../../services/api';
import ChoosePlanButton from '../../components/UI/ChoosePlanButton';

const CheckListItem = ({ children }) => (
  <li className="flex items-start">
    <Check size={16} className="text-apple-green flex-shrink-0 mr-3 mt-1" />
    <span className="text-apple-gray-600 dark:text-apple-gray-300 text-sm">
      {children}
    </span>
  </li>
);

const AllPlansCheckItem = ({ children }) => (
    <li className="flex items-start">
        <CheckCircle2 size={18} className="text-apple-blue flex-shrink-0 mr-3 mt-0.5" />
        <span className="text-apple-gray-700 dark:text-apple-gray-200">
            {children}
        </span>
    </li>
);

const PricingCard = ({ plan, location, isFeatured = false, t }) => {
  const findPriceString = (plan) => {
    if (!plan || !location?.currency) return '...';
    const regionalPrice = plan.prices.find((p) => p.currency === location.currency);
    const fallbackPrice = plan.prices.find((p) => p.currency === 'USD');
    const priceToShow = regionalPrice || fallbackPrice;

    if (!priceToShow || typeof priceToShow.amount !== 'number') return 'Not Available';
    
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: priceToShow.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(priceToShow.amount);
  };

  // ***** THIS IS THE FIX *****
  const planKey = plan.name.split(' ')[0].toLowerCase();

  return (
    <div className={`relative border rounded-apple-xl p-6 flex flex-col bg-white dark:bg-apple-gray-900/50 shadow-apple-sm transition-transform duration-300 ${isFeatured ? 'border-2 border-apple-blue transform lg:scale-105' : 'dark:border-apple-gray-700'}`}>
      {isFeatured && (
        <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center px-4 py-1 rounded-full text-sm font-semibold text-white bg-apple-blue shadow-md">
            {t('public.pricing.mostPopular')}
          </span>
        </div>
      )}
      <h3 className="text-xl font-semibold text-apple-gray-800 dark:text-white">
        {t(`public.pricing.plans.${planKey}.name`)}
      </h3>
      <p className="mt-4 text-4xl font-bold tracking-tight text-apple-gray-900 dark:text-white">
        {findPriceString(plan)}
        <span className="ml-1 text-base font-medium text-apple-gray-500 dark:text-apple-gray-400">
          /{t(`public.pricing.plans.${planKey}.frequency`)}
        </span>
      </p>
      <ul className="mt-6 space-y-3 mb-6">
        {t(`public.pricing.plans.${planKey}.features`, { returnObjects: true, defaultValue: [] }).map((feature, i) => (
          <CheckListItem key={i}>{feature}</CheckListItem>
        ))}
      </ul>
      <div className="flex-grow"></div>
      <div className="mt-auto pt-6">
        <ChoosePlanButton planName={plan.name} isFeatured={isFeatured} />
      </div>
    </div>
  );
};

const PricingPage = () => {
  const { t } = useTranslation();
  const { location, loading: isLocalizationLoading } = useLocalization();

  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data } = await getPublicPlansApi();
        const sortedData = data.sort((a, b) => {
            const priceA = a.prices.find(p => p.currency === 'USD')?.amount ?? Infinity;
            const priceB = b.prices.find(p => p.currency === 'USD')?.amount ?? Infinity;
            return priceA - priceB;
        });
        setPlans(sortedData);
      } catch (error) {
        console.error('Failed to fetch pricing plans:', error);
        setError('Could not load pricing plans. Please try again later.');
      } finally {
        setLoadingPlans(false);
      }
    };
    fetchPlans();
  }, []);

  if (isLocalizationLoading || loadingPlans) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spinner text={t('public.pricing.localizing', 'Loading Plans...')} />
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-xl text-apple-red py-20">{error}</div>;
  }
  
  // No need to manually find plans, we can just map the sorted array
  const orderedPlans = plans.filter(p => ['Basic', 'Starter', 'Growth', 'Pro'].includes(p.name));

  return (
    <div className="bg-apple-gray-50 dark:bg-apple-gray-950">
      <main>
        <section className="py-16 sm:py-20 text-center">
          <div className="container mx-auto px-4 sm:px-6">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-apple-gray-900 dark:text-white mb-4">
              {t('public.pricing.title')}
            </h1>
            <p className="text-lg text-apple-gray-600 dark:text-apple-gray-400 max-w-2xl mx-auto">
              {t('public.pricing.subtitle')}
            </p>
          </div>
        </section>

        <section className="pb-16 sm:pb-20">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 max-w-7xl mx-auto items-stretch">
              {orderedPlans.map((plan) => (
                <PricingCard
                  key={plan.name}
                  plan={plan}
                  location={location}
                  isFeatured={plan.name === 'Growth'}
                  t={t}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-20 bg-white dark:bg-apple-gray-900">
          <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
            <h2 className="text-3xl font-bold text-center mb-10 dark:text-white">
              {t('public.pricing.allPlans.title')}
            </h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                {t('public.pricing.allPlans.features', {returnObjects: true, defaultValue: []}).map((feature, i) => (
                    <AllPlansCheckItem key={i}>{feature}</AllPlansCheckItem>
                ))}
            </ul>
          </div>
        </section>

        <section className="py-16 sm:py-20 bg-apple-gray-50 dark:bg-apple-gray-950">
          <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
            <h2 className="text-3xl font-bold text-center mb-10 dark:text-white">{t('public.pricing.faq.title')}</h2>
            <div className="space-y-8">
              <div>
                <h4 className="font-semibold text-lg mb-2 dark:text-white">{t('public.pricing.faq.freeTrial.question')}</h4>
                <p className="text-apple-gray-600 dark:text-apple-gray-400">{t('public.pricing.faq.freeTrial.answer')}</p>
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-2 dark:text-white">{t('public.pricing.faq.changePlan.question')}</h4>
                <p className="text-apple-gray-600 dark:text-apple-gray-400">{t('public.pricing.faq.changePlan.answer')}</p>
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-2 dark:text-white">{t('public.pricing.faq.smsRequirements.question')}</h4>
                <p className="text-apple-gray-600 dark:text-apple-gray-400">{t('public.pricing.faq.smsRequirements.answer')}</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default PricingPage;