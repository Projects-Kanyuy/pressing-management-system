// client/src/pages/Public/PricingPage.js

import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocalization } from '../../contexts/LocalizationContext'
import Spinner from '../../components/UI/Spinner'
import { Check, Sparkles } from 'lucide-react'
import { getPublicPlansApi } from '../../services/api'
import ChoosePlanButton from '../../components/UI/ChoosePlanButton'

const CheckListItem = ({ children }) => (
  <li className="flex items-start py-1.5">
    <Check size={18} className="text-apple-green dark:text-green-400 flex-shrink-0 mr-3 mt-0.5" strokeWidth={2.5} />
    <span className="text-sm sm:text-base text-apple-gray-700 dark:text-apple-gray-200 leading-relaxed">
      {children}
    </span>
  </li>
)

const PricingPage = () => {
  const { t } = useTranslation()
  const { location, loading: isLocalizationLoading } = useLocalization()

  const [plans, setPlans] = useState([])
  const [loadingPlans, setLoadingPlans] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data } = await getPublicPlansApi()
        setPlans(data)
      } catch (error) {
        console.error('Failed to fetch pricing plans:', error)
        setError('Could not load pricing plans. Please try again later.')
      } finally {
        setLoadingPlans(false)
      }
    }
    fetchPlans()
  }, [])

  const findPriceString = (plan) => {
    if (!plan) return '...'

    // Always use USD for pricing display
    const usdPrice = plan.prices.find((p) => p.currency === 'USD')

    if (!usdPrice || typeof usdPrice.amount !== 'number')
      return 'Not Available'

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(usdPrice.amount)
  }

  if (isLocalizationLoading || loadingPlans) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spinner text={t('public.pricing.localizing', 'Loading Plans...')} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <p className="text-xl text-apple-red dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-apple-blue text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const basicPlan = plans.find((p) => p.name === 'Basic')
  const starterPlan = plans.find((p) => p.name === 'Starter')
  const growthPlan = plans.find((p) => p.name === 'Growth')
  const proPlan = plans.find((p) => p.name === 'Pro')

  // Plan descriptions from your requirements
  const planDescriptions = {
    Basic: 'A simple way to get started with PressMark.',
    Starter: 'Perfect for small laundry shops ready to attract more customers and manage their operations digitally.',
    Growth: 'For growing laundries that want more customers, automation, and control.',
    Pro: 'Built for professional laundry businesses that want total control and market dominance.'
  }

  return (
    <div className="bg-apple-gray-50 dark:bg-apple-gray-950 min-h-screen">
      <main>
        {/* Hero Section */}
        <section className="pt-16 pb-12 sm:pt-20 sm:pb-16 md:pt-24 md:pb-20 text-center">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-apple-gray-900 dark:text-white mb-4 sm:mb-6 leading-tight">
              {t('public.pricing.title')}
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-apple-gray-600 dark:text-apple-gray-400 max-w-3xl mx-auto px-4">
              {t('public.pricing.subtitle')}
            </p>
          </div>
        </section>

        {/* Pricing Cards Section */}
        <section className="pb-12 sm:pb-16 md:pb-20 lg:pb-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 max-w-7xl mx-auto items-stretch">
              {/* --- Basic Plan --- */}
              {basicPlan && (
                <div className="group relative border-2 border-apple-gray-200 dark:border-apple-gray-700 rounded-2xl p-6 sm:p-8 flex flex-col bg-white dark:bg-apple-gray-800/50 hover:border-apple-gray-300 dark:hover:border-apple-gray-600 transition-all duration-300 hover:shadow-xl">
                  <div className="flex-grow">
                    <h3 className="text-xl sm:text-2xl font-bold text-apple-gray-900 dark:text-white mb-2">
                    {t('public.pricing.plans.basic.name')}
                  </h3>
                    <div className="mt-4 mb-3">
                      <p className="text-2xl sm:text-3xl font-bold tracking-tight text-apple-gray-900 dark:text-white">
                    {findPriceString(basicPlan)}
                        <span className="ml-1.5 text-sm sm:text-base font-medium text-apple-gray-500 dark:text-apple-gray-400">
                      /{t('public.pricing.plans.basic.frequency')}
                    </span>
                  </p>
                    </div>
                    <p className="text-sm sm:text-base text-apple-gray-600 dark:text-apple-gray-400 mb-6 leading-relaxed">
                      {planDescriptions.Basic}
                    </p>
                    <ul className="space-y-2 sm:space-y-3 mb-8">
                    {t('public.pricing.plans.basic.features', {
                      returnObjects: true,
                    }).map((feature, i) => (
                      <CheckListItem key={i}>{feature}</CheckListItem>
                    ))}
                  </ul>
                  </div>
                  <div className="mt-auto pt-4 border-t border-apple-gray-100 dark:border-apple-gray-700">
                    <ChoosePlanButton
                      planName={basicPlan.name}
                      isFeatured={false}
                    />
                  </div>
                </div>
              )}

              {/* --- Starter Plan --- */}
              {starterPlan && (
                <div className="group relative border-2 border-apple-gray-200 dark:border-apple-gray-700 rounded-2xl p-6 sm:p-8 flex flex-col bg-white dark:bg-apple-gray-800/50 hover:border-apple-blue/50 dark:hover:border-apple-blue/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                  <div className="flex-grow">
                    <h3 className="text-xl sm:text-2xl font-bold text-apple-gray-900 dark:text-white mb-2">
                      {t('public.pricing.plans.starter.name')}
                    </h3>
                    <div className="mt-4 mb-3">
                      <p className="text-2xl sm:text-3xl font-bold tracking-tight text-apple-gray-900 dark:text-white">
                        {findPriceString(starterPlan)}
                        <span className="ml-1.5 text-sm sm:text-base font-medium text-apple-gray-500 dark:text-apple-gray-400">
                          /{t('public.pricing.plans.starter.frequency')}
                        </span>
                      </p>
                    </div>
                    <p className="text-sm sm:text-base text-apple-gray-600 dark:text-apple-gray-400 mb-6 leading-relaxed">
                      {planDescriptions.Starter}
                    </p>
                    <ul className="space-y-2 sm:space-y-3 mb-8">
                      {t('public.pricing.plans.starter.features', {
                        returnObjects: true,
                      }).map((feature, i) => (
                        <CheckListItem key={i}>{feature}</CheckListItem>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-auto pt-4 border-t border-apple-gray-100 dark:border-apple-gray-700">
                    <ChoosePlanButton
                      planName={starterPlan.name}
                      isFeatured={false}
                    />
                  </div>
                </div>
              )}

              {/* --- Growth Plan (Most Popular) --- */}
              {growthPlan && (
                <div className="group relative rounded-2xl p-6 sm:p-8 flex flex-col bg-gradient-to-br from-apple-blue/5 to-blue-50 dark:from-apple-blue/10 dark:to-apple-gray-800/80 border-2 border-apple-blue shadow-2xl hover:shadow-apple-xl transition-all duration-300 hover:-translate-y-2 lg:scale-[1.05] lg:z-10">
                  <div className="absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2 z-10">
                    <span className="inline-flex items-center px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-apple-blue to-blue-600 shadow-lg whitespace-nowrap">
                      <Sparkles size={12} className="sm:w-3.5 sm:h-3.5 mr-1 sm:mr-1.5" />
                      {t('public.pricing.mostPopular')}
                    </span>
                  </div>
                  <div className="flex-grow pt-3 sm:pt-2">
                    <h3 className="text-xl sm:text-2xl font-bold text-apple-gray-900 dark:text-white mb-2">
                      {t('public.pricing.plans.growth.name')}
                  </h3>
                    <div className="mt-4 mb-3">
                      <p className="text-2xl sm:text-3xl font-bold tracking-tight text-apple-blue dark:text-blue-400">
                        {findPriceString(growthPlan)}
                        <span className="ml-1.5 text-sm sm:text-base font-medium text-apple-gray-500 dark:text-apple-gray-400">
                          /{t('public.pricing.plans.growth.frequency')}
                    </span>
                  </p>
                    </div>
                    <p className="text-sm sm:text-base text-apple-gray-700 dark:text-apple-gray-300 mb-6 leading-relaxed font-medium">
                      {planDescriptions.Growth}
                    </p>
                    <ul className="space-y-2 sm:space-y-3 mb-8">
                      {t('public.pricing.plans.growth.features', {
                      returnObjects: true,
                    }).map((feature, i) => (
                      <CheckListItem key={i}>{feature}</CheckListItem>
                    ))}
                  </ul>
                  </div>
                  <div className="mt-auto pt-4 border-t border-apple-blue/20 dark:border-apple-blue/30">
                    <ChoosePlanButton
                      planName={growthPlan.name}
                      isFeatured={true}
                    />
                  </div>
                </div>
              )}

              {/* --- Pro Plan --- */}
              {proPlan && (
                <div className="group relative border-2 border-apple-gray-200 dark:border-apple-gray-700 rounded-2xl p-6 sm:p-8 flex flex-col bg-white dark:bg-apple-gray-800/50 hover:border-apple-gray-300 dark:hover:border-apple-gray-600 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                  <div className="flex-grow">
                    <h3 className="text-xl sm:text-2xl font-bold text-apple-gray-900 dark:text-white mb-2">
                      {t('public.pricing.plans.pro.name')}
                    </h3>
                    <div className="mt-4 mb-3">
                      <p className="text-2xl sm:text-3xl font-bold tracking-tight text-apple-gray-900 dark:text-white">
                        {findPriceString(proPlan)}
                        <span className="ml-1.5 text-sm sm:text-base font-medium text-apple-gray-500 dark:text-apple-gray-400">
                          /{t('public.pricing.plans.pro.frequency')}
                        </span>
                      </p>
                    </div>
                    <p className="text-sm sm:text-base text-apple-gray-600 dark:text-apple-gray-400 mb-6 leading-relaxed">
                      {planDescriptions.Pro}
                    </p>
                    <ul className="space-y-2 sm:space-y-3 mb-8">
                      {t('public.pricing.plans.pro.features', {
                        returnObjects: true,
                      }).map((feature, i) => (
                        <CheckListItem key={i}>{feature}</CheckListItem>
                      ))}
                  </ul>
                  </div>
                  <div className="mt-auto pt-4 border-t border-apple-gray-100 dark:border-apple-gray-700">
                    <ChoosePlanButton
                      planName={proPlan.name}
                      isFeatured={false}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* --- All Plans Include Section --- */}
            <div className="mt-16 sm:mt-20 md:mt-24 max-w-5xl mx-auto">
              <div className="text-center mb-8 sm:mb-12">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-apple-gray-900 dark:text-white mb-3 sm:mb-4">
                  {t('public.pricing.allPlansInclude.title')}
                </h2>
              </div>
              <div className="bg-white dark:bg-apple-gray-800/50 rounded-2xl p-6 sm:p-8 md:p-10 shadow-lg border border-apple-gray-100 dark:border-apple-gray-700">
                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {t('public.pricing.allPlansInclude.features', {
                    returnObjects: true,
                  }).map((feature, i) => (
                    <CheckListItem key={i}>{feature}</CheckListItem>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-12 sm:py-16 md:py-20 bg-white dark:bg-apple-gray-900 border-t border-apple-gray-200 dark:border-apple-gray-800">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12 text-apple-gray-900 dark:text-white">
              {t('public.pricing.faq.title')}
            </h2>
            <div className="space-y-6 sm:space-y-8">
              <div className="bg-apple-gray-50 dark:bg-apple-gray-800/50 rounded-xl p-6 sm:p-8 border border-apple-gray-100 dark:border-apple-gray-700">
                <h4 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-apple-gray-900 dark:text-white">
                  {t('public.pricing.faq.freeTrial.question')}
                </h4>
                <p className="text-sm sm:text-base text-apple-gray-600 dark:text-apple-gray-400 leading-relaxed">
                  {t('public.pricing.faq.freeTrial.answer')}
                </p>
                            </div>
              <div className="bg-apple-gray-50 dark:bg-apple-gray-800/50 rounded-xl p-6 sm:p-8 border border-apple-gray-100 dark:border-apple-gray-700">
                <h4 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-apple-gray-900 dark:text-white">
                  {t('public.pricing.faq.changePlan.question')}
                </h4>
                <p className="text-sm sm:text-base text-apple-gray-600 dark:text-apple-gray-400 leading-relaxed">
                  {t('public.pricing.faq.changePlan.answer')}
                </p>
                            </div>
              <div className="bg-apple-gray-50 dark:bg-apple-gray-800/50 rounded-xl p-6 sm:p-8 border border-apple-gray-100 dark:border-apple-gray-700">
                <h4 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-apple-gray-900 dark:text-white">
                  {t('public.pricing.faq.smsRequirements.question')}
                </h4>
                <p className="text-sm sm:text-base text-apple-gray-600 dark:text-apple-gray-400 leading-relaxed">
                  {t('public.pricing.faq.smsRequirements.answer')}
                </p>
                            </div>
                        </div>
                    </div>
                </section>
      </main>
    </div>
  )
}

export default PricingPage
