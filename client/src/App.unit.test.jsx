import { render, screen, cleanup, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

describe('App Component - Unit Tests', () => {
    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    test('1. Renders the main heading "ShopSmart"', () => {
        // Mock fetch to prevent network requests during pure UI testing
        vi.stubGlobal('fetch', vi.fn(() => new Promise(() => { })));
        render(<App />);
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('ShopSmart');
    });

    test('2. Initial state shows "Loading backend status..."', () => {
        vi.stubGlobal('fetch', vi.fn(() => new Promise(() => { })));
        render(<App />);
        expect(screen.getByText('Loading backend status...')).toBeInTheDocument();
    });

    test('3. Renders the card heading "Backend Status"', () => {
        vi.stubGlobal('fetch', vi.fn(() => new Promise(() => { })));
        render(<App />);
        expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Backend Status');
    });

    test('4. Ensures the layout container div is present', () => {
        vi.stubGlobal('fetch', vi.fn(() => new Promise(() => { })));
        const { container } = render(<App />);
        expect(container.querySelector('.container')).toBeInTheDocument();
    });

    test('5. Verifies the hint text is correctly rendered', () => {
        vi.stubGlobal('fetch', vi.fn(() => new Promise(() => { })));
        render(<App />);
        expect(screen.getByText(/save to test HMR/i)).toBeInTheDocument();
    });

    test('6. Checks that hint text contains a code tag', () => {
        vi.stubGlobal('fetch', vi.fn(() => new Promise(() => { })));
        render(<App />);
        const hintElement = screen.getByText(/save to test HMR/i);
        expect(hintElement.querySelector('code')).toBeInTheDocument();
        expect(hintElement.querySelector('code')).toHaveTextContent('src/App.jsx');
    });

    test('7. App renders without crashing', () => {
        vi.stubGlobal('fetch', vi.fn(() => new Promise(() => { })));
        const { unmount } = render(<App />);
        expect(() => unmount()).not.toThrow();
    });

    test('8. Status block is missing before data loads', () => {
        vi.stubGlobal('fetch', vi.fn(() => new Promise(() => { })));
        render(<App />);
        expect(screen.queryByText(/Status:/)).not.toBeInTheDocument();
        expect(screen.queryByText(/Message:/)).not.toBeInTheDocument();
        expect(screen.queryByText(/Timestamp:/)).not.toBeInTheDocument();
    });

    test('9. Verify console.error is called when fetch fails', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
        vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('Network error'))));

        render(<App />);

        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith('Error fetching health check:', expect.any(Error));
        });

        consoleSpy.mockRestore();
    });

    test('10. Validates CSS classes applied on initial render', () => {
        vi.stubGlobal('fetch', vi.fn(() => new Promise(() => { })));
        const { container } = render(<App />);
        expect(container.querySelector('.card')).toBeInTheDocument();
        expect(container.querySelector('.hint')).toBeInTheDocument();
    });
});
