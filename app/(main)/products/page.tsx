import Link from 'next/link';
import { z } from 'zod';
import { Tag, SlidersHorizontal } from 'lucide-react';

import { prisma } from '@/lib/prisma';
import { Prisma } from '@/lib/generated/prisma';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/customer/ProductCard';

const PAGE_SIZE = 12;

const filterSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  search: z.string().trim().optional(),
  categoryId: z.coerce.number().int().positive().optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
});

function extractParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value ?? undefined;
}

function buildQueryString(params: Record<string, string | number | undefined>) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') qs.set(key, String(value));
  });
  const query = qs.toString();
  return query ? `?${query}` : '';
}

export const revalidate = 60;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const parsed = filterSchema.safeParse({
    page: extractParam(searchParams?.page),
    search: extractParam(searchParams?.search),
    categoryId: extractParam(searchParams?.categoryId),
    minPrice: extractParam(searchParams?.minPrice),
    maxPrice: extractParam(searchParams?.maxPrice),
  });

  if (!parsed.success) {
    throw new Error('Invalid query parameters');
  }

  const { page = 1, search, categoryId, minPrice, maxPrice } = parsed.data;

  if (typeof minPrice === 'number' && typeof maxPrice === 'number' && maxPrice < minPrice) {
    throw new Error('maxPrice must be greater than or equal to minPrice');
  }

  const skip = (page - 1) * PAGE_SIZE;

  const where: Prisma.ProductWhereInput = { isActive: true };

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

  const [total, productsRaw, categories] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      skip,
      take: PAGE_SIZE,
      orderBy: { createdAt: 'desc' },
      include: {
        images: { orderBy: { position: 'asc' } },
        category: { select: { id: true, name: true } },
      },
    }),
    prisma.productCategory.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    }),
  ]);

  const products = productsRaw.map((product) => ({
    ...product,
    price: product.price.toString(),
    compareAtPrice: product.compareAtPrice ? product.compareAtPrice.toString() : null,
    images: product.images.map(({ id, url }) => ({ id, url })),
  }));

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const startItem = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const endItem = Math.min(page * PAGE_SIZE, total);

  const baseQuery = {
    search: search ?? undefined,
    categoryId: categoryId ?? undefined,
    minPrice: minPrice ?? undefined,
    maxPrice: maxPrice ?? undefined,
  };

  const prevHref = buildQueryString({ ...baseQuery, page: page - 1 });
  const nextHref = buildQueryString({ ...baseQuery, page: page + 1 });

  return (
    <div className="space-y-10">
      <div className="grid gap-8 lg:grid-cols-[280px,1fr]">
        <aside className="border-border/70 bg-background/95 rounded-3xl border p-5 shadow-lg shadow-black/5">
          <div className="space-y-6 lg:sticky lg:top-24">
            <div className="space-y-1">
              <p className="text-primary text-xs tracking-[0.3em] uppercase">Filters</p>
              <h2 className="text-foreground text-xl font-semibold">Curate your favorites</h2>
              <p className="text-muted-foreground text-sm">
                Search by name, narrow by category, or set your budget to discover the right piece.
              </p>
            </div>

            <form method="GET" action="/products" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="search" className="text-muted-foreground text-sm font-semibold">
                  Search keywords
                </Label>
                <Input
                  id="search"
                  name="search"
                  placeholder="e.g. wool planter, bamboo lamp…"
                  defaultValue={search ?? ''}
                  className="border-muted-foreground/20 bg-muted/30 h-11 rounded-2xl border"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground flex items-center gap-2 text-sm font-semibold">
                  <Tag className="text-primary h-4 w-4" />
                  Category
                </Label>
                <select
                  id="categoryId"
                  name="categoryId"
                  defaultValue={categoryId?.toString() ?? ''}
                  className="border-muted-foreground/20 bg-background focus-visible:border-ring focus-visible:ring-ring/40 h-11 w-full rounded-2xl border px-3 text-sm shadow-xs"
                >
                  <option value="">All categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <Label className="text-muted-foreground flex items-center gap-2 text-sm font-semibold">
                  <SlidersHorizontal className="text-primary h-4 w-4" />
                  Price range (NPR)
                </Label>
                <div className="grid gap-3 md:grid-cols-2">
                  <Input
                    id="minPrice"
                    name="minPrice"
                    type="number"
                    min="0"
                    placeholder="Min"
                    defaultValue={minPrice ?? ''}
                    className="border-muted-foreground/20 bg-muted/30 h-11 rounded-2xl border"
                  />
                  <Input
                    id="maxPrice"
                    name="maxPrice"
                    type="number"
                    min="0"
                    placeholder="Max"
                    defaultValue={maxPrice ?? ''}
                    className="border-muted-foreground/20 bg-muted/30 h-11 rounded-2xl border"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-1">
                <Button type="submit" className="rounded-2xl font-semibold">
                  Apply filters
                </Button>
                <Button variant="ghost" type="button" className="rounded-2xl" asChild>
                  <Link href="/products">Reset filters</Link>
                </Button>
              </div>
            </form>

            <div className="flex flex-wrap gap-2 pt-4">
              {[1000, 2000, 5000, 8000, 10000].map((price) => (
                <Button
                  key={price}
                  variant={Number(maxPrice) === price ? 'default' : 'outline'}
                  size="sm"
                  className="rounded-full"
                  asChild
                >
                  <Link href={`/products${buildQueryString({ ...baseQuery, maxPrice: price })}`}>
                    Under NPR {price.toLocaleString()}
                  </Link>
                </Button>
              ))}
            </div>
          </div>
        </aside>

        <section className="space-y-6">
          <div className="border-border/70 bg-muted/20 flex flex-wrap items-center justify-between gap-3 rounded-[28px] border px-5 py-4">
            <div>
              <p className="text-muted-foreground text-sm">Catalog overview</p>
              <p className="text-foreground text-lg font-semibold">
                Showing {startItem}-{endItem} of {total} items
              </p>
            </div>
            <div className="text-muted-foreground text-sm">
              Page {page} of {totalPages}
            </div>
          </div>

          {products.length === 0 ? (
            <div className="border-border/70 rounded-[28px] border border-dashed p-16 text-center">
              <p className="text-muted-foreground">
                No products match these filters. Try exploring another category or resetting.
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              <div className="text-muted-foreground flex flex-wrap items-center justify-between gap-3 text-sm">
                <div>
                  Showing {startItem}-{endItem} of {total}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    asChild={page > 1}
                    className="rounded-full"
                  >
                    {page === 1 ? (
                      <span>Previous</span>
                    ) : (
                      <Link href={`/products${prevHref}`} scroll={false}>
                        Previous
                      </Link>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    asChild={page < totalPages}
                    className="rounded-full"
                  >
                    {page >= totalPages ? (
                      <span>Next</span>
                    ) : (
                      <Link href={`/products${nextHref}`} scroll={false}>
                        Next
                      </Link>
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
