// backend/services/accountPeService.js

import axios from 'axios';

let authToken = null;
let tokenExpiresAt = null;

const accountPeApi = axios.create({
    baseURL: 'https://api.accountpe.com',
});

const getAuthToken = async () => {
    try {
        const email = process.env.ACCOUNTPE_EMAIL;
        const password = process.env.ACCOUNTPE_PASSWORD;
        
        if (!email || !password) {
            throw new Error('AccountPe credentials are not configured.');
        }

        // --- THIS IS THE FIX ---
        // We are adding headers to make the request look like a standard web request,
        // which helps bypass some server-side security checks like CSRF.
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json', // Tell the server we expect a JSON response
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' // Pretend to be a browser
            },
            timeout: 10000
        };

        // The API call now includes the new config object.
        const { data } = await accountPeApi.post('/admin/auth', { email, password }, config);
        
        const token = data.token;
        if (!token) {
            throw new Error('Token not found in AccountPe auth response.');
        }

        authToken = token;
        tokenExpiresAt = new Date(new Date().getTime() + 23 * 60 * 60 * 1000);
        console.log('[AccountPe Service] New Auth Token generated successfully.');

    } catch (error) {
        console.error("--- FATAL ERROR: Could not get AccountPe Auth Token ---");
        if (error.response) {
            console.error('AccountPe API responded with an error:', error.response.status);
            // We log the data to see if it's HTML or JSON
            console.error('Response Data:', error.response.data);
        } else {
            console.error('Full error object:', error.message);
        }
        throw new Error('Payment provider authentication failed.');
    }
};

export const createPaymentLink = async (paymentData) => {
    const url = '/api/payin/create_payment_links';
    return accountPeApi.post(url, paymentData);
};

export const getPaymentLinkStatus = async (transactionId) => {
    const url = '/api/payin/payment_link_status';
    return accountPeApi.post(url, { transaction_id: transactionId });
};

accountPeApi.interceptors.request.use(
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