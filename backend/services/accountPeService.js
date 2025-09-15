// server/services/accountPeService.js

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// --- STATE MANAGEMENT for the AccountPe Auth Token ---
// These variables will be kept in memory on your server.
let authToken = null;
let tokenExpiresAt = null;

// Create a dedicated Axios instance for the AccountPe Payin API.
const payinApi = axios.create({
    baseURL: process.env.ACCOUNTPE_PAYIN_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

/**
 * Fetches a new authentication token from the AccountPe /admin/auth endpoint.
 * This function is called automatically when a token is missing or expired.
 */
const getAuthToken = async () => {
    try {
        console.log('[AccountPe Service] Authenticating with AccountPe API...');
        
        const response = await axios.post('https://api.accountpe.com/admin/auth', {
            email: process.env.ACCOUNTPE_EMAIL,
            password: process.env.ACCOUNTPE_PASSWORD,
        });
        
        // IMPORTANT: The exact location of the token in the response may vary.
        // Based on typical API design, it might be in `response.data.token` or `response.data.data.token`.
        // You must check the actual API response to confirm this path.
        const token = response.data.token || response.data.data?.token;

        if (!token) {
            throw new Error('Token not found in AccountPe auth response.');
        }

        authToken = token; 
        
        // Set the token to expire in 23 hours to provide a 1-hour safety buffer.
        tokenExpiresAt = new Date(new Date().getTime() + 23 * 60 * 60 * 1000);
        
        console.log('[AccountPe Service] New Auth Token generated successfully.');
        return authToken;

    } catch (error) {
        console.error("FATAL: Failed to get AccountPe Auth Token.", error.response?.data || error.message);
        // This is a critical error, as no payments can be processed without a token.
        throw new Error('Could not authenticate with the payment provider.');
    }
};

/**
 * Axios request interceptor. This function runs BEFORE every single request
 * made using the `payinApi` instance.
 */
payinApi.interceptors.request.use(
    async (config) => {
        // If the token is missing or if the current time is past the expiry time...
        if (!authToken || new Date() > tokenExpiresAt) {
            // ...fetch a new one.
            await getAuthToken();
        }
        
        // Attach the valid token to the Authorization header.
        config.headers['Authorization'] = `Bearer ${authToken}`;
        return config;
    },
    (error) => Promise.reject(error)
);

// --- EXPORTABLE SERVICE FUNCTIONS that your controllers will use ---

/**
 * Creates a payment link using the AccountPe API.
 * @param {object} paymentData - The data required by the /create_payment_links endpoint.
 * @returns {Promise<axios.AxiosResponse<any>>} The response from the AccountPe API.
 */
export const createPaymentLink = async (paymentData) => {
    return payinApi.post('/create_payment_links', paymentData);
};

/**
 * Gets the status of a payment link using the AccountPe API.
 * @param {string} transactionId - The transaction_id of the payment to check.
 * @returns {Promise<axios.AxiosResponse<any>>} The response from the AccountPe API.
 */
export const getPaymentLinkStatus = async (transactionId) => {
    return payinApi.post('/payment_link_status', { transaction_id: transactionId });
};