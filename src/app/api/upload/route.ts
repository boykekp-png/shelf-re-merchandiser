/**
 * EN: File Upload API — POST
 *     Admin-only. Accepts multipart/form-data with a file and productId.
 *     Saves the image to public/images/products/{productId}.{ext}
 *     and updates the product's imagePath field in the database.
 *
 * ID: API Upload File — POST
 *     Khusus admin. Menerima multipart/form-data dengan file dan productId.
 *     Menyimpan gambar ke public/images/products/{productId}.{ext}
 *     dan memperbarui field imagePath produk di database.
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

/** EN: POST /api/upload — upload product image / ID: POST /api/upload — upload gambar produk */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const productId = formData.get('productId') as string;

    if (!file || !productId) {
      return NextResponse.json({ error: 'Missing file or productId' }, { status: 400 });
    }

    // EN: Convert file to buffer / ID: Konversi file ke buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // EN: Ensure upload directory exists / ID: Pastikan direktori upload ada
    const uploadDir = path.join(process.cwd(), 'public', 'images', 'products');
    await mkdir(uploadDir, { recursive: true });

    // EN: Save with {productId}.{extension} naming / ID: Simpan dengan nama {productId}.{ekstensi}
    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `${productId}.${ext}`;
    const filepath = path.join(uploadDir, filename);

    await writeFile(filepath, buffer);

    const imagePath = `/images/products/${filename}`;

    // EN: Dynamic import to avoid circular dependency with prisma singleton
    // ID: Import dinamis untuk menghindari circular dependency dengan singleton prisma
    await (await import('@/lib/prisma')).default.product.update({
      where: { id: productId },
      data: { imagePath },
    });

    return NextResponse.json({ success: true, data: { imagePath } });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}