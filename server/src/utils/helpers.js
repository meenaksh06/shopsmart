const formatPrice = (price) => {
  if (typeof price !== 'number' || isNaN(price)) {return '$0.00';}
  return `$${price.toFixed(2)}`;
};

const calculateOrderTotal = (items) => {
  if (!Array.isArray(items)) {return 0;}
  return items.reduce((sum, item) => {
    const price = typeof item.price === 'number' ? item.price : 0;
    const qty = typeof item.quantity === 'number' ? item.quantity : 0;
    return sum + price * qty;
  }, 0);
};

const calculateCartTotal = (cartItems) => {
  if (!Array.isArray(cartItems)) {return 0;}
  return cartItems.reduce((sum, item) => {
    const price = item.product?.price ?? 0;
    const qty = item.quantity ?? 0;
    return sum + price * qty;
  }, 0);
};

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
};

const paginate = (page = 1, limit = 10) => {
  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (parsedPage - 1) * parsedLimit;
  return { skip, take: parsedLimit, page: parsedPage, limit: parsedLimit };
};

module.exports = {
  formatPrice,
  calculateOrderTotal,
  calculateCartTotal,
  slugify,
  paginate,
};
