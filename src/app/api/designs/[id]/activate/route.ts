import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// POST /api/designs/[id]/activate
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const userId = (session.user as any).id;
    const designId = params.id;

    const design = await prisma.savedDesign.findUnique({ where: { id: designId } });
    if (!design) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    await prisma.activeDesign.upsert({
      where: { userId },
      update: { designId },
      create: { userId, designId },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}