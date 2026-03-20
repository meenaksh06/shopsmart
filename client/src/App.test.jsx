import { render, screen } from '@testing-library/react';
import App from './App';
import { describe, it, expect, vi } from 'vitest';

// Mock all API modules
vi.mock('./api/auth', () => ({
  getMe: vi.fn().mockRejectedValue(new Error('Not logged in')),
  login: vi.fn(),
  register: vi.fn(),
}));

vi.mock('./api/products', () => ({
  getProducts: vi.fn().mockResolvedValue({
    data: { products: [], pagination: { total: 0, pages: 1 } },
  }),
  getCategories: vi.fn().mockResolvedValue({ data: { categories: [] } }),
}));

vi.mock('./api/cart', () => ({
  getCart: vi.fn().mockResolvedValue({ data: { cart: { items: [] }, total: 0 } }),
  addToCart: vi.fn(),
  updateCartItem: vi.fn(),
  removeFromCart: vi.fn(),
}));

describe('App', () => {
  it('renders ShopSmart brand title in the navigation', () => {
    render(<App />);
    // ShopSmart appears in both navbar brand and footer - use getAllByText
    const brandElements = screen.getAllByText(/ShopSmart/i);
    expect(brandElements.length).toBeGreaterThan(0);
  });
});
