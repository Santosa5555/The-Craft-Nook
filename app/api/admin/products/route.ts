import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { slugify } from '@/lib/slugify';
import { saveFile } from '@/lib/upload';
import { Prisma } from '@/lib/generated/prisma';

const productSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  price: z.string(),
  compareAtPrice: z.string().optional(),
  stock: z.string().optional(),
  categoryId: z.string(),
  isActive: z.string().optional(),
});

async function ensureAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'ADMIN') {
    throw new Error('UNAUTHORIZED');
  }
  return session;
}

async function generateUniqueProductSlug(name: string) {
  const baseSlug = slugify(name);
  let slug = baseSlug;
  let counter = 1;

  while (
    await prisma.product.findUnique({
      where: { slug },
      select: { id: true },
    })
  ) {
    slug = `${baseSlug}-${counter++}`;
  }

  return slug;
}

export async function GET(request: Request) {
  try {
    await ensureAdmin();
    const { searchParams } = new URL(request.url);
    const pageParam = Number(searchParams.get('page') ?? '1');
    const pageSizeParam = Number(searchParams.get('pageSize') ?? '10');

    const page = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
    const pageSize =
      Number.isNaN(pageSizeParam) || pageSizeParam < 1 || pageSizeParam > 50 ? 10 : pageSizeParam;
    const skip = (page - 1) * pageSize;

    const [total, products] = await prisma.$transaction([
      prisma.product.count(),
      prisma.product.findMany({
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          category: { select: { id: true, name: true } },
          images: { select: { id: true, url: true, alt: true } },
        },
      }),
    ]);

    return NextResponse.json({
      products,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
    });
  } catch (error) {
    if ((error as Error).message === 'UNAUTHORIZED') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    console.error('Product GET error:', error);
    return NextResponse.json({ message: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await ensureAdmin();
    const formData = await req.formData();

    const parsed = productSchema.safeParse({
      name: formData.get('name'),
      description: formData.get('description') ?? undefined,
      price: formData.get('price'),
      compareAtPrice: formData.get('compareAtPrice') ?? undefined,
      stock: formData.get('stock') ?? undefined,
      categoryId: formData.get('categoryId'),
      isActive: formData.get('isActive') ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { message: 'Validation error', errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, description, price, compareAtPrice, stock, categoryId, isActive } = parsed.data;
    const category = await prisma.productCategory.findUnique({
      where: { id: Number(categoryId) },
      select: { id: true },
    });

    if (!category) {
      return NextResponse.json({ message: 'Category not found' }, { status: 400 });
    }

    const imageFiles = formData.getAll('images');
    const imageUrls: string[] = [];

    for (const file of imageFiles) {
      if (file instanceof File && file.size > 0) {
        const url = await saveFile(file);
        imageUrls.push(url);
      }
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug: await generateUniqueProductSlug(name),
        description,
        price: new Prisma.Decimal(price),
        compareAtPrice: compareAtPrice ? new Prisma.Decimal(compareAtPrice) : undefined,
        stock: stock ? Number(stock) : 0,
        categoryId: Number(categoryId),
        isActive: isActive === 'true' || isActive === 'on',
        images:
          imageUrls.length > 0
            ? {
                create: imageUrls.map((url, index) => ({
                  url,
                  alt: `${name} image ${index + 1}`,
                })),
              }
            : undefined,
      },
      include: {
        category: { select: { id: true, name: true } },
        images: true,
      },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    if ((error as Error).message === 'UNAUTHORIZED') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    console.error('Product POST error:', error);
    return NextResponse.json({ message: 'Failed to create product' }, { status: 500 });
  }
}
