const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Clear existing data (Order matters due to foreign keys)
  console.log('🧹 Clearing existing data...');
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.brand.deleteMany();

  // 2. Create Brands
  console.log('🏢 Creating Brands...');
  const brands = await Promise.all([
    prisma.brand.create({
      data: { name: 'Apple', slug: 'apple', description: 'Innovative consumer electronics.' }
    }),
    prisma.brand.create({
      data: { name: 'Sony', slug: 'sony', description: 'Premium audio and visual entertainment.' }
    }),
    prisma.brand.create({
      data: { name: 'Samsung', slug: 'samsung', description: 'Cutting-edge smart devices and displays.' }
    }),
    prisma.brand.create({
      data: { name: 'Logitech', slug: 'logitech', description: 'High-performance peripherals.' }
    })
  ]);

  // 3. Create Categories
  console.log('📂 Creating Categories...');
  const categories = await Promise.all([
    prisma.category.create({
      data: { name: 'Laptops', slug: 'laptops' }
    }),
    prisma.category.create({
      data: { name: 'Smartphones', slug: 'smartphones' }
    }),
    prisma.category.create({
      data: { name: 'Audio', slug: 'audio' }
    }),
    prisma.category.create({
      data: { name: 'Accessories', slug: 'accessories' }
    })
  ]);

  // 4. Create Products
  console.log('💻 Creating Products...');
  
  const productsToCreate = [
    {
      name: 'MacBook Pro 16" M3 Max',
      slug: 'macbook-pro-16-m3-max',
      description: 'The most advanced Mac laptop ever. Mind-blowing performance for pro workflows.',
      price: 3499.00,
      stock: 15,
      brandId: brands[0].id, // Apple
      categoryId: categories[0].id, // Laptops
      images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80'],
    },
    {
      name: 'Sony WH-1000XM5 Noise Cancelling Headphones',
      slug: 'sony-wh-1000xm5',
      description: 'Industry-leading noise cancellation with spectacular audio quality.',
      price: 398.00,
      discountPrice: 348.00, // Special offer
      stock: 50,
      brandId: brands[1].id, // Sony
      categoryId: categories[2].id, // Audio
      images: ['https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=800&q=80'],
    },
    {
      name: 'Samsung Galaxy S24 Ultra',
      slug: 'samsung-galaxy-s24-ultra',
      description: 'The ultimate smartphone experience with built-in AI features and S Pen.',
      price: 1299.99,
      stock: 30,
      brandId: brands[2].id, // Samsung
      categoryId: categories[1].id, // Smartphones
      images: ['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=800&q=80'],
    },
    {
      name: 'Logitech MX Master 3S',
      slug: 'logitech-mx-master-3s',
      description: 'An iconic mouse remastered for ultimate tactility, performance, and flow.',
      price: 99.99,
      stock: 100,
      brandId: brands[3].id, // Logitech
      categoryId: categories[3].id, // Accessories
      images: ['https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80'],
    },
    {
      name: 'Apple AirPods Pro (2nd Gen)',
      slug: 'apple-airpods-pro-2',
      description: 'Rich, high-quality audio and magic like you’ve never heard.',
      price: 249.00,
      discountPrice: 199.00, // Special offer
      stock: 75,
      brandId: brands[0].id, // Apple
      categoryId: categories[2].id, // Audio
      images: ['https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&w=800&q=80'],
    },
    {
      name: 'Sony PlayStation 5 Console',
      slug: 'sony-playstation-5',
      description: 'Experience lightning-fast loading and ultra-high-speed SSD.',
      price: 499.99,
      stock: 10,
      brandId: brands[1].id, // Sony
      categoryId: categories[3].id, // Accessories (close enough for now)
      images: ['https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80'],
    },
    {
      name: 'Samsung 49" Odyssey G9 Gaming Monitor',
      slug: 'samsung-odyssey-g9',
      description: 'Unmatched visual experience with this ultra-wide curved gaming monitor.',
      price: 1499.99,
      discountPrice: 1299.99, // Special offer
      stock: 5,
      brandId: brands[2].id, // Samsung
      categoryId: categories[3].id, // Accessories
      images: ['https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80'],
    }
  ];

  for (const p of productsToCreate) {
    await prisma.product.create({ data: p });
  }

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
