/**
 * EN: Active Design API — GET
 *     Returns the currently active design for a user (or specified userId).
 *     The active design is fetched with full nesting: shelves → items → product → category.
 *     Used by the main planogram editor to load the user's working design.
 *
 * ID: API Desain Aktif — GET
 *     Mengembalikan desain yang sedang aktif untuk pengguna (atau userId tertentu).
 *     Desain aktif diambil dengan nesting penuh: rak → item → produk → kategori.
 *     Digunakan oleh editor planogram utama untuk memuat desain kerja pengguna.
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

/** EN: GET /api/designs/active[?userId=] — get active design with full data / ID: GET /api/designs/active[?userId=] — dapatkan desain aktif dengan data lengkap */
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as any).id;
  const { searchParams } = new URL(request.url);
  const targetUserId = searchParams.get('userId') || userId; // EN: Admin can view other users' designs / ID: Admin dapat melihat desain pengguna lain

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
              orderBy: { position: 'asc' }, // EN: Top-to-bottom / ID: Atas ke bawah
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