import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import ProductCard from './ProductCard';
import * as AuthContext from '../context/AuthContext';
import * as CartContext from '../context/CartContext';

// Mock contexts
vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../context/CartContext', () => ({
  useCart: vi.fn(),
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => mockNavigate };
});

const mockProduct = {
  id: 1,
  name: 'Test Product',
  price: 99.99,
  stock: 10,
  rating: 4.5,
  reviewCount: 100,
  imageUrl: 'test.jpg',
  category: { name: 'Test Category' }
};

describe('ProductCard Component', () => {
  it('renders product details correctly', () => {
    AuthContext.useAuth.mockReturnValue({ isAuthenticated: true });
    CartContext.useCart.mockReturnValue({ addToCart: vi.fn() });

    render(
      <BrowserRouter>
        <ProductCard product={mockProduct} />
      </BrowserRouter>
    );

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('$99.99')).toBeInTheDocument();
    expect(screen.getByText('Test Category')).toBeInTheDocument();
    expect(screen.getByText('(100)')).toBeInTheDocument();
  });

  it('shows out of stock badge when stock is 0 and disables button', () => {
    AuthContext.useAuth.mockReturnValue({ isAuthenticated: true });
    CartContext.useCart.mockReturnValue({ addToCart: vi.fn() });

    render(
      <BrowserRouter>
        <ProductCard product={{ ...mockProduct, stock: 0 }} />
      </BrowserRouter>
    );

    expect(screen.getAllByText('Out of Stock').length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /Add Test Product to cart/i })).toBeDisabled();
  });

  it('redirects to login if not authenticated when adding to cart', async () => {
    AuthContext.useAuth.mockReturnValue({ isAuthenticated: false });
    CartContext.useCart.mockReturnValue({ addToCart: vi.fn() });

    render(
      <BrowserRouter>
        <ProductCard product={mockProduct} />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /Add Test Product to cart/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('calls addToCart when authenticated', async () => {
    AuthContext.useAuth.mockReturnValue({ isAuthenticated: true });
    const mockAddToCart = vi.fn().mockResolvedValue({ success: true });
    CartContext.useCart.mockReturnValue({ addToCart: mockAddToCart });

    render(
      <BrowserRouter>
        <ProductCard product={mockProduct} />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /Add Test Product to cart/i }));
    expect(mockAddToCart).toHaveBeenCalledWith(1, 1);
  });
});
