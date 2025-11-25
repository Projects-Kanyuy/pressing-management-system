// client/src/services/api.js
import axios from 'axios';

// ---------------- BASE API URL ----------------
const API_URL = process.env.REACT_APP_API_URL || 'https://api.pressmark.site/api';
console.log(`[api.js] API requests will be sent to: ${API_URL}`);

// ---------------- MAIN API INSTANCE ----------------
const api = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' },
});

// ---------------- AUTH INTERCEPTORS ----------------
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) config.headers['Authorization'] = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (
            error.response &&
            error.response.status === 401 &&
            !window.location.pathname.endsWith('/login')
        ) {
            console.warn('[api.js] Unauthorized (401). Redirecting to login.');
            localStorage.removeItem('token');
            window.location.hash = '/login';
        }
        return Promise.reject(error);
    }
);

// ---------------- PUBLIC API INSTANCE ----------------
const PublicAPI = axios.create({
    baseURL: API_URL,
});

// ---------------- DIRECTORY ADMIN API INSTANCE ----------------
const directoryAdminApi = axios.create({ baseURL: API_URL });

directoryAdminApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('directoryAdminToken');
        if (token) config.headers['Authorization'] = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);

directoryAdminApi.interceptors.response.use(
    (response) => response,
    (error) => {
        if (
            error.response &&
            error.response.status === 401 &&
            window.location.hash.includes('directory-admin')
        ) {
            console.warn('[api.js] Directory admin unauthorized. Redirecting.');
            localStorage.removeItem('directoryAdminToken');
            window.location.href = '/#/directory-admin/login';
        }
        return Promise.reject(error);
    }
);

// ========================================================
// ---------------- PUBLIC ROUTES -------------------------
// ========================================================

export const getPublicPlansApi = () => PublicAPI.get('/plans');

export const registerTenantWithSetup = (data) =>
    api.post('/public/register-with-setup', data);

export const initiateRegistrationApi = (data) =>
    api.post('/public/initiate-registration', data);

export const finalizeRegistrationApi = (data) =>
    api.post('/public/finalize-registration', data);

export const getTenantPriceListApi = (tenantId) =>
    PublicAPI.get(`/public/tenants/${tenantId}/prices`);

export const sendContactFormApi = (data) =>
    PublicAPI.post('/public/contact-form', data);

// ========================================================
// ---------------- AUTHENTICATION ------------------------
// ========================================================

export const loginUser = (data) => api.post('/auth/login', data);
export const logoutUserApi = () => api.post('/auth/logout');
export const getMe = () => api.get('/auth/me');
export const updateMyProfile = (data) => api.put('/auth/me', data);

export const requestPasswordChangeOtpApi = (data) =>
    api.post('/auth/me/request-password-change-otp', data);

export const confirmPasswordChangeApi = (data) =>
    api.put('/auth/me/confirm-password-change', data);

// ========================================================
// ---------------- ORDERS ------------------------------
// ========================================================

export const fetchOrders = (filters = {}) => {
    const cleaned = {};
    Object.entries(filters).forEach(([k, v]) => {
        if (v !== null && v !== undefined && v !== '') cleaned[k] = v;
    });
    return api.get('/orders', { params: cleaned });
};

export const fetchOrderById = (id) => api.get(`/orders/${id}`);
export const createNewOrder = (data) => api.post('/orders', data);
export const updateExistingOrder = (id, data) => api.put(`/orders/${id}`, data);
export const deleteOrderApi = (id) => api.delete(`/orders/${id}`);

export const sendManualNotification = (id) =>
    api.post(`/orders/${id}/notify`);

export const recordPaymentApi = (id, paymentData) =>
    api.post(`/orders/${id}/payments`, paymentData);

export const markOrderPaidApi = (id) =>
    api.put(`/orders/${id}/mark-paid`);

export const recordPartialPaymentApi = (id, paymentData) =>
    api.post(`/orders/${id}/payments`, paymentData);

// ========================================================
// ---------------- CUSTOMERS -----------------------------
// ========================================================

export const fetchCustomers = (search = '') =>
    api.get('/customers', { params: search ? { search } : {} });

export const fetchCustomerById = (id) => api.get(`/customers/${id}`);
export const createNewCustomer = (data) => api.post('/customers', data);
export const updateExistingCustomer = (id, data) =>
    api.put(`/customers/${id}`, data);

export const deleteCustomerApi = (id) => api.delete(`/customers/${id}`);

// ========================================================
// ---------------- PRICING, SETTINGS, REPORTS ------------
// ========================================================

export const fetchPrices = () => api.get('/prices');
export const upsertPricesApi = (data) => api.put('/prices', data);

export const fetchAppSettings = () => api.get('/settings');
export const updateAppSettingsApi = (data) => api.put('/settings', data);

export const fetchDailyPaymentsReport = (date) =>
    api.get('/reports/daily-payments', { params: { date } });

// ========================================================
// ---------------- SUBSCRIPTIONS (Swychr) ----------------
// ========================================================

export const changeSubscriptionPlanApi = (data) =>
    api.post('/subscriptions/change-plan', data);

export const initiatePaidSubscriptionApi = (data) =>
    PublicAPI.post('/subscriptions/initiate', data);

export const verifyPaymentAndFinalizeApi = (data) =>
    PublicAPI.post('/subscriptions/verify-payment', data);

// ========================================================
// ---------------- ADMIN NOTIFICATIONS -------------------
// ========================================================

export const fetchAdminNotificationsApi = () =>
    api.get('/admin-notifications');

export const markAdminNotificationReadApi = (id) =>
    api.put(`/admin-notifications/${id}/read`);

export const markAllAdminNotificationsReadApi = () =>
    api.put('/admin-notifications/read-all');

// ========================================================
// ---------------- PROFILE UPLOADS -----------------------
// ========================================================

export const uploadMyProfilePicture = (formData) =>
    api.put('/auth/me/profile-picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });

// ========================================================
// ---------------- DIRECTORY ADMIN -----------------------
// ========================================================

export const loginDirectoryAdminApi = (data) =>
    api.post('/directory-admins/login', data);

export const getAllDirectoryListingsApi = () =>
    directoryAdminApi.get('/directory-admins/listings');

export const createDirectoryListingApi = (data) =>
    directoryAdminApi.post('/directory-admins/listings', data);

export const updateDirectoryListingApi = (id, data) =>
    directoryAdminApi.put(`/directory-admins/listings/${id}`, data);

export const deleteDirectoryListingApi = (id) =>
    directoryAdminApi.delete(`/directory-admins/listings/${id}`);

export const getAllTenantsApi = () =>
    api.get('/directory-admins/tenants');

export const updateTenantApi = (id, data) =>
    api.put(`/directory-admins/tenants/${id}`, data);

export const uploadTenantLogoApi = (formData) =>
    api.post('/uploads/tenant-logo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });

export const uploadListingLogoApi = (formData) =>
    directoryAdminApi.post('/uploads/listing-logo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });

export const getPublicDirectoryApi = (filters) =>
    api.get('/public/directory', { params: filters });

export const getBusinessBySlugApi = (slug) =>
    api.get(`/public/directory/${slug}`);

export const getMyTenantProfileApi = () => api.get('/tenant-profile');
export const updateMyTenantProfileApi = (data) =>
    api.put('/tenant-profile', data);

export const fetchInboundMessagesApi = (page = 1, pageSize = 25) =>
    api.get('/inbound-messages', { params: { page, pageSize } });

export default api;
