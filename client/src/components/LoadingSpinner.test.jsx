import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';
import LoadingSpinner from './LoadingSpinner';

describe('LoadingSpinner Component', () => {
  it('renders the spinner with correct accessibility attributes', () => {
    render(<LoadingSpinner />);
    const wrapper = screen.getByRole('status');
    expect(wrapper).toBeInTheDocument();
    expect(wrapper).toHaveAttribute('aria-live', 'polite');
  });

  it('renders with custom text when provided', () => {
    const testText = 'Searching for items...';
    render(<LoadingSpinner text={testText} />);
    expect(screen.getByText(testText)).toBeInTheDocument();
  });

  it('applies correct class for small size', () => {
    const { container } = render(<LoadingSpinner size="sm" />);
    const spinner = container.querySelector('.spinner');
    expect(spinner).toHaveClass('spinner-sm');
  });

  it('applies correct class for large size', () => {
    const { container } = render(<LoadingSpinner size="lg" />);
    const spinner = container.querySelector('.spinner');
    expect(spinner).toHaveClass('spinner-lg');
  });

  it('default size applies no extra size class', () => {
    const { container } = render(<LoadingSpinner size="md" />);
    const spinner = container.querySelector('.spinner');
    expect(spinner).not.toHaveClass('spinner-sm');
    expect(spinner).not.toHaveClass('spinner-lg');
  });
});
