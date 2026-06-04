/**
 * EN: Database Seed Script
 *     Wipes and repopulates the database with demo data:
 *     admin user, 6 categories, 37 products, 5-shelf default design.
 *     Run via: npx prisma db seed
 *
 * ID: Skrip Isian Database (Seed)
 *     Menghapus dan mengisi ulang database dengan data demo:
 *     admin user, 6 kategori, 37 produk, desain default 5 rak.
 *     Jalankan via: npx prisma db seed
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...\n');

  // ─── Clean existing data / Hapus data existing ───
  // EN: Delete in dependency order (children first) to avoid FK violations.
  // ID: Hapus sesuai urutan dependensi (child dulu) agar tidak melanggar FK.
  await prisma.activeDesign.deleteMany();
  await prisma.designItem.deleteMany();
  await prisma.designShelf.deleteMany();
  await prisma.savedDesign.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // ─── Create Admin User / Buat Admin User ───
  // EN: Uses env vars or fallback defaults. Password hashed with bcrypt (12 rounds).
  // ID: Menggunakan env vars atau fallback default. Password di-hash dengan bcrypt (12 ronde).
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

  // ─── Create Categories / Buat Kategori ───
  // EN: 6 categories with emoji icons and brand colors for the UI.
  // ID: 6 kategori dengan ikon emoji dan warna brand untuk UI.
  const categoriesData = [
    { name: 'Produce', icon: '🥬', color: '#4CAF50' },
    { name: 'Meat', icon: '🥩', color: '#F44336' },
    { name: 'Deli', icon: '🧀', color: '#FF9800' },
    { name: 'Dairy', icon: '🥛', color: '#2196F3' },
    { name: 'Bakery', icon: '🍞', color: '#795548' },
    { name: 'Grocery', icon: '🛒', color: '#9E9E9E' },
  ];

  // EN: Store by name for quick lookup when linking products.
  // ID: Simpan berdasarkan nama untuk pencarian cepat saat menghubungkan produk.
  const categories: Record<string, any> = {};
  for (const cat of categoriesData) {
    categories[cat.name] = await prisma.category.create({ data: cat });
  }
  console.log(`  ✅ ${categoriesData.length} categories created`);

  // ─── Create Products / Buat Produk ───
  // EN: 37 realistic grocery products across all 6 categories.
  //     All products occupy exactly 1 grid slot (width = 1).
  // ID: 37 produk grocery realistis di seluruh 6 kategori.
  //     Semua produk menempati tepat 1 slot grid (lebar = 1).
  const productsData = [
    // Produce — EN: Fruits & vegetables / ID: Buah & sayuran
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

    // Meat — EN: Fresh & frozen / ID: Daging segar & beku
    { name: 'Chicken Breast', category: 'Meat', emoji: '🍗' },
    { name: 'Ground Beef', category: 'Meat', emoji: '🥩' },
    { name: 'Pork Chop', category: 'Meat', emoji: '🍖' },
    { name: 'Salmon Fillet', category: 'Meat', emoji: '🐟' },
    { name: 'Turkey Breast', category: 'Meat', emoji: '🦃' },

    // Deli — EN: Sliced meats & cheeses / ID: Daging iris & keju
    { name: 'Smoked Turkey Sliced', category: 'Deli', emoji: '🥪' },
    { name: 'Bacon', category: 'Deli', emoji: '🥓' },
    { name: 'Salami', category: 'Deli', emoji: '🍖' },
    { name: 'Provolone Cheese', category: 'Deli', emoji: '🧀' },
    { name: 'Ham', category: 'Deli', emoji: '🍖' },

    // Dairy — EN: Milk, yogurt, butter / ID: Susu, yogurt, mentega
    { name: 'Milk Gallon', category: 'Dairy', emoji: '' },
    { name: 'Half Gallon Milk', category: 'Dairy', emoji: '🥛' },
    { name: 'Sour Cream', category: 'Dairy', emoji: '🫗' },
    { name: 'Yogurt', category: 'Dairy', emoji: '🍦' },
    { name: 'Butter', category: 'Dairy', emoji: '🧈' },
    { name: 'Heavy Cream', category: 'Dairy', emoji: '🥛' },

    // Bakery — EN: Breads & pastries / ID: Roti & kue kering
    { name: 'Sourdough Bread', category: 'Bakery', emoji: '🍞' },
    { name: 'Croissant', category: 'Bakery', emoji: '🥐' },
    { name: 'Bagel', category: 'Bakery', emoji: '🥯' },
    { name: 'Blueberry Muffin', category: 'Bakery', emoji: '🧁' },
    { name: 'Baguette', category: 'Bakery', emoji: '🥖' },

    // Grocery — EN: Pantry staples / ID: Bahan pokok
    { name: 'Canned Beans', category: 'Grocery', emoji: '🥫' },
    { name: 'Pasta', category: 'Grocery', emoji: '🍝' },
    { name: 'Rice', category: 'Grocery', emoji: '🍚' },
    { name: 'Olive Oil', category: 'Grocery', emoji: '🫒' },
    { name: 'Cereal', category: 'Grocery', emoji: '🥣' },
    { name: 'Peanut Butter', category: 'Grocery', emoji: '🥜' },
  ];

  // EN: Create all products, linking to their categories.
  // ID: Buat semua produk, hubungkan ke kategorinya.
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

  // ─── Create Default Design for Admin / Buat Desain Default untuk Admin ───
  // EN: A starting layout with 5 shelves and pre-placed products.
  // ID: Layout awal dengan 5 rak dan produk yang sudah ditempatkan.
  const defaultDesign = await prisma.savedDesign.create({
    data: {
      name: 'Default Layout',
      description: 'Default starting layout',
      userId: admin.id,
    },
  });

  // EN: Create 5 shelves — a typical grocery aisle layout.
  // ID: Buat 5 rak — layout lorong grocery yang umum.
  const shelfNames = ['Shelf 1', 'Shelf 2', 'Shelf 3', 'Shelf 4', 'Shelf 5'];
  const shelves: any[] = [];
  for (let i = 0; i < shelfNames.length; i++) {
    const shelf = await prisma.designShelf.create({
      data: {
        name: shelfNames[i],
        position: i, // EN: Vertical order / ID: Urutan vertikal
        designId: defaultDesign.id,
      },
    });
    shelves.push(shelf);
  }

  // EN: Place products on shelves — each at sequential grid positions.
  // ID: Tempatkan produk di rak — masing-masing di posisi grid berurutan.
  const shelfPlacements = [
    // EN: Shelf 0 — Produce / ID: Rak 0 — Buah & Sayur
    { shelf: 0, items: ['Banana', 'Apple', 'Cherry', 'Dates'] },
    // EN: Shelf 1 — Meat / ID: Rak 1 — Daging
    { shelf: 1, items: ['Chicken Breast', 'Ground Beef', 'Salmon Fillet'] },
    // EN: Shelf 2 — Dairy / ID: Rak 2 — Produk Susu
    { shelf: 2, items: ['Milk Gallon', 'Sour Cream', 'Butter', 'Yogurt'] },
    // EN: Shelf 3 — Bakery / ID: Rak 3 — Roti & Kue
    { shelf: 3, items: ['Sourdough Bread', 'Croissant', 'Bagel', 'Blueberry Muffin'] },
    // EN: Shelf 4 — Grocery / ID: Rak 4 — Bahan Pokok
    { shelf: 4, items: ['Pasta', 'Rice', 'Olive Oil', 'Cereal'] },
  ];

  for (const placement of shelfPlacements) {
    const shelf = shelves[placement.shelf];
    let gridPos = 0; // EN: Start at leftmost column / ID: Mulai dari kolom paling kiri
    for (const itemName of placement.items) {
      const product = products[itemName];
      if (!product) continue;

      // EN: Safety: don't exceed 12-column grid
      // ID: Keamanan: jangan melebihi grid 12 kolom
      if (gridPos >= 12) break;

      await prisma.designItem.create({
        data: {
          designShelfId: shelf.id,
          productId: product.id,
          gridPosition: gridPos,
          quantity: 1,
        },
      });
      gridPos += 1; // EN: Move right 1 slot / ID: Geser kanan 1 slot
    }
  }

  // EN: Mark this design as the admin's active design.
  // ID: Tandai desain ini sebagai desain aktif admin.
  await prisma.activeDesign.create({
    data: {
      userId: admin.id,
      designId: defaultDesign.id,
    },
  });

  console.log(`  ✅ Default design created: 5 shelves with products placed`);
  console.log(`\n🎉 Seeding complete!`);
  console.log(`\nLogin credentials / Kredensial login:`);
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