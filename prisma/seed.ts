import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...\n');

  // ─── Clean existing data ───
  await prisma.activeDesign.deleteMany();
  await prisma.designItem.deleteMany();
  await prisma.designShelf.deleteMany();
  await prisma.savedDesign.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // ─── Create Admin User ───
  const adminEmail = process.env.ADMIN_SEED_EMAIL || 'admin@example.com';
  const adminPassword = process.env.ADMIN_SEED_PASSWORD || 'admin123';
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      passwordHash,
      name: 'Administrator',
      role: 'admin',
    },
  });
  console.log(`  ✅ Admin user: ${admin.email} (role: ${admin.role})`);

  // ─── Create Categories ───
  const categoriesData = [
    { name: 'Produce', icon: '🥬', color: '#4CAF50' },
    { name: 'Meat', icon: '🥩', color: '#F44336' },
    { name: 'Deli', icon: '🧀', color: '#FF9800' },
    { name: 'Dairy', icon: '🥛', color: '#2196F3' },
    { name: 'Bakery', icon: '🍞', color: '#795548' },
    { name: 'Grocery', icon: '🛒', color: '#9E9E9E' },
  ];

  const categories: Record<string, any> = {};
  for (const cat of categoriesData) {
    categories[cat.name] = await prisma.category.create({ data: cat });
  }
  console.log(`  ✅ ${categoriesData.length} categories created`);

  // ─── Create Products ───
  const productsData = [
    // Produce
    { name: 'Banana', category: 'Produce', defaultWidth: 3, emoji: '🍌' },
    { name: 'Apple', category: 'Produce', defaultWidth: 3, emoji: '🍎' },
    { name: 'Cherry', category: 'Produce', defaultWidth: 3, emoji: '🍒' },
    { name: 'Kiwi', category: 'Produce', defaultWidth: 2, emoji: '🥝' },
    { name: 'Grape', category: 'Produce', defaultWidth: 2, emoji: '🍇' },
    { name: 'Fig', category: 'Produce', defaultWidth: 1, emoji: '🫒' },
    { name: 'Honeydew', category: 'Produce', defaultWidth: 3, emoji: '🍈' },
    { name: 'Dates', category: 'Produce', defaultWidth: 2, emoji: '🫐' },
    { name: 'Lemon', category: 'Produce', defaultWidth: 1, emoji: '🍋' },
    { name: 'Mango', category: 'Produce', defaultWidth: 3, emoji: '🥭' },

    // Meat
    { name: 'Chicken Breast', category: 'Meat', defaultWidth: 3, emoji: '🍗' },
    { name: 'Ground Beef', category: 'Meat', defaultWidth: 3, emoji: '🥩' },
    { name: 'Pork Chop', category: 'Meat', defaultWidth: 3, emoji: '🍖' },
    { name: 'Salmon Fillet', category: 'Meat', defaultWidth: 2, emoji: '🐟' },
    { name: 'Turkey Breast', category: 'Meat', defaultWidth: 3, emoji: '🦃' },

    // Deli
    { name: 'Smoked Turkey Sliced', category: 'Deli', defaultWidth: 3, emoji: '🥪' },
    { name: 'Bacon', category: 'Deli', defaultWidth: 2, emoji: '🥓' },
    { name: 'Salami', category: 'Deli', defaultWidth: 1, emoji: '🍖' },
    { name: 'Provolone Cheese', category: 'Deli', defaultWidth: 2, emoji: '🧀' },
    { name: 'Ham', category: 'Deli', defaultWidth: 3, emoji: '🍖' },

    // Dairy
    { name: 'Milk Gallon', category: 'Dairy', defaultWidth: 3, emoji: '🥛' },
    { name: 'Half Gallon Milk', category: 'Dairy', defaultWidth: 2, emoji: '🥛' },
    { name: 'Sour Cream', category: 'Dairy', defaultWidth: 2, emoji: '🫗' },
    { name: 'Yogurt', category: 'Dairy', defaultWidth: 1, emoji: '🍦' },
    { name: 'Butter', category: 'Dairy', defaultWidth: 1, emoji: '🧈' },
    { name: 'Heavy Cream', category: 'Dairy', defaultWidth: 2, emoji: '🥛' },

    // Bakery
    { name: 'Sourdough Bread', category: 'Bakery', defaultWidth: 3, emoji: '🍞' },
    { name: 'Croissant', category: 'Bakery', defaultWidth: 2, emoji: '🥐' },
    { name: 'Bagel', category: 'Bakery', defaultWidth: 1, emoji: '🥯' },
    { name: 'Blueberry Muffin', category: 'Bakery', defaultWidth: 1, emoji: '🧁' },
    { name: 'Baguette', category: 'Bakery', defaultWidth: 3, emoji: '🥖' },

    // Grocery
    { name: 'Canned Beans', category: 'Grocery', defaultWidth: 1, emoji: '🥫' },
    { name: 'Pasta', category: 'Grocery', defaultWidth: 2, emoji: '🍝' },
    { name: 'Rice', category: 'Grocery', defaultWidth: 2, emoji: '🍚' },
    { name: 'Olive Oil', category: 'Grocery', defaultWidth: 1, emoji: '🫒' },
    { name: 'Cereal', category: 'Grocery', defaultWidth: 3, emoji: '🥣' },
    { name: 'Peanut Butter', category: 'Grocery', defaultWidth: 1, emoji: '🥜' },
  ];

  const products: Record<string, any> = {};
  for (const p of productsData) {
    products[p.name] = await prisma.product.create({
      data: {
        name: p.name,
        categoryId: categories[p.category].id,
        defaultWidth: p.defaultWidth,
        isActive: true,
      },
    });
  }
  console.log(`  ✅ ${productsData.length} products created`);

  // ─── Create Default Design for Admin ───
  const defaultDesign = await prisma.savedDesign.create({
    data: {
      name: 'Default Layout',
      description: 'Default starting layout',
      userId: admin.id,
    },
  });

  // Create 5 shelves
  const shelfNames = ['Shelf 1', 'Shelf 2', 'Shelf 3', 'Shelf 4', 'Shelf 5'];
  const shelves: any[] = [];
  for (let i = 0; i < shelfNames.length; i++) {
    const shelf = await prisma.designShelf.create({
      data: {
        name: shelfNames[i],
        position: i,
        designId: defaultDesign.id,
      },
    });
    shelves.push(shelf);
  }

  // Place products on shelves
  const shelfPlacements = [
    { shelf: 0, items: ['Banana', 'Apple', 'Cherry', 'Dates'] },
    { shelf: 1, items: ['Chicken Breast', 'Ground Beef', 'Salmon Fillet'] },
    { shelf: 2, items: ['Milk Gallon', 'Sour Cream', 'Butter', 'Yogurt'] },
    { shelf: 3, items: ['Sourdough Bread', 'Croissant', 'Bagel', 'Blueberry Muffin'] },
    { shelf: 4, items: ['Pasta', 'Rice', 'Olive Oil', 'Cereal'] },
  ];

  for (const placement of shelfPlacements) {
    const shelf = shelves[placement.shelf];
    let gridPos = 0;
    for (const itemName of placement.items) {
      const product = products[itemName];
      if (!product) continue;
      const width = product.defaultWidth;

      // Skip if this would overflow the 12-grid (shouldn't happen with our data)
      if (gridPos + width > 12) break;

      await prisma.designItem.create({
        data: {
          designShelfId: shelf.id,
          productId: product.id,
          gridPosition: gridPos,
          occupiedWidth: width,
          quantity: 1,
        },
      });
      gridPos += width;
    }
  }

  // Set as active design for admin
  await prisma.activeDesign.create({
    data: {
      userId: admin.id,
      designId: defaultDesign.id,
    },
  });

  console.log(`  ✅ Default design created: 5 shelves with products placed`);
  console.log(`\n🎉 Seeding complete!`);
  console.log(`\nLogin credentials:`);
  console.log(`  Admin: ${adminEmail} / ${adminPassword}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });