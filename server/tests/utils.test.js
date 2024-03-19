const {
  formatPrice,
  calculateOrderTotal,
  calculateCartTotal,
  slugify,
  paginate,
} = require('../src/utils/helpers');

describe('formatPrice', () => {
  it('formats a regular number correctly', () => {
    expect(formatPrice(29.99)).toBe('$29.99');
  });

  it('formats zero correctly', () => {
    expect(formatPrice(0)).toBe('$0.00');
  });

  it('rounds to 2 decimal places', () => {
    expect(formatPrice(10.5)).toBe('$10.50');
  });

  it('returns $0.00 for NaN', () => {
    expect(formatPrice(NaN)).toBe('$0.00');
  });

  it('returns $0.00 for non-number input', () => {
    expect(formatPrice('abc')).toBe('$0.00');
    expect(formatPrice(undefined)).toBe('$0.00');
    expect(formatPrice(null)).toBe('$0.00');
  });
});

describe('calculateOrderTotal', () => {
  it('sums items correctly', () => {
    const items = [
      { price: 10, quantity: 2 },
      { price: 5, quantity: 3 },
    ];
    expect(calculateOrderTotal(items)).toBe(35);
  });

  it('returns 0 for empty array', () => {
    expect(calculateOrderTotal([])).toBe(0);
  });

  it('returns 0 for non-array input', () => {
    expect(calculateOrderTotal(null)).toBe(0);
    expect(calculateOrderTotal(undefined)).toBe(0);
  });

  it('handles items with invalid values gracefully', () => {
    const items = [{ price: 'bad', quantity: 2 }];
    expect(calculateOrderTotal(items)).toBe(0);
  });
});

describe('calculateCartTotal', () => {
  it('sums cart items using product.price', () => {
    const items = [
      { product: { price: 20 }, quantity: 2 },
      { product: { price: 10 }, quantity: 1 },
    ];
    expect(calculateCartTotal(items)).toBe(50);
  });

  it('returns 0 for empty cart', () => {
    expect(calculateCartTotal([])).toBe(0);
  });

  it('handles missing product price', () => {
    const items = [{ product: {}, quantity: 2 }];
    expect(calculateCartTotal(items)).toBe(0);
  });
});

describe('slugify', () => {
  it('converts string to slug format', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('handles special characters', () => {
    expect(slugify('Home & Garden!')).toBe('home-garden');
  });

  it('collapses multiple hyphens', () => {
    expect(slugify('foo   bar')).toBe('foo-bar');
  });

  it('trims whitespace', () => {
    expect(slugify('  hello  ')).toBe('hello');
  });
});

describe('paginate', () => {
  it('returns correct skip and take values', () => {
    const result = paginate(1, 10);
    expect(result.skip).toBe(0);
    expect(result.take).toBe(10);
  });

  it('calculates skip correctly for page 2', () => {
    const result = paginate(2, 10);
    expect(result.skip).toBe(10);
  });

  it('caps limit at 100', () => {
    const result = paginate(1, 999);
    expect(result.take).toBe(100);
  });

  it('ensures minimum page of 1', () => {
    const result = paginate(-5, 10);
    expect(result.page).toBe(1);
    expect(result.skip).toBe(0);
  });

  it('handles non-numeric strings with defaults', () => {
    const result = paginate('abc', 'xyz');
    expect(result.page).toBe(1);
    expect(result.take).toBe(10);
  });
});
