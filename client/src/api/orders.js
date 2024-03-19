import api from './client';

export const placeOrder = () => api.post('/api/orders');
export const getOrders = () => api.get('/api/orders');
export const getOrder = (id) => api.get(`/api/orders/${id}`);
