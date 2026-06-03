import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/designs/active - Get active design
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as any).id;
  const { searchParams } = new URL(request.url);
  const targetUserId = searchParams.get('userId') || userId;

  try {
    const active = await prisma.activeDesign.findUnique({
      where: { userId: targetUserId },
      include: {
        design: {
          include: {
            shelves: {
              include: {
                items: {
                  include: {
                    product: { include: { category: true } },
                  },
                },
              },
              orderBy: { position: 'asc' },
            },
          },
        },
      },
    });

    if (!active) {
      return NextResponse.json({ success: false, error: 'No active design' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: active.design });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}