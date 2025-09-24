// backend/services/accountPeService.js

import axios from 'axios';

let authToken = null;
let tokenExpiresAt = null;

// --- A dedicated instance for the root auth endpoint ---
const authApi = axios.create({
    baseURL: 'https://api.accountpe.com',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json', // Explicitly ask for a JSON response
    },
    timeout: 10000,
});

// --- A dedicated instance for the payin API endpoints ---
const payinApi = axios.create({
    baseURL: process.env.ACCOUNTPE_PAYIN_BASE_URL, // https://api.accountpe.com/api/payin
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    timeout: 10000,
});

/**
 * Fetches a new authentication token from the AccountPe API.
 */
const getAuthToken = async () => {
    try {
        const email = process.env.ACCOUNTPE_EMAIL;
        const password = process.env.ACCOUNTPE_PASSWORD;

        if (!email || !password) {
            throw new Error('AccountPe credentials not configured in .env file.');
        }

        console.log(`[AccountPe Service] Authenticating with ${email}...`);

        const { data } = await authApi.post('/admin/auth', { email, password });
        
        const token = data.token;
        if (!token) {
            throw new Error('Token not found in AccountPe auth response.');
        }

        authToken = token;
        tokenExpiresAt = new Date(new Date().getTime() + 23 * 60 * 60 * 1000);
        console.log('[AccountPe Service] New Auth Token generated successfully.');
        return authToken;

    } catch (error) {
        console.error("--- FATAL ERROR in getAuthToken ---");
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
    // The interceptor will run before this request is sent
    return payinApi.post('/create_payment_links', paymentData);
};

/**
 * Axios request interceptor for the payin API.
 * This runs BEFORE every request made with `payinApi`.
 */
payinApi.interceptors.request.use(
    async (config) => {
        if (!authToken || new Date() > tokenExpiresAt) {
            await getAuthToken();
        }
        config.headers['Authorization'] = `Bearer ${authToken}`;
        return config;
    },
    (error) => Promise.reject(error)
);