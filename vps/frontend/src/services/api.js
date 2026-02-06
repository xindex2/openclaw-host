import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    login: (data) => api.post('/auth/login', data),
    register: (data) => api.post('/auth/register', data),
    getMe: () => api.get('/auth/me'),
    updateProfile: (data) => api.patch('/auth/profile', data),
    updateSubscription: (data) => api.patch('/auth/subscription', data),
    forgotPassword: (data) => api.post('/auth/forgot-password', data),
    resetPassword: (data) => api.post('/auth/reset-password', data),
};

// Instance API
export const instanceAPI = {
    getAll: () => api.get('/instances'),
    getById: (id) => api.get(`/instances/${id}`),
    create: (data) => api.post('/instances', data),
    start: (id) => api.post(`/instances/${id}/start`),
    stop: (id) => api.post(`/instances/${id}/stop`),
    delete: (id) => api.delete(`/instances/${id}`),
    getLogs: (id) => api.get(`/instances/${id}/logs`),
};

// Admin API
export const adminAPI = {
    // ... Existing admin methods if any, but wait, usually they are in their own object
    getUsers: (params) => api.get('/admin/users', { params }),
    getInstances: (params) => api.get('/admin/instances', { params }),
    updateUserPlan: (userId, data) => api.patch(`/admin/users/${userId}/plan`, data),
    getStats: () => api.get('/admin/stats'),
    getWhopPlans: () => api.get('/admin/whop/plans'),
    updateWhopPlan: (data) => api.post('/admin/whop/plans', data),
    deleteWhopPlan: (id) => api.delete(`/admin/whop/plans/${id}`),
    getWhopSettings: () => api.get('/admin/whop/settings'),
    updateWhopSettings: (data) => api.post('/admin/whop/settings', data),
    rebuildBot: () => api.post('/admin/maintenance/bot/rebuild'),
    updateAllAgents: () => api.post('/admin/maintenance/bot/update-all'),
};

export default api;
