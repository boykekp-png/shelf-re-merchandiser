/**
 * EN: Design Shelves — POST (create shelf)
 *     Creates a new shelf row within a design.
 *     Each shelf has a name, position (vertical ordering), and belongs to a design.
 *
 * ID: Rak Desain — POST (buat rak)
 *     Membuat baris rak baru dalam sebuah desain.
 *     Setiap rak memiliki nama, posisi (urutan vertikal), dan dimiliki oleh satu desain.
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

/** EN: POST /api/designs/shelves — add a shelf to a design / ID: POST /api/designs/shelves — tambah rak ke desain */
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