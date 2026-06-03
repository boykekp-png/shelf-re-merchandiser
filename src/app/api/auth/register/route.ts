import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: 'user',
      },
    });

    // Create default design for new user
    // Get active products
    const activeProducts = await prisma.product.findMany({
      where: { isActive: true },
      include: { category: true },
      take: 20,
    });

    const defaultDesign = await prisma.savedDesign.create({
      data: {
        name: 'My First Layout',
        description: 'Default starting layout',
        userId: user.id,
      },
    });

    // Create 5 shelves
    const shelfNames = ['Shelf 1', 'Shelf 2', 'Shelf 3', 'Shelf 4', 'Shelf 5'];
    const shelves = [];
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

    // Place some products on shelves (just a few for new users)
    if (activeProducts.length > 0) {
      const productsPerShelf = Math.min(4, Math.floor(activeProducts.length / 5));
      let productIdx = 0;

      for (const shelf of shelves) {
        let gridPos = 0;
        for (let i = 0; i < productsPerShelf && productIdx < activeProducts.length; i++) {
          const product = activeProducts[productIdx];
          const width = product.defaultWidth;

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
          productIdx++;
        }
      }
    }

    // Set as active design
    await prisma.activeDesign.create({
      data: {
        userId: user.id,
        designId: defaultDesign.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}