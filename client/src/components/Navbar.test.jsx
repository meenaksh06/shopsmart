import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import Navbar from './Navbar';
import * as AuthContext from '../context/AuthContext';
import * as CartContext from '../context/CartContext';

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../context/CartContext', () => ({
  useCart: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => mockNavigate };
});

describe('Navbar Component', () => {
  it('renders correctly for unauthenticated user', () => {
    AuthContext.useAuth.mockReturnValue({ isAuthenticated: false });
    CartContext.useCart.mockReturnValue({ itemCount: 0 });

    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    expect(screen.getByText('ShopSmart')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
    expect(screen.queryByText('Orders')).not.toBeInTheDocument();
  });

  it('renders correctly for authenticated user', () => {
    AuthContext.useAuth.mockReturnValue({ 
      isAuthenticated: true, 
      user: { name: 'John Doe' },
      logout: vi.fn()
    });
    CartContext.useCart.mockReturnValue({ itemCount: 3 });

    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    // Should show user greeting
    expect(screen.getByText('Hi, John!')).toBeInTheDocument();
    
    // Should show Orders and Cart
    expect(screen.getByText('Orders')).toBeInTheDocument();
    expect(screen.getByText('Cart')).toBeInTheDocument();
    
    // Should show cart badge
    // In Navbar it's rendered as text content '3' inside the badge
    const badgeEle = screen.getByText('3');
    expect(badgeEle).toBeInTheDocument();
    expect(badgeEle).toHaveClass('cart-badge');
    
    // Login/Register should not be there
    expect(screen.queryByText('Login')).not.toBeInTheDocument();
    expect(screen.queryByText('Sign Up')).not.toBeInTheDocument();
  });

  it('calls logout and navigates to home when logout is clicked', () => {
    const mockLogout = vi.fn();
    AuthContext.useAuth.mockReturnValue({ 
      isAuthenticated: true, 
      user: { name: 'Jane' },
      logout: mockLogout
    });
    CartContext.useCart.mockReturnValue({ itemCount: 0 });

    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText('Logout'));
    expect(mockLogout).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});
