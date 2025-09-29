// backend/services/accountPeService.js

import axios from 'axios';
import https from 'https'; // <-- 1. IMPORT the 'https' module

// --- STATE MANAGEMENT for the AccountPe Auth Token ---
let authToken = null;
let tokenExpiresAt = null;

// --- A SINGLE, UNIFIED API INSTANCE ---
const payinApi = axios.create({
    baseURL: 'https://api.accountpe.com/api/payin',
    headers: { 'Content-Type': 'application/json' },
});

// --- 2. CREATE the custom HTTPS agent ---
// This agent will be used to bypass local SSL/TLS issues.
const httpsAgent = new https.Agent({  
  rejectUnauthorized: false,
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

        // The final URL will be: https://api.accountpe.com/api/payin/admin/auth
        // --- 3. APPLY the fix to the API call ---
        const { data } = await payinApi.post(
            '/admin/auth', 
            { email, password },
            { httpsAgent } // Tell axios to use our custom agent for this request
        );
        
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
    const url = '/create_payment_links';
    // --- 4. APPLY the fix here as well for consistency ---
    return payinApi.post(url, paymentData, { httpsAgent });
};

/**
 * Gets the status of a payment link.
 */
export const getPaymentLinkStatus = async (transactionId) => {
    const url = '/payment_link_status';
    // --- 4. APPLY the fix here as well ---
    return payinApi.post(url, { transaction_id: transactionId }, { httpsAgent });
};

/**
 * Axios request interceptor.
 */
payinApi.interceptors.request.use(
    async (config) => {
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