const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create categories
  const electronics = await prisma.category.upsert({
    where: { slug: 'electronics' },
    update: {},
    create: { name: 'Electronics', slug: 'electronics' },
  });

  const clothing = await prisma.category.upsert({
    where: { slug: 'clothing' },
    update: {},
    create: { name: 'Clothing', slug: 'clothing' },
  });

  const homeGarden = await prisma.category.upsert({
    where: { slug: 'home-garden' },
    update: {},
    create: { name: 'Home & Garden', slug: 'home-garden' },
  });

  console.log('✅ Categories created');

  // Create products
  const products = [
    {
      name: 'Wireless Noise-Cancelling Headphones',
      description: 'Premium over-ear headphones with 30-hour battery life and active noise cancellation.',
      price: 299.99,
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
      stock: 50,
      rating: 4.8,
      reviewCount: 1243,
      categoryId: electronics.id,
    },
    {
      name: 'Smart Watch Pro',
      description: 'Feature-rich smartwatch with health tracking, GPS, and 5-day battery.',
      price: 399.99,
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
      stock: 30,
      rating: 4.6,
      reviewCount: 856,
      categoryId: electronics.id,
    },
    {
      name: 'Portable Bluetooth Speaker',
      description: 'Waterproof speaker with 360° sound and 20-hour playtime.',
      price: 89.99,
      imageUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400',
      stock: 75,
      rating: 4.5,
      reviewCount: 632,
      categoryId: electronics.id,
    },
    {
      name: '4K Ultra HD Monitor',
      description: '27-inch IPS display with 144Hz refresh rate and USB-C connectivity.',
      price: 549.99,
      imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400',
      stock: 20,
      rating: 4.7,
      reviewCount: 421,
      categoryId: electronics.id,
    },
    {
      name: 'Mechanical Keyboard',
      description: 'Tenkeyless mechanical keyboard with RGB backlight and tactile switches.',
      price: 149.99,
      imageUrl: 'https://images.unsplash.com/photo-1601445638532-1f626ed2227e?w=400',
      stock: 45,
      rating: 4.9,
      reviewCount: 987,
      categoryId: electronics.id,
    },
    {
      name: 'Classic Oxford Shirt',
      description: 'Slim-fit cotton Oxford shirt, perfect for business casual.',
      price: 59.99,
      imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400',
      stock: 100,
      rating: 4.3,
      reviewCount: 312,
      categoryId: clothing.id,
    },
    {
      name: 'Premium Running Shoes',
      description: 'Lightweight and responsive running shoes with gel cushioning.',
      price: 129.99,
      imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
      stock: 60,
      rating: 4.6,
      reviewCount: 754,
      categoryId: clothing.id,
    },
    {
      name: 'Insulated Water Bottle',
      description: 'Stainless steel bottle keeps drinks cold 24hrs, hot 12hrs. 32oz capacity.',
      price: 34.99,
      imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400',
      stock: 120,
      rating: 4.7,
      reviewCount: 1567,
      categoryId: homeGarden.id,
    },
    {
      name: 'Minimalist Desk Lamp',
      description: 'LED desk lamp with adjustable arm, 5 color modes and USB charging port.',
      price: 49.99,
      imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400',
      stock: 80,
      rating: 4.4,
      reviewCount: 289,
      categoryId: homeGarden.id,
    },
    {
      name: 'Indoor Plant Pot Set',
      description: 'Set of 3 ceramic planters in modern minimalist design with drainage holes.',
      price: 39.99,
      imageUrl: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400',
      stock: 90,
      rating: 4.5,
      reviewCount: 445,
      categoryId: homeGarden.id,
    },
    {
      name: 'Ergonomic Office Chair',
      description: 'Lumbar support mesh chair with adjustable armrests and seat height.',
      price: 349.99,
      imageUrl: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=400',
      stock: 25,
      rating: 4.6,
      reviewCount: 678,
      categoryId: homeGarden.id,
    },
    {
      name: 'Casual Hoodie',
      description: 'Soft fleece hoodie with kangaroo pocket, available in multiple colors.',
      price: 69.99,
      imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=400',
      stock: 85,
      rating: 4.4,
      reviewCount: 523,
      categoryId: clothing.id,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { id: products.indexOf(product) + 1 },
      update: product,
      create: product,
    });
  }

  console.log('✅ Products seeded');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  await prisma.user.upsert({
    where: { email: 'admin@shopsmart.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@shopsmart.com',
      password: adminPassword,
      role: 'admin',
    },
  });

  // Create demo user with cart
  const demoPassword = await bcrypt.hash('demo1234', 12);
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@shopsmart.com' },
    update: {},
    create: {
      name: 'Demo User',
      email: 'demo@shopsmart.com',
      password: demoPassword,
      role: 'user',
    },
  });

  // Create demo cart
  await prisma.cart.upsert({
    where: { userId: demoUser.id },
    update: {},
    create: { userId: demoUser.id },
  });

  console.log('✅ Users seeded');
  console.log('\n🎉 Seed complete!');
  console.log('   Admin: admin@shopsmart.com / admin123');
  console.log('   Demo:  demo@shopsmart.com / demo1234');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
