import api from './client';

export const getCart = () => api.get('/api/cart');
export const addToCart = (productId, quantity) =>
  api.post('/api/cart/items', { productId, quantity });
export const updateCartItem = (itemId, quantity) =>
  api.put(`/api/cart/items/${itemId}`, { quantity });
export const removeCartItem = (itemId) => api.delete(`/api/cart/items/${itemId}`);
export const clearCart = () => api.delete('/api/cart');
