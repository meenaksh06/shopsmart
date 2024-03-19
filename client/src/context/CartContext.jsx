import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as cartApi from '../api/cart';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null);
      setTotal(0);
      return;
    }
    setLoading(true);
    try {
      const res = await cartApi.getCart();
      setCart(res.data.cart);
      setTotal(res.data.total || 0);
    } catch {
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = useCallback(async (productId, quantity = 1) => {
    try {
      await cartApi.addToCart(productId, quantity);
      await fetchCart();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Failed to add to cart' };
    }
  }, [fetchCart]);

  const updateItem = useCallback(async (itemId, quantity) => {
    try {
      await cartApi.updateCartItem(itemId, quantity);
      await fetchCart();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Failed to update cart' };
    }
  }, [fetchCart]);

  const removeItem = useCallback(async (itemId) => {
    try {
      await cartApi.removeCartItem(itemId);
      await fetchCart();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Failed to remove item' };
    }
  }, [fetchCart]);

  const itemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <CartContext.Provider value={{ cart, total, loading, itemCount, fetchCart, addToCart, updateItem, removeItem }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
