import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { name, email, passwordHash, role: 'user' },
    });

    // Create a default design for the new user
    const design = await prisma.savedDesign.create({
      data: {
        name: 'My First Design',
        description: 'Default starting layout',
        userId: user.id,
      },
    });

    // Create demo shelves
    const shelfNames = ['Shelf 1', 'Shelf 2', 'Shelf 3', 'Shelf 4', 'Shelf 5'];
    for (let i = 0; i < shelfNames.length; i++) {
      await prisma.designShelf.create({
        data: { name: shelfNames[i], position: i, designId: design.id },
      });
    }

    // Seed some demo products on first shelf
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
            gridPosition: i,
            quantity: 1,
          },
        });
      }
    }

    // Set as active design
    await prisma.activeDesign.create({
      data: { userId: user.id, designId: design.id },
    });

    return NextResponse.json({ success: true, data: { userId: user.id } });
  } catch (e) {
    console.error('Register error:', e);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}