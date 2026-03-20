import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Toast from './Toast';

describe('Toast Component', () => {
  it('renders with message and default type', () => {
    render(<Toast message="Test message" onClose={() => {}} />);
    const toast = screen.getByRole('alert');
    expect(toast).toBeInTheDocument();
    expect(toast).toHaveClass('toast-success');
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('renders with error type', () => {
    render(<Toast message="Error occurred" type="error" onClose={() => {}} />);
    const toast = screen.getByRole('alert');
    expect(toast).toHaveClass('toast-error');
  });

  it('calls onClose when close button is clicked', async () => {
    const onClose = vi.fn();
    render(<Toast message="Close me" onClose={onClose} />);
    const closeButton = screen.getByLabelText(/close notification/i);
    await act(async () => {
      closeButton.click();
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose automatically after timeout', () => {
    vi.useFakeTimers();
    const onClose = vi.fn();
    render(<Toast message="Auto close" onClose={onClose} />);
    
    act(() => {
      vi.advanceTimersByTime(3500);
    });
    
    expect(onClose).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
});
