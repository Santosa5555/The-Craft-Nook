import { NextResponse } from 'next/server';
import { z } from 'zod';
import { Prisma } from '@/lib/generated/prisma';
import { prisma } from '@/lib/prisma';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 12;
const MAX_PAGE_SIZE = 48;

const querySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).optional(),
  search: z.string().trim().optional(),
  categoryId: z.coerce.number().int().positive().optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = querySchema.safeParse({
      page: searchParams.get('page'),
      pageSize: searchParams.get('pageSize'),
      search: searchParams.get('search'),
      categoryId: searchParams.get('categoryId'),
      minPrice: searchParams.get('minPrice'),
      maxPrice: searchParams.get('maxPrice'),
    });

    if (!parsed.success) {
      return NextResponse.json(
        { message: 'Invalid query parameters', errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const {
      page: parsedPage,
      pageSize: parsedPageSize,
      search,
      categoryId,
      minPrice,
      maxPrice,
    } = parsed.data;

    if (typeof minPrice === 'number' && typeof maxPrice === 'number' && maxPrice < minPrice) {
      return NextResponse.json(
        { message: 'maxPrice must be greater than or equal to minPrice' },
        { status: 400 }
      );
    }

    const page = parsedPage ?? DEFAULT_PAGE;
    const pageSize = parsedPageSize ?? DEFAULT_PAGE_SIZE;
    const skip = (page - 1) * pageSize;

    const where: Prisma.ProductWhereInput = {
      isActive: true,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (typeof categoryId === 'number') {
      where.categoryId = categoryId;
    }

    const priceFilter: Prisma.DecimalFilter = {};
    if (typeof minPrice === 'number') {
      priceFilter.gte = new Prisma.Decimal(minPrice);
    }
    if (typeof maxPrice === 'number') {
      priceFilter.lte = new Prisma.Decimal(maxPrice);
    }
    if (Object.keys(priceFilter).length > 0) {
      where.price = priceFilter;
    }

    const [total, products] = await prisma.$transaction([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          images: {
            orderBy: { position: 'asc' },
          },
          category: {
            select: { id: true, name: true },
          },
        },
      }),
    ]);

    const categories = await prisma.productCategory.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    });

    return NextResponse.json({
      products,
      categories,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
    });
  } catch (error) {
    console.error('Public products API error:', error);
    return NextResponse.json({ message: 'Failed to load products' }, { status: 500 });
  }
}
