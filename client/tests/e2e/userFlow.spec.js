import { test, expect } from '@playwright/test';

test.describe('ShopSmart E2E User Flow', () => {
  test('Complete purchase flow: Register -> Browse -> Add to Cart -> Checkout', async ({ page }) => {
    // Start at home
    await page.goto('/');
    await expect(page).toHaveTitle(/ShopSmart/);
    
    // 1. Register a new user
    await page.click('text=Sign Up');
    await expect(page.locator('h1')).toContainText('Create Account');
    
    const uniqueEmail = `e2e_user_${Date.now()}@example.com`;
    await page.fill('input[type="text"]', 'E2E User');
    await page.fill('input[type="email"]', uniqueEmail);
    await page.fill('input[type="password"]', 'testpass123');
    
    // Listen for the network request to mock if needed, or hit actual dev backend
    await page.click('button[type="submit"]');
    
    // Should redirect to products
    await expect(page).toHaveURL(/\/products/);
    await expect(page.locator('h1')).toContainText('All Products');
    
    // Wait for products to load
    await page.waitForSelector('.product-card');
    
    // 2. Add product to cart
    const firstProductCartBtn = page.locator('.product-card button').first();
    await expect(firstProductCartBtn).toContainText('Add to Cart');
    await firstProductCartBtn.click();
    
    // Wait for success visual feedback (Added checkmark)
    await expect(firstProductCartBtn).toContainText('Added');
    
    // Cart badge should exist and show 1
    const cartBadge = page.locator('.cart-badge');
    await expect(cartBadge).toHaveText('1');
    
    // 3. Go to Cart
    await page.click('text=Cart');
    await expect(page).toHaveURL(/\/cart/);
    await expect(page.locator('h1')).toContainText('Your Cart');
    
    // Check item is in cart
    await expect(page.locator('.cart-item')).toHaveCount(1);
    
    // 4. Checkout
    await page.click('id=checkout-btn');
    await expect(page).toHaveURL(/\/checkout/);
    await expect(page.locator('h1')).toContainText('Checkout');
    
    // 5. Place Order
    // Form should have default values we mocked
    await page.click('id=place-order-btn');
    
    // Wait for redirect to order detail page with success param
    await expect(page).toHaveURL(/\/orders\/\d+\?success=true/);
    
    // Success toast and order confirmation
    await expect(page.locator('.toast-success')).toBeVisible();
    await expect(page.locator('h1')).toContainText('Order #');
    
    // 6. Check order history
    await page.click('text=Orders');
    await expect(page).toHaveURL(/\/orders/);
    await expect(page.locator('.order-card')).toHaveCount(1);
  });
});
