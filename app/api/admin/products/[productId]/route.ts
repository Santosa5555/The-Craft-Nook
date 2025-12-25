import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { Prisma } from '@/lib/generated/prisma';

import { prisma } from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { saveFile } from '@/lib/upload';

const productUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  price: z.string().optional(),
  compareAtPrice: z.string().optional(),
  stock: z.string().optional(),
  categoryId: z.string().optional(),
  isActive: z.string().optional(),
});

async function ensureAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'ADMIN') {
    throw new Error('UNAUTHORIZED');
  }
}

export async function GET(_req: Request, { params }: { params: { productId: string } }) {
  try {
    await ensureAdmin();
    const id = Number(params.productId);
    if (Number.isNaN(id)) {
      return NextResponse.json({ message: 'Invalid product id' }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true } },
        images: true,
      },
    });

    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    const categories = await prisma.productCategory.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    });

    return NextResponse.json({ product, categories });
  } catch (error) {
    if ((error as Error).message === 'UNAUTHORIZED') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    console.error('Product detail GET error:', error);
    return NextResponse.json({ message: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { productId: string } }) {
  try {
    await ensureAdmin();
    const id = Number(params.productId);
    if (Number.isNaN(id)) {
      return NextResponse.json({ message: 'Invalid product id' }, { status: 400 });
    }

    const existing = await prisma.product.findUnique({
      where: { id },
      include: { images: true },
    });

    if (!existing) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    const formData = await req.formData();
    const parsed = productUpdateSchema.safeParse({
      name: formData.get('name') ?? undefined,
      description: formData.get('description') ?? undefined,
      price: formData.get('price') ?? undefined,
      compareAtPrice: formData.get('compareAtPrice') ?? undefined,
      stock: formData.get('stock') ?? undefined,
      categoryId: formData.get('categoryId') ?? undefined,
      isActive: formData.get('isActive') ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { message: 'Validation error', errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const updates = parsed.data;
    const imageFiles = formData.getAll('images');
    const imageUrls: string[] = [];

    for (const file of imageFiles) {
      if (file instanceof File && file.size > 0) {
        const url = await saveFile(file);
        imageUrls.push(url);
      }
    }

    const data: Prisma.ProductUpdateInput = {};

    if (updates.name) data.name = updates.name;
    if (updates.description !== undefined) data.description = updates.description;
    if (updates.price) data.price = new Prisma.Decimal(updates.price);
    if (updates.compareAtPrice) {
      data.compareAtPrice = new Prisma.Decimal(updates.compareAtPrice);
    }
    if (
      updates.compareAtPrice === undefined &&
      formData.has('compareAtPrice') &&
      !updates.compareAtPrice
    ) {
      data.compareAtPrice = null;
    }
    if (updates.stock !== undefined) data.stock = Number(updates.stock);
    if (updates.categoryId !== undefined) data.category = { connect: { id: Number(updates.categoryId) } };
    if (updates.isActive !== undefined) {
      data.isActive = updates.isActive === 'true' || updates.isActive === 'on';
    }
    if (imageUrls.length > 0) {
      data.images = {
        create: imageUrls.map((url, index) => ({
          url,
          alt: `${updates.name ?? existing.name} image ${index + 1}`,
        })),
      };
    }

    const product = await prisma.product.update({
      where: { id },
      data,
      include: {
        category: { select: { id: true, name: true } },
        images: true,
      },
    });

    return NextResponse.json({ product });
  } catch (error) {
    if ((error as Error).message === 'UNAUTHORIZED') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    console.error('Product PATCH error:', error);
    return NextResponse.json({ message: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { productId: string } }) {
  try {
    await ensureAdmin();
    const id = Number(params.productId);
    if (Number.isNaN(id)) {
      return NextResponse.json({ message: 'Invalid product id' }, { status: 400 });
    }

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if ((error as Error).message === 'UNAUTHORIZED') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    console.error('Product DELETE error:', error);
    return NextResponse.json({ message: 'Failed to delete product' }, { status: 500 });
  }
}
