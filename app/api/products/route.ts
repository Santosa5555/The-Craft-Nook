import { NextResponse } from 'next/server';
import { Prisma } from '@/lib/generated/prisma';
import { prisma } from '@/lib/prisma';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 12;
const MAX_PAGE_SIZE = 48;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse and sanitize query params in a forgiving way so we don't 400 on minor issues
    const pageRaw = searchParams.get('page');
    const pageSizeRaw = searchParams.get('pageSize');
    const search = searchParams.get('search')?.trim() || undefined;
    const categoryIdRaw = searchParams.get('categoryId');
    const minPriceRaw = searchParams.get('minPrice');
    const maxPriceRaw = searchParams.get('maxPrice');

    const pageParsed = pageRaw ? Number(pageRaw) : undefined;
    const pageSizeParsed = pageSizeRaw ? Number(pageSizeRaw) : undefined;
    const categoryIdParsed = categoryIdRaw ? Number(categoryIdRaw) : undefined;
    const minPriceParsed = minPriceRaw ? Number(minPriceRaw) : undefined;
    const maxPriceParsed = maxPriceRaw ? Number(maxPriceRaw) : undefined;

    const page =
      pageParsed && Number.isInteger(pageParsed) && pageParsed > 0 ? pageParsed : DEFAULT_PAGE;

    let pageSize =
      pageSizeParsed && Number.isInteger(pageSizeParsed) && pageSizeParsed > 0
        ? pageSizeParsed
        : DEFAULT_PAGE_SIZE;
    pageSize = Math.min(pageSize, MAX_PAGE_SIZE);

    const categoryId =
      categoryIdParsed && Number.isInteger(categoryIdParsed) && categoryIdParsed > 0
        ? categoryIdParsed
        : undefined;

    const minPrice =
      typeof minPriceParsed === 'number' && !Number.isNaN(minPriceParsed) && minPriceParsed >= 0
        ? minPriceParsed
        : undefined;
    const maxPrice =
      typeof maxPriceParsed === 'number' && !Number.isNaN(maxPriceParsed) && maxPriceParsed >= 0
        ? maxPriceParsed
        : undefined;

    if (typeof minPrice === 'number' && typeof maxPrice === 'number' && maxPrice < minPrice) {
      return NextResponse.json(
        { message: 'maxPrice must be greater than or equal to minPrice' },
        { status: 400 }
      );
    }

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
