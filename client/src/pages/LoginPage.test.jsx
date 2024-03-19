import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import LoginPage from './LoginPage';
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
  return { 
    ...actual, 
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: null })
  };
});

describe('LoginPage Component', () => {
  it('renders login form', () => {
    AuthContext.useAuth.mockReturnValue({ isAuthenticated: false, login: vi.fn() });
    CartContext.useCart.mockReturnValue({ fetchCart: vi.fn() });

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Log In' })).toBeInTheDocument();
  });

  it('submits form data correctly', async () => {
    const mockLogin = vi.fn().mockResolvedValue({ success: true });
    const mockFetchCart = vi.fn().mockResolvedValue();
    
    AuthContext.useAuth.mockReturnValue({ isAuthenticated: false, login: mockLogin });
    CartContext.useCart.mockReturnValue({ fetchCart: mockFetchCart });

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Log In' }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(mockFetchCart).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/products', { replace: true });
    });
  });

  it('displays error on failed login', async () => {
    const mockLogin = vi.fn().mockResolvedValue({ success: false, error: 'Invalid credentials' });
    
    AuthContext.useAuth.mockReturnValue({ isAuthenticated: false, login: mockLogin });
    CartContext.useCart.mockReturnValue({ fetchCart: vi.fn() });

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'wrong' } });
    fireEvent.click(screen.getByRole('button', { name: 'Log In' }));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });
});
