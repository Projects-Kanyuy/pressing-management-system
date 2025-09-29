// client/src/pages/Public/PricingPage.js

import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useLocalization } from '../../contexts/LocalizationContext'
import Spinner from '../../components/UI/Spinner'
import Button from '../../components/UI/Button'
import { Check } from 'lucide-react'
import { getPublicPlansApi } from '../../services/api'
import ChoosePlanButton from '../../components/UI/ChoosePlanButton' // <-- 1. IMPORT

const CheckListItem = ({ children }) => (
  <li className="flex items-start">
    <Check size={16} className="text-apple-green flex-shrink-0 mr-3 mt-1" />
    <span className="text-apple-gray-600 dark:text-apple-gray-300">
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
    if (!plan || !location?.currency) return '...'

    const regionalPrice = plan.prices.find(
      (p) => p.currency === location.currency
    )
    const fallbackPrice = plan.prices.find((p) => p.currency === 'USD')

    const priceToShow = regionalPrice || fallbackPrice

    if (!priceToShow || typeof priceToShow.amount !== 'number')
      return 'Not Available'

    if (['XAF', 'XOF'].includes(priceToShow.currency)) {
      return `${priceToShow.amount.toLocaleString('fr-FR')} ${
        priceToShow.currency
      }`
    }
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: priceToShow.currency,
    }).format(priceToShow.amount)
  }

  if (isLocalizationLoading || loadingPlans) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spinner text={t('public.pricing.localizing', 'Loading Plans...')} />
      </div>
    )
  }

  if (error) {
    return <div className="text-center text-xl text-apple-red py-20">{error}</div>
  }

  const basicPlan = plans.find((p) => p.name === 'Basic')
  const proPlan = plans.find((p) => p.name === 'Pro')
  const enterprisePlan = plans.find((p) => p.name === 'Enterprise')

  return (
    <div className="bg-apple-gray-50 dark:bg-apple-gray-950">
      <main>
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

        <section className="pb-20">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
              {/* --- Basic Plan --- */}
              {basicPlan && (
                <div className="border dark:border-apple-gray-700 rounded-apple-xl p-8 flex flex-col bg-white dark:bg-apple-gray-800/50">
                  <h3 className="text-2xl font-semibold">
                    {t('public.pricing.plans.basic.name')}
                  </h3>
                  <p className="mt-4 text-5xl font-bold tracking-tight">
                    {findPriceString(basicPlan)}
                    <span className="ml-1 text-xl font-medium text-apple-gray-500 dark:text-apple-gray-400">
                      /{t('public.pricing.plans.basic.frequency')}
                    </span>
                  </p>
                  <ul className="mt-6 space-y-3 mb-8">
                    {t('public.pricing.plans.basic.features', {
                      returnObjects: true,
                    }).map((feature, i) => (
                      <CheckListItem key={i}>{feature}</CheckListItem>
                    ))}
                  </ul>
                  <div className="flex-grow"></div>
                  {/* --- 2. REPLACE THE LINK WITH THE SMART BUTTON --- */}
                  <div className="mt-auto">
                    <ChoosePlanButton
                      planName={basicPlan.name}
                      isFeatured={false}
                    />
                  </div>
                </div>
              )}

              {/* --- Pro Plan (Most Popular) --- */}
              {proPlan && (
                <div className="relative p-8 rounded-apple-xl border-2 border-apple-blue shadow-apple-xl flex flex-col bg-white dark:bg-apple-gray-800/50">
                  <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center px-4 py-1 rounded-full text-sm font-semibold text-white bg-apple-blue">
                      {t('public.pricing.mostPopular')}
                    </span>
                  </div>
                  <h3 className="text-2xl font-semibold">
                    {t('public.pricing.plans.pro.name')}
                  </h3>
                  <p className="mt-4 text-5xl font-bold tracking-tight">
                    {findPriceString(proPlan)}
                    <span className="ml-1 text-xl font-medium text-apple-gray-500 dark:text-apple-gray-400">
                      /{t('public.pricing.plans.pro.frequency')}
                    </span>
                  </p>
                  <ul className="mt-6 space-y-3 mb-8">
                    {t('public.pricing.plans.pro.features', {
                      returnObjects: true,
                    }).map((feature, i) => (
                      <CheckListItem key={i}>{feature}</CheckListItem>
                    ))}
                  </ul>
                  <div className="flex-grow"></div>
                  {/* --- 2. REPLACE THE LINK WITH THE SMART BUTTON --- */}
                  <div className="mt-auto">
                    <ChoosePlanButton
                      planName={proPlan.name}
                      isFeatured={true}
                    />
                  </div>
                </div>
              )}

              {/* --- Enterprise Plan --- */}
              {enterprisePlan && (
                <div className="border dark:border-apple-gray-700 rounded-apple-xl p-8 flex flex-col bg-white dark:bg-apple-gray-800/50">
                  <h3 className="text-2xl font-semibold">
                    {t('public.pricing.plans.enterprise.name')}
                  </h3>
                  <p className="mt-4 text-4xl font-bold">
                    {t('public.pricing.plans.enterprise.price')}
                    <span className="ml-1 text-lg font-medium text-apple-gray-500 dark:text-apple-gray-400">
                      /{t('public.pricing.plans.enterprise.frequency')}
                    </span>
                  </p>
                  <ul className="mt-6 space-y-3 mb-8">
                    {t('public.pricing.plans.enterprise.features', {
                      returnObjects: true,
                    }).map((feature, i) => (
                      <CheckListItem key={i}>{feature}</CheckListItem>
                    ))}
                  </ul>
                  <div className="flex-grow"></div>
                  <Link to="/contact" className="w-full mt-auto">
                    <Button
                      variant="secondary"
                      size="lg"
                      className="w-full"
                    >
                      {t('public.pricing.contactSales')}
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="py-20 bg-white dark:bg-apple-gray-900">
          <div className="container mx-auto px-6 max-w-3xl">
            <h2 className="text-3xl font-bold text-center mb-8">
              {t('public.pricing.faq.title')}
            </h2>
            <div className="space-y-6">
              {t('public.pricing.faq.items', {
                returnObjects: true,
                defaultValue: [],
              }).map((faq, i) => (
                <div key={i}>
                  <h4 className="font-semibold mb-1">{faq.question}</h4>
                  <p className="text-sm text-apple-gray-600 dark:text-apple-gray-400">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="py-20 bg-white dark:bg-apple-gray-900">
                    <div className="container mx-auto px-6 max-w-3xl">
                        <h2 className="text-3xl font-bold text-center mb-8 dark:text-white">{t('public.pricing.faq.title')}</h2>
                        <div className="space-y-6">
                            <div>
                                <h4 className="font-semibold mb-1 dark:text-white">{t('public.pricing.faq.freeTrial.question')}</h4>
                                <p className="text-sm text-apple-gray-600 dark:text-apple-gray-400">{t('public.pricing.faq.freeTrial.answer')}</p>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-1 dark:text-white">{t('public.pricing.faq.changePlan.question')}</h4>
                                <p className="text-sm text-apple-gray-600 dark:text-apple-gray-400">{t('public.pricing.faq.changePlan.answer')}</p>
                            </div>
                             <div>
                                <h4 className="font-semibold mb-1 dark:text-white">{t('public.pricing.faq.smsRequirements.question')}</h4>
                                <p className="text-sm text-apple-gray-600 dark:text-apple-gray-400">{t('public.pricing.faq.smsRequirements.answer')}</p>
                            </div>
                        </div>
                    </div>
                </section>
      </main>
    </div>
  )
}
export default PricingPage