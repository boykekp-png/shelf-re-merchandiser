import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

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

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save to public/images/products/
    const uploadDir = path.join(process.cwd(), 'public', 'images', 'products');
    await mkdir(uploadDir, { recursive: true });

    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `${productId}.${ext}`;
    const filepath = path.join(uploadDir, filename);

    await writeFile(filepath, buffer);

    const imagePath = `/images/products/${filename}`;

    // Update product image path
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
