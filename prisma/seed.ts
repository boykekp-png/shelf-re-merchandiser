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
    { name: 'Banana', category: 'Produce', emoji: '🍌' },
    { name: 'Apple', category: 'Produce', emoji: '🍎' },
    { name: 'Cherry', category: 'Produce', emoji: '🍒' },
    { name: 'Kiwi', category: 'Produce', emoji: '🥝' },
    { name: 'Grape', category: 'Produce', emoji: '🍇' },
    { name: 'Fig', category: 'Produce', emoji: '🫒' },
    { name: 'Honeydew', category: 'Produce', emoji: '🍈' },
    { name: 'Dates', category: 'Produce', emoji: '🫐' },
    { name: 'Lemon', category: 'Produce', emoji: '🍋' },
    { name: 'Mango', category: 'Produce', emoji: '🥭' },

    // Meat
    { name: 'Chicken Breast', category: 'Meat', emoji: '🍗' },
    { name: 'Ground Beef', category: 'Meat', emoji: '🥩' },
    { name: 'Pork Chop', category: 'Meat', emoji: '🍖' },
    { name: 'Salmon Fillet', category: 'Meat', emoji: '🐟' },
    { name: 'Turkey Breast', category: 'Meat', emoji: '🦃' },

    // Deli
    { name: 'Smoked Turkey Sliced', category: 'Deli', emoji: '🥪' },
    { name: 'Bacon', category: 'Deli', emoji: '🥓' },
    { name: 'Salami', category: 'Deli', emoji: '🍖' },
    { name: 'Provolone Cheese', category: 'Deli', emoji: '🧀' },
    { name: 'Ham', category: 'Deli', emoji: '🍖' },

    // Dairy
    { name: 'Milk Gallon', category: 'Dairy', emoji: '' },
    { name: 'Half Gallon Milk', category: 'Dairy', emoji: '🥛' },
    { name: 'Sour Cream', category: 'Dairy', emoji: '🫗' },
    { name: 'Yogurt', category: 'Dairy', emoji: '🍦' },
    { name: 'Butter', category: 'Dairy', emoji: '🧈' },
    { name: 'Heavy Cream', category: 'Dairy', emoji: '🥛' },

    // Bakery
    { name: 'Sourdough Bread', category: 'Bakery', emoji: '🍞' },
    { name: 'Croissant', category: 'Bakery', emoji: '🥐' },
    { name: 'Bagel', category: 'Bakery', emoji: '🥯' },
    { name: 'Blueberry Muffin', category: 'Bakery', emoji: '🧁' },
    { name: 'Baguette', category: 'Bakery', emoji: '🥖' },

    // Grocery
    { name: 'Canned Beans', category: 'Grocery', emoji: '🥫' },
    { name: 'Pasta', category: 'Grocery', emoji: '🍝' },
    { name: 'Rice', category: 'Grocery', emoji: '🍚' },
    { name: 'Olive Oil', category: 'Grocery', emoji: '🫒' },
    { name: 'Cereal', category: 'Grocery', emoji: '🥣' },
    { name: 'Peanut Butter', category: 'Grocery', emoji: '🥜' },
  ];

  const products: Record<string, any> = {};
  for (const p of productsData) {
    products[p.name] = await prisma.product.create({
      data: {
        name: p.name,
        categoryId: categories[p.category].id,
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

      if (gridPos >= 12) break;

      await prisma.designItem.create({
        data: {
          designShelfId: shelf.id,
          productId: product.id,
          gridPosition: gridPos,
          quantity: 1,
        },
      });
      gridPos += 1;
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