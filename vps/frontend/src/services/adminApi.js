import api from './api';

export const adminAPI = {
    // Users
    getUsers: (params) => api.get('/admin/users', { params }),
    updateUser: (id, data) => api.patch(`/admin/users/${id}`, data),
    deleteUser: (id) => api.delete(`/admin/users/${id}`),

    // Agents
    getAgents: (params) => api.get('/admin/instances', { params }),

    // Stats
    getStats: () => api.get('/admin/stats'),

    // Whop Plans
    getWhopPlans: () => api.get('/admin/whop/plans'),
    updateWhopPlan: (data) => api.post('/admin/whop/plans', data),
    deleteWhopPlan: (id) => api.delete(`/admin/whop/plans/${id}`),

    // Whop Settings
    getWhopSettings: () => api.get('/admin/whop/settings'),
    updateWhopSettings: (data) => api.post('/admin/whop/settings', data),
};
