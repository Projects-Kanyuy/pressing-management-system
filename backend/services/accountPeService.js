// backend/services/accountPeService.js
import axios from 'axios'; // <-- THE FIX: Import the default export correctly.

let authToken = null;
let tokenExpiresAt = null;

const payinApi = axios.create({
    baseURL: process.env.ACCOUNTPE_PAYIN_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

const getAuthToken = async () => {
    try {
        const email = process.env.ACCOUNTPE_EMAIL;
        const password = process.env.ACCOUNTPE_PASSWORD;

        if (!email || !password) {
            throw new Error('AccountPe credentials are not configured on the server.');
        }

        const { data } = await axios.post('https://api.accountpe.com/admin/auth', 
            { email, password },
            { timeout: 10000 }
        );
        
        const token = data.token;
        if (!token) throw new Error('Token not found in AccountPe auth response.');

        authToken = token;
        tokenExpiresAt = new Date(new Date().getTime() + 23 * 60 * 60 * 1000);
        console.log('[AccountPe Service] New Auth Token generated successfully.');
        return authToken;

    } catch (error) {
        console.error("FATAL ERROR in getAuthToken:", error.message);
        throw new Error('Payment provider authentication failed.');
    }
};

payinApi.interceptors.request.use(async (config) => {
    if (!authToken || new Date() > tokenExpiresAt) {
        await getAuthToken();
    }
    config.headers['Authorization'] = `Bearer ${authToken}`;
    return config;
});

export const createPaymentLink = (paymentData) => payinApi.post('/create_payment_links', paymentData);
export const getPaymentLinkStatus = (transactionId) => payinApi.post('/payment_link_status', { transaction_id: transactionId });