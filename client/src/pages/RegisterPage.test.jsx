import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import RegisterPage from './RegisterPage';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

// Mock useAuth and useCart
vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));
vi.mock('../context/CartContext', () => ({
  useCart: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('RegisterPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders registration form correctly', () => {
    useAuth.mockReturnValue({ isAuthenticated: false, register: vi.fn() });
    useCart.mockReturnValue({ fetchCart: vi.fn() });

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Create Account/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign Up/i })).toBeInTheDocument();
  });

  it('redirects to products if already authenticated', () => {
    useAuth.mockReturnValue({ isAuthenticated: true, register: vi.fn() });
    useCart.mockReturnValue({ fetchCart: vi.fn() });

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    expect(mockNavigate).toHaveBeenCalledWith('/products', { replace: true });
  });

  it('shows error if password is too short', async () => {
    useAuth.mockReturnValue({ isAuthenticated: false, register: vi.fn() });
    useCart.mockReturnValue({ fetchCart: vi.fn() });

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: '123' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Sign Up/i }));

    expect(await screen.findByText(/Password must be at least 6 characters long/i)).toBeInTheDocument();
  });

  it('successfully registers and redirects', async () => {
    const mockRegister = vi.fn().mockResolvedValue({ success: true });
    const mockFetchCart = vi.fn().mockResolvedValue();
    
    useAuth.mockReturnValue({ isAuthenticated: false, register: mockRegister });
    useCart.mockReturnValue({ fetchCart: mockFetchCart });

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Sign Up/i }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith('John Doe', 'john@example.com', 'password123');
      expect(mockFetchCart).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/products', { replace: true });
    });
  });

  it('shows error message on registration failure', async () => {
    const mockRegister = vi.fn().mockResolvedValue({ success: false, error: 'Email already exists' });
    
    useAuth.mockReturnValue({ isAuthenticated: false, register: mockRegister });
    useCart.mockReturnValue({ fetchCart: vi.fn() });

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Sign Up/i }));

    expect(await screen.findByText(/Email already exists/i)).toBeInTheDocument();
  });
});
