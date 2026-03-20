const express = require('express');
const { body, query } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { paginate } = require('../utils/helpers');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/products
router.get('/', async (req, res, next) => {
  try {
    const { search, categoryId, minPrice, maxPrice, sortBy = 'createdAt', order = 'desc', page = 1, limit = 12 } = req.query;
    const { skip, take } = paginate(page, limit);

    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }
    if (categoryId) where.categoryId = parseInt(categoryId);
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    const allowedSortFields = ['price', 'rating', 'createdAt', 'name'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take,
        orderBy: { [sortField]: order === 'asc' ? 'asc' : 'desc' },
        include: { category: { select: { id: true, name: true, slug: true } } },
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      products,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / take) },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/products/categories
router.get('/categories', async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
    res.json({ categories });
  } catch (error) {
    next(error);
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { category: true },
    });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ product });
  } catch (error) {
    next(error);
  }
});

// POST /api/products (admin only)
router.post(
  '/',
  authenticate,
  authorize(['admin']),
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
    body('categoryId').isInt().withMessage('Category ID must be an integer'),
    body('imageUrl').trim().notEmpty().withMessage('Image URL is required'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { name, description, price, stock, categoryId, imageUrl, rating, reviewCount } = req.body;
      const product = await prisma.product.create({
        data: {
          name,
          description,
          price: parseFloat(price),
          stock: parseInt(stock),
          categoryId: parseInt(categoryId),
          imageUrl,
          rating: parseFloat(rating) || 0,
          reviewCount: parseInt(reviewCount) || 0,
        },
        include: { category: true },
      });
      res.status(201).json({ product });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/products/:id (admin only)
router.put(
  '/:id',
  authenticate,
  authorize(['admin']),
  [
    body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { name, description, price, stock, categoryId, imageUrl, rating, reviewCount } = req.body;
      const data = {};
      if (name !== undefined) data.name = name;
      if (description !== undefined) data.description = description;
      if (price !== undefined) data.price = parseFloat(price);
      if (stock !== undefined) data.stock = parseInt(stock);
      if (categoryId !== undefined) data.categoryId = parseInt(categoryId);
      if (imageUrl !== undefined) data.imageUrl = imageUrl;
      if (rating !== undefined) data.rating = parseFloat(rating);
      if (reviewCount !== undefined) data.reviewCount = parseInt(reviewCount);

      const product = await prisma.product.update({
        where: { id: parseInt(req.params.id) },
        data,
        include: { category: true },
      });
      res.json({ product });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/products/:id (admin only)
router.delete('/:id', authenticate, authorize(['admin']), async (req, res, next) => {
  try {
    await prisma.product.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
