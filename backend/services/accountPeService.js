// backend/services/accountPeService.js

import axios from 'axios';

// --- STATE MANAGEMENT for the AccountPe Auth Token ---
let authToken = null;
let tokenExpiresAt = null;

// --- A SINGLE, UNIFIED API INSTANCE ---
// The baseURL is now CORRECTLY set to the payin base URL.
const payinApi = axios.create({
    baseURL: 'https://api.accountpe.com/api/payin',
    headers: { 'Content-Type': 'application/json' },
});

/**
 * Fetches a new authentication token from the correct AccountPe endpoint.
 */
const getAuthToken = async () => {
    try {
        const email = process.env.ACCOUNTPE_EMAIL;
        const password = process.env.ACCOUNTPE_PASSWORD;
        
        if (!email || !password) {
            throw new Error('AccountPe credentials are not configured.');
        }

        // --- THIS IS THE FIX ---
        // We use the payinApi instance and call the correct '/admin/auth' path.
        // The final URL will be: https://api.accountpe.com/api/payin/admin/auth
        const { data } = await payinApi.post('/admin/auth', { email, password });
        
        const token = data.token;
        if (!token) {
            throw new Error('Token not found in AccountPe auth response.');
        }

        authToken = token;
        tokenExpiresAt = new Date(new Date().getTime() + 23 * 60 * 60 * 1000);
        console.log('[AccountPe Service] New Auth Token generated successfully!');

    } catch (error) {
        console.error("--- FATAL ERROR: Could not get AccountPe Auth Token ---");
        if (error.response) {
            console.error('AccountPe API responded with an error:', error.response.status, error.response.data);
        } else {
            console.error('Full error object:', error.message);
        }
        throw new Error('Payment provider authentication failed.');
    }
};

/**
 * Creates a payment link. This function relies on the interceptor to get a token.
 */
export const createPaymentLink = async (paymentData) => {
    // The path is now relative to the baseURL.
    const url = '/create_payment_links';
    return payinApi.post(url, paymentData);
};

/**
 * Gets the status of a payment link.
 */
export const getPaymentLinkStatus = async (transactionId) => {
    const url = '/payment_link_status';
    return payinApi.post(url, { transaction_id: transactionId });
};

/**
 * Axios request interceptor.
 */
payinApi.interceptors.request.use(
    async (config) => {
        // DO NOT try to get a token for the auth route itself!
        if (config.url === '/admin/auth') {
            return config;
        }

        if (!authToken || new Date() > tokenExpiresAt) {
            await getAuthToken();
        }
        
        config.headers['Authorization'] = `Bearer ${authToken}`;
        return config;
    },
    (error) => Promise.reject(error)
);