import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
console.log(`[api.js] API requests will be sent to: ${API_URL}`);
const api = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' },
});

// --- DIRECTORY ADMIN API ---
const directoryAdminApi = axios.create({ baseURL: API_URL });

directoryAdminApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('directoryAdminToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

directoryAdminApi.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401 && window.location.pathname.includes('/directory-admin')) {
             console.warn('[api.js] Directory Admin Unauthorized (401). Redirecting to dir-admin login.');
             localStorage.removeItem('directoryAdminToken');
             window.location.href = '/#/directory-admin/login';
        }
        return Promise.reject(error);
    }
);


export const loginDirectoryAdminApi = async (credentials) => {
    return api.post('/directory-admins/login', credentials);
};

export const getAllDirectoryListingsApi = async () => {
    return directoryAdminApi.get('/directory-admins/listings');
};
export const createDirectoryListingApi = async (listingData) => {
    return directoryAdminApi.post('/directory-admins/listings', listingData);
};
export const updateDirectoryListingApi = async (id, listingData) => {
    return directoryAdminApi.put(`/directory-admins/listings/${id}`, listingData);
};
export const deleteDirectoryListingApi = async (id) => {
    return directoryAdminApi.delete(`/directory-admins/listings/${id}`);
};
export const getAllTenantsApi = async () => {
    return directoryAdminApi.get('/directory-admins/tenants');
};

export const updateTenantApi = async (id, tenantData) => {
    return directoryAdminApi.put(`/directory-admins/tenants/${id}`, tenantData);
};
export const uploadTenantLogoApi = async (formData) => {
    return directoryAdminApi.post('/uploads/tenant-logo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};

export const uploadListingLogoApi = async (formData) => {
    return directoryAdminApi.post('/uploads/listing-logo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};

// --- PUBLIC DIRECTORY API ---
export const getPublicDirectoryApi = async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.city) params.append('city', filters.city);
    return api.get(`/directory/listings?${params.toString()}`);
};

export const getBusinessBySlugApi = async (slug) => {
    return api.get(`/directory/listings/${slug}`);
};

export const getTenantPriceListApi = async (tenantId) => {
    return api.get(`/price-list/${tenantId}`);
};

// --- PLANS API (Admin) ---
export const getAllPlansAdminApi = async () => {
    return directoryAdminApi.get('/directory-admins/plans');
};

export const updatePlanApi = async (planId, planData) => {
    return directoryAdminApi.put(`/directory-admins/plans/${planId}`, planData);
};

export default api;