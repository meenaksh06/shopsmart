import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import App from './App';

// Mock all API modules so no real network calls are made
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

// matchMedia mock for responsive components
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
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

describe('App Component - Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('1. App renders without crashing', () => {
    const { unmount } = render(<App />);
    expect(() => unmount()).not.toThrow();
  });

  it('2. Navbar renders with ShopSmart brand name', () => {
    render(<App />);
    // Use getAllByText since "ShopSmart" appears in navbar brand + footer logo
    const elements = screen.getAllByText(/ShopSmart/i);
    expect(elements.length).toBeGreaterThan(0);
  });

  it('3. Navbar shows Login link for unauthenticated user', () => {
    render(<App />);
    // Multiple Login links: navbar button + footer link
    const loginLinks = screen.getAllByRole('link', { name: /login/i });
    expect(loginLinks.length).toBeGreaterThan(0);
  });

  it('4. Navbar shows "Sign Up" link for unauthenticated user', () => {
    render(<App />);
    // Multiple Sign Up links can exist (navbar + footer)
    const signupLinks = screen.getAllByRole('link', { name: /sign up/i });
    expect(signupLinks.length).toBeGreaterThan(0);
  });

  it('5. Page has Products navigation links', () => {
    render(<App />);
    // Multiple "Products" links: nav + footer
    const productsLinks = screen.getAllByRole('link', { name: /products/i });
    expect(productsLinks.length).toBeGreaterThan(0);
  });

  it('6. Footer renders with copyright text', () => {
    render(<App />);
    const footer = document.querySelector('.footer');
    expect(footer).toBeInTheDocument();
    expect(footer.textContent).toMatch(/ShopSmart/i);
  });

  it('7. The main app container element is present', () => {
    const { container } = render(<App />);
    expect(container.querySelector('.app-container')).toBeInTheDocument();
  });

  it('8. Home page hero section renders on the default route', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText(/Shop Smarter/i)).toBeInTheDocument();
    });
  });

  it('9. Home page has a "Shop Now" call-to-action button', async () => {
    render(<App />);
    await waitFor(() => {
      const shopNowLinks = screen.getAllByRole('link', { name: /shop now/i });
      expect(shopNowLinks.length).toBeGreaterThan(0);
    });
  });

  it('10. Announcement bar is present at the top of the page', () => {
    render(<App />);
    const announcementBar = document.querySelector('.announcement-bar');
    expect(announcementBar).toBeInTheDocument();
    expect(announcementBar.textContent.length).toBeGreaterThan(0);
  });
});
