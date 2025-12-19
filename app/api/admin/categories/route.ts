import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { slugify } from '@/lib/slugify';

const categorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  parentId: z.number().int().positive().optional(),
});

async function ensureAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'ADMIN') {
    throw new Error('UNAUTHORIZED');
  }
  return session;
}

async function generateUniqueCategorySlug(name: string) {
  const baseSlug = slugify(name);
  let slug = baseSlug;
  let counter = 1;

  while (
    await prisma.productCategory.findUnique({
      where: { slug },
      select: { id: true },
    })
  ) {
    slug = `${baseSlug}-${counter++}`;
  }

  return slug;
}

export async function GET() {
  try {
    await ensureAdmin();
    const categories = await prisma.productCategory.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        parentId: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ categories });
  } catch (error) {
    if ((error as Error).message === 'UNAUTHORIZED') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    console.error('Category GET error:', error);
    return NextResponse.json({ message: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await ensureAdmin();
    const body = await req.json();
    const parsed = categorySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: 'Validation error', errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, description, parentId } = parsed.data;

    if (parentId) {
      const parentExists = await prisma.productCategory.findUnique({
        where: { id: parentId },
        select: { id: true },
      });
      if (!parentExists) {
        return NextResponse.json({ message: 'Parent category not found' }, { status: 400 });
      }
    }

    const slug = await generateUniqueCategorySlug(name);

    const category = await prisma.productCategory.create({
      data: {
        name,
        slug,
        description,
        parentId,
      },
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    if ((error as Error).message === 'UNAUTHORIZED') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    console.error('Category POST error:', error);
    return NextResponse.json({ message: 'Failed to create category' }, { status: 500 });
  }
}
