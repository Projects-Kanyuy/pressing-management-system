// client/src/components/UI/ChoosePlanButton.js

import React, {useState} from 'react' ;
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { changeSubscriptionPlanApi } from '../../services/api'
import Button from './Button'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

const ChoosePlanButton = ({ planName, isFeatured }) => {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(false)

  const handleUpgrade = async () => {
    if (
      !window.confirm(`Are you sure you want to subscribe to the ${planName} plan?`)
    ) {
      return
    }
    setIsLoading(true)
    try {
      const { data } = await changeSubscriptionPlanApi({ planName })

      // The API sends back the full, updated user object including the new token.
      // We use the login function to update the global context and localStorage.
      login(data)

      toast.success(data.message)
      navigate('/dashboard') // Redirect to their main dashboard after upgrade
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to upgrade plan. Please try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  // --- LOGIC FOR LOGGED-IN TENANT USERS ---
  if (user && user.tenant) {
    // If the user is already on this plan
    if (user.tenant.plan === planName) {
      return (
        <Button variant="secondary" size="lg" className="w-full" disabled>
          Current Plan
        </Button>
      )
    }
    // If the user is on a different plan (e.g., Trial)
    return (
      <Button
        variant={isFeatured ? 'primary' : 'secondary'}
        size="lg"
        className="w-full"
        onClick={handleUpgrade}
        isLoading={isLoading}
      >
        Upgrade to {planName}
      </Button>
    )
  }

  // --- LOGIC FOR GUESTS ---
  return (
    <Link to={`/register?plan=${planName.toLowerCase()}`} className="w-full">
      <Button
        variant={isFeatured ? 'primary' : 'secondary'}
        size="lg"
        className="w-full"
      >
        {t('public.pricing.choose')} {planName}
      </Button>
    </Link>
  )
}

export default ChoosePlanButton