import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/designs - List designs
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const isAdmin = (session.user as any).role === 'admin';

  try {
    const designs = await prisma.savedDesign.findMany({
      where: isAdmin ? {} : { userId },
      include: { _count: { select: { shelves: true } } },
      orderBy: { updatedAt: 'desc' },
    });
    return NextResponse.json({ success: true, data: designs });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/designs - Create new design
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = (session.user as any).id;

  try {
    const { name, description } = await request.json();
    if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 });

    const design = await prisma.savedDesign.create({
      data: { name, description: description || null, userId },
    });

    return NextResponse.json({ success: true, data: design });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}