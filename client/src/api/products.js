import api from './client';

export const getProducts = (params) => api.get('/api/products', { params });
export const getProduct = (id) => api.get(`/api/products/${id}`);
export const getCategories = () => api.get('/api/products/categories');
