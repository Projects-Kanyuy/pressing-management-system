// client/src/pages/Public/VerifyUpgradePage.jsx

import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getMyTenantProfileApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import Spinner from '../../components/UI/Spinner';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const VerifyUpgradePage = () => {
    const navigate = useNavigate();
    const { login, user } = useAuth();
    const [status, setStatus] = useState('Verifying your upgrade...');
    const [error, setError] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        const refreshProfile = async () => {
            try {
                // Give the backend webhook a moment to process the payment confirmation
                await new Promise(res => setTimeout(res, 3000)); 

                const { data: newProfile } = await getMyTenantProfileApi();
                
                // Update the user's state in the global context with the new subscription info
                // We use the existing token from localStorage.
                login(newProfile, localStorage.getItem('token')); 
                
                setStatus(`Upgrade to the ${newProfile.plan} plan was successful!`);
                setIsSuccess(true);
                toast.success("Your subscription has been upgraded!");
                
                // Redirect to the dashboard after a short delay
                setTimeout(() => {
                    navigate('/app/dashboard');
                }, 2500);
            } catch (err) {
                setError("Failed to confirm your upgrade. Please log in again to see your new plan or contact support.");
            }
        };

        // Check if a user session exists before trying to refresh the profile.
        // This is a safety check.
        if (user) {
            refreshProfile();
        } else {
            setError("No active session found. Please log in to verify your upgrade.");
        }
    // --- THIS IS THE FIX ---
    // The dependency array is now empty. This ensures the effect runs only ONCE
    // when the component mounts, preventing the infinite loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); 

    return (
        <div className="min-h-screen bg-apple-gray-50 dark:bg-apple-gray-950 flex flex-col items-center justify-center text-center p-4">
            {error ? (
                <div className="flex flex-col items-center max-w-md">
                    <AlertTriangle size={48} className="text-red-500 mb-4" />
                    <h1 className="text-2xl font-bold text-red-500">Upgrade Verification Failed</h1>
                    <p className="mt-2 text-gray-600 dark:text-apple-gray-400">{error}</p>
                    <Link to="/contact" className="mt-6 text-apple-blue underline font-semibold">
                        Contact Support
                    </Link>
                </div>
            ) : isSuccess ? (
                 <div className="flex flex-col items-center max-w-md">
                    <CheckCircle2 size={48} className="text-green-500 mb-4" />
                    <h1 className="text-2xl font-bold text-green-500">{status}</h1>
                    <p className="mt-2 text-gray-600 dark:text-apple-gray-400">Redirecting you to your dashboard now...</p>
                </div>
            ) : (
                <div className="flex flex-col items-center max-w-md">
                    <Spinner />
                    <h1 className="text-2xl font-bold mt-4">{status}</h1>
                    <p className="mt-2 text-gray-500">Please wait while we update your account. Do not close this window.</p>
                </div>
            )}
        </div>
    );
};

export default VerifyUpgradePage;