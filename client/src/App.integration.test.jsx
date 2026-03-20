import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from './App';
import * as authApi from './api/auth';
import * as cartApi from './api/cart';
import * as productsApi from './api/products';

// Mock API modules
vi.mock('./api/auth', () => ({
  getMe: vi.fn(),
  login: vi.fn(),
  register: vi.fn(),
}));

vi.mock('./api/cart', () => ({
  getCart: vi.fn(),
  addToCart: vi.fn(),
}));

vi.mock('./api/products', () => ({
  getProducts: vi.fn(),
  getCategories: vi.fn(),
}));

// Mock matchMedia for responsive components if needed
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('App Integration', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.clear();
    
    // Default API mocks
    authApi.getMe.mockRejectedValue(new Error('Not logged in'));
    productsApi.getCategories.mockResolvedValue({ data: { categories: [] } });
    productsApi.getProducts.mockResolvedValue({ 
      data: { 
        products: [
          { id: 1, name: 'Test Item 1', price: 99, stock: 10, rating: 4 },
          { id: 2, name: 'Test Item 2', price: 149, stock: 5, rating: 5 }
        ],
        pagination: { total: 2, pages: 1 }
      } 
    });
    cartApi.getCart.mockResolvedValue({ data: { cart: { items: [] }, total: 0 } });
  });

  it('renders home page by default', async () => {
    render(<App />);
    
    // Check Navbar
    const brandElements = screen.getAllByText(/ShopSmart/i);
    expect(brandElements.length).toBeGreaterThan(0);
    
    // Check Home Page Hero
    expect(await screen.findByText(/Shop Smarter/)).toBeInTheDocument();
  });

  it('navigates to products page and fetches products', async () => {
    // Instead of rendering full App and clicking (which can be flaky in JSDOM due to routing context)
    // we just use the History push state from the testing library environment, or directly trigger the click properly.
    render(<App />);
    
    const productsLinks = screen.getAllByRole('link', { name: /Products/i });
    // Find the desktop link (not the mobile menu one) and click it
    const deskLink = productsLinks.find(l => typeof l.className === 'string' && l.className.includes('nav-link'));
    fireEvent.click(deskLink || productsLinks[0]);

    // Just wait for the expected mocked products to load directly instead of the page heading.
    await waitFor(() => {
      expect(productsApi.getProducts).toHaveBeenCalled();
      expect(screen.getByText('Test Item 1')).toBeInTheDocument();
      expect(screen.getByText('Test Item 2')).toBeInTheDocument();
    });
  });

  it('handles login flow and updates cart state', async () => {
    // Setup successful login mock
    authApi.login.mockResolvedValue({
      data: { user: { id: 1, name: 'Test User' }, token: 'fake-token' }
    });
    
    // Setup cart response after login
    cartApi.getCart.mockResolvedValue({
      data: {
        cart: { items: [{ id: 1, quantity: 2, product: { name: 'Test Item 1', price: 99 } }] },
        total: 198
      }
    });

    render(<App />);
    
    // Navigate to Login using the desktop button
    const loginLinks = screen.getAllByText('Login');
    fireEvent.click(loginLinks[0]); 

    // Fill form
    const emailInput = await screen.findByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    // Submit (use getAllByRole since there is a Log In link in the footer too)
    const submitBtns = screen.getAllByRole('button', { name: /Log In/i });
    fireEvent.click(submitBtns[0]);

    // Verify login was called
    await waitFor(() => expect(authApi.login).toHaveBeenCalledWith({ email: 'test@example.com', password: 'password123' }));
    
    // Verify Nav updates to user state
    await waitFor(() => {
      expect(screen.getByText('Hi, Test!')).toBeInTheDocument();
      // Cart badge should show '2' (from 2 quantity item)
      const badge = screen.getByText('2');
      expect(badge).toHaveClass('cart-badge');
    });
  });
});
