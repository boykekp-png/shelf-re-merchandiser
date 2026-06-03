import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  try {
    const { role } = await request.json();
    const user = await prisma.user.update({
      where: { id: params.id },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });
    return NextResponse.json({ success: true, data: user });
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}