/**
 * EN: POST /api/auth/register — User Registration
 *     Creates a new user account with bcrypt-hashed password.
 *     Automatically creates a default design with 5 empty shelves
 *     and seeds up to 4 demo products on the first shelf.
 *     Sets the new design as the user's active design.
 *
 * ID: POST /api/auth/register — Registrasi Pengguna
 *     Membuat akun pengguna baru dengan password yang di-hash bcrypt.
 *     Otomatis membuat desain default dengan 5 rak kosong
 *     dan menempatkan hingga 4 produk demo di rak pertama.
 *     Menandai desain baru sebagai desain aktif pengguna.
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    // EN: Validate required fields / ID: Validasi field wajib
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // EN: Check for duplicate email / ID: Periksa email duplikat
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
    }

    // EN: Hash password with 12 salt rounds / ID: Hash password dengan 12 ronde salt
    const passwordHash = await bcrypt.hash(password, 12);

    // EN: Create the user (default role: 'user') / ID: Buat pengguna (peran default: 'user')
    const user = await prisma.user.create({
      data: { name, email, passwordHash, role: 'user' },
    });

    // EN: Create a default design for the new user / ID: Buat desain default untuk pengguna baru
    const design = await prisma.savedDesign.create({
      data: {
        name: 'My First Design',
        description: 'Default starting layout',
        userId: user.id,
      },
    });

    // EN: Create 5 empty demo shelves / ID: Buat 5 rak demo kosong
    const shelfNames = ['Shelf 1', 'Shelf 2', 'Shelf 3', 'Shelf 4', 'Shelf 5'];
    for (let i = 0; i < shelfNames.length; i++) {
      await prisma.designShelf.create({
        data: { name: shelfNames[i], position: i, designId: design.id },
      });
    }

    // EN: Seed up to 4 demo products on the first shelf / ID: Tempatkan hingga 4 produk demo di rak pertama
    const demoProducts = await prisma.product.findMany({
      where: { isActive: true },
      take: 4,
      include: { category: true },
    });

    const firstShelf = await prisma.designShelf.findFirst({
      where: { designId: design.id },
      orderBy: { position: 'asc' },
    });

    if (firstShelf && demoProducts.length > 0) {
      for (let i = 0; i < demoProducts.length; i++) {
        await prisma.designItem.create({
          data: {
            designShelfId: firstShelf.id,
            productId: demoProducts[i].id,
            gridPosition: i, // EN: Place sequentially / ID: Tempatkan berurutan
            quantity: 1,
          },
        });
      }
    }

    // EN: Set as the user's active design / ID: Tandai sebagai desain aktif pengguna
    await prisma.activeDesign.create({
      data: { userId: user.id, designId: design.id },
    });

    return NextResponse.json({ success: true, data: { userId: user.id } });
  } catch (e) {
    console.error('Register error:', e);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}