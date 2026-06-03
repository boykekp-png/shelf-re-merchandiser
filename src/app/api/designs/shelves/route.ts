import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { designId, name, position } = await request.json();
    const shelf = await prisma.designShelf.create({ data: { designId, name, position } });
    return NextResponse.json({ success: true, data: shelf });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}