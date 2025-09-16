// backend/services/accountPeService.js
import axios from 'axios';

let authToken = null;
let tokenExpiresAt = null;

const payinApi = axios.create({
    baseURL: process.env.ACCOUNTPE_PAYIN_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

const getAuthToken = async () => {
    try {
        const { data } = await axios.post('https://api.accountpe.com/admin/auth', {
            email: process.env.ACCOUNTPE_EMAIL,
            password: process.env.ACCOUNTPE_PASSWORD,
        });
        authToken = data.token;
        tokenExpiresAt = new Date(new Date().getTime() + 23 * 60 * 60 * 1000);
        console.log('[AccountPe Service] New Auth Token generated.');
        return authToken;
    } catch (error) {
        console.error("FATAL: Could not get AccountPe Auth Token.", error.response?.data);
        throw new Error('Payment provider authentication failed.');
    }
};

payinApi.interceptors.request.use(async (config) => {
    if (!authToken || new Date() > tokenExpiresAt) {
        await getAuthToken();
    }
    config.headers['Authorization'] = `Bearer ${authToken}`;
    return config;
}, (error) => Promise.reject(error));

export const createPaymentLink = async (paymentData) => {
    return payinApi.post('/create_payment_links', paymentData);
};

export const getPaymentLinkStatus = async (transactionId) => {
    return payinApi.post('/payment_link_status', { transaction_id: transactionId });
};