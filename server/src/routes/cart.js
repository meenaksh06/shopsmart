const express = require('express');
const { body } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/cart — get the current user's cart
router.get('/', authenticate, async (req, res, next) => {
  try {
    const cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: {
        items: {
          include: {
            product: {
              include: { category: { select: { id: true, name: true } } },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!cart) {
      // Create cart if it doesn't exist (e.g. edge case)
      const newCart = await prisma.cart.create({
        data: { userId: req.user.id },
        include: { items: true },
      });
      return res.json({ cart: newCart });
    }

    const total = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    res.json({ cart, total: parseFloat(total.toFixed(2)) });
  } catch (error) {
    next(error);
  }
});

// POST /api/cart/items — add item to cart
router.post(
  '/items',
  authenticate,
  [
    body('productId').isInt({ min: 1 }).withMessage('Valid product ID is required'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { productId, quantity } = req.body;

      // Ensure product exists and has enough stock
      const product = await prisma.product.findUnique({ where: { id: parseInt(productId) } });
      if (!product) return res.status(404).json({ error: 'Product not found' });
      if (product.stock < quantity) {
        return res.status(400).json({ error: `Only ${product.stock} units in stock` });
      }

      // Get or create cart
      let cart = await prisma.cart.findUnique({ where: { userId: req.user.id } });
      if (!cart) {
        cart = await prisma.cart.create({ data: { userId: req.user.id } });
      }

      // Upsert cart item
      const cartItem = await prisma.cartItem.upsert({
        where: { cartId_productId: { cartId: cart.id, productId: parseInt(productId) } },
        update: { quantity: { increment: parseInt(quantity) } },
        create: { cartId: cart.id, productId: parseInt(productId), quantity: parseInt(quantity) },
        include: { product: true },
      });

      res.status(201).json({ cartItem });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/cart/items/:id — update quantity
router.put(
  '/items/:id',
  authenticate,
  [body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')],
  validate,
  async (req, res, next) => {
    try {
      const cartItemId = parseInt(req.params.id);
      const { quantity } = req.body;

      // Verify item belongs to the current user's cart
      const existing = await prisma.cartItem.findFirst({
        where: { id: cartItemId, cart: { userId: req.user.id } },
        include: { product: true },
      });
      if (!existing) return res.status(404).json({ error: 'Cart item not found' });
      if (existing.product.stock < quantity) {
        return res.status(400).json({ error: `Only ${existing.product.stock} units in stock` });
      }

      const cartItem = await prisma.cartItem.update({
        where: { id: cartItemId },
        data: { quantity: parseInt(quantity) },
        include: { product: true },
      });
      res.json({ cartItem });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/cart/items/:id — remove item from cart
router.delete('/items/:id', authenticate, async (req, res, next) => {
  try {
    const cartItemId = parseInt(req.params.id);

    const existing = await prisma.cartItem.findFirst({
      where: { id: cartItemId, cart: { userId: req.user.id } },
    });
    if (!existing) return res.status(404).json({ error: 'Cart item not found' });

    await prisma.cartItem.delete({ where: { id: cartItemId } });
    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/cart — clear the cart
router.delete('/', authenticate, async (req, res, next) => {
  try {
    const cart = await prisma.cart.findUnique({ where: { userId: req.user.id } });
    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }
    res.json({ message: 'Cart cleared' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
