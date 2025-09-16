import axios from 'axios';

let authToken = null;
let tokenExpiresAt = null;

const payinApi = axios.create({
    baseURL: process.env.ACCOUNTPE_PAYIN_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

const getAuthToken = async () => {
    try {
        // --- STEP 1: LOG THE CREDENTIALS BEING USED ---
        // This will immediately tell us if the .env variables are loading correctly.
        console.log('[AccountPe Service] Attempting to authenticate with...');
        console.log(`Email: ${process.env.ACCOUNTPE_EMAIL}`);
        console.log(`Password: ${process.env.ACCOUNTPE_PASSWORD ? '******' : 'NOT FOUND'}`);
        
        if (!process.env.ACCOUNTPE_EMAIL || !process.env.ACCOUNTPE_PASSWORD) {
            throw new Error('ACCOUNTPE_EMAIL or ACCOUNTPE_PASSWORD is not set in the .env file.');
        }

        const { data } = await axios.post('https://api.accountpe.com/admin/auth', {
            email: process.env.ACCOUNTPE_EMAIL,
            password: process.env.ACCOUNTPE_PASSWORD,
        });
        
        const token = data.token || data.data?.token;
        if (!token) throw new Error('Token not found in AccountPe auth response.');

        authToken = token;
        tokenExpiresAt = new Date(new Date().getTime() + 23 * 60 * 60 * 1000);
        console.log('[AccountPe Service] New Auth Token generated successfully.');
        return authToken;

    } catch (error) {
        // --- STEP 2: LOG THE DETAILED ERROR ---
        console.error("FATAL: Could not get AccountPe Auth Token.");
        if (error.response) {
            // The request was made and the server responded with a status code
            console.error('AccountPe API Response Status:', error.response.status);
            console.error('AccountPe API Response Data:', error.response.data);
        } else if (error.request) {
            // The request was made but no response was received
            console.error('AccountPe API Request Error: No response received.', error.request);
        } else {
            // Something happened in setting up the request
            console.error('Axios Setup Error:', error.message);
        }
        throw new Error('Payment provider authentication failed.');
    }
};

export const createPaymentLink = async (paymentData) => {
    return payinApi.post('/create_payment_links', paymentData);
};

export const getPaymentLinkStatus = async (transactionId) => {
    return payinApi.post('/payment_link_status', { transaction_id: transactionId });
};