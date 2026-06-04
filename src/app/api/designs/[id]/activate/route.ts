/**
 * EN: Activate Design — POST
 *     Sets a design as the user's active/working design using upsert
 *     (creates the active-design record if it doesn't exist, updates if it does).
 *     A user can only have one active design at a time.
 *
 * ID: Aktifkan Desain — POST
 *     Menetapkan desain sebagai desain aktif/kerja pengguna menggunakan upsert
 *     (membuat record active-design jika belum ada, memperbarui jika sudah ada).
 *     Pengguna hanya dapat memiliki satu desain aktif dalam satu waktu.
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

/** EN: POST /api/designs/:id/activate — set as active design / ID: POST /api/designs/:id/activate — tetapkan sebagai desain aktif */
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const userId = (session.user as any).id;
    const designId = params.id;

    // EN: Verify the design exists / ID: Verifikasi desain ada
    const design = await prisma.savedDesign.findUnique({ where: { id: designId } });
    if (!design) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // EN: Upsert: create or update the active-design link / ID: Upsert: buat atau perbarui tautan active-design
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