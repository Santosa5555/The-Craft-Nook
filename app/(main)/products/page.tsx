
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import Link from 'next/link';
import { Tag, SlidersHorizontal, Sparkles, Loader2 } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/customer/ProductCard';

const PAGE_SIZE = 12;

type Product = {
  id: number;
  slug: string;
  name: string;
  price: string;
  compareAtPrice?: string | null;
  category?: { id: number; name: string } | null;
  images: { id: number; url: string }[];
};

type ApiResponse = {
  products: any[];
  categories: { id: number; name: string }[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

async function fetchProducts(params: {
  page: number;
  search?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
}): Promise<ApiResponse> {
  // Build clean params object without undefined values
  const cleanParams: any = {
    page: params.page,
    pageSize: PAGE_SIZE,
  };
  
  if (params.search) cleanParams.search = params.search;
  if (params.categoryId) cleanParams.categoryId = params.categoryId;
  if (typeof params.minPrice === 'number' && !isNaN(params.minPrice)) {
    cleanParams.minPrice = params.minPrice;
  }
  if (typeof params.maxPrice === 'number' && !isNaN(params.maxPrice)) {
    cleanParams.maxPrice = params.maxPrice;
  }
  const { data } = await axios.get('/api/products', { params: cleanParams });
  return data;
}

function buildQueryString(params: Record<string, string | number | undefined>) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') qs.set(key, String(value));
  });
  const query = qs.toString();
  return query ? `?${query}` : '';
}

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get params from URL
  const page = Number(searchParams.get('page')) || 1;
  const search = searchParams.get('search') || undefined;
  const categoryId = searchParams.get('categoryId') ? Number(searchParams.get('categoryId')) : undefined;
  const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
  const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;

  // Form state
  const [searchInput, setSearchInput] = useState(search || '');
  const [categoryInput, setCategoryInput] = useState(categoryId?.toString() || '');
  const [minPriceInput, setMinPriceInput] = useState(minPrice?.toString() || '');
  const [maxPriceInput, setMaxPriceInput] = useState(maxPrice?.toString() || '');

  // Fetch products
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['products', page, search, categoryId, minPrice, maxPrice],
    queryFn: () => fetchProducts({ page, search, categoryId, minPrice, maxPrice }),
  });

  const products = data?.products.map((product) => ({
    ...product,
    price: product.price.toString(),
    compareAtPrice: product.compareAtPrice ? product.compareAtPrice.toString() : null,
    images: product.images.map(({ id, url }: any) => ({ id, url })),
  })) || [];

  const categories = data?.categories || [];
  const pagination = data?.pagination;
  const total = pagination?.total || 0;
  const totalPages = pagination?.totalPages || 1;

  const startItem = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const endItem = Math.min(page * PAGE_SIZE, total);

  const baseQuery = {
    search: search ?? undefined,
    categoryId: categoryId ?? undefined,
    minPrice: minPrice ?? undefined,
    maxPrice: maxPrice ?? undefined,
  };

  const prevHref = `/products${buildQueryString({ ...baseQuery, page: page - 1 })}`;
  const nextHref = `/products${buildQueryString({ ...baseQuery, page: page + 1 })}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = buildQueryString({
      search: searchInput || undefined,
      categoryId: categoryInput || undefined,
      minPrice: minPriceInput || undefined,
      maxPrice: maxPriceInput || undefined,
      page: 1, // Reset to page 1 on new search
    });
    router.push(`/products${query}`);
  };

  const handleReset = () => {
    setSearchInput('');
    setCategoryInput('');
    setMinPriceInput('');
    setMaxPriceInput('');
    router.push('/products');
  };

  const handleQuickPrice = (price: number) => {
    const query = buildQueryString({
      ...baseQuery,
      maxPrice: price,
      page: 1,
    });
    router.push(`/products${query}`);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative flex items-center justify-center overflow-hidden pt-24 pb-12">
        {/* Background Gradient */}
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-foreground via-foreground/95 via-primary/5 to-background/90" />
        
        {/* Decorative Orbs */}
        <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden">
          <div className="absolute -left-20 -top-20 h-96 w-96 animate-pulse rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 h-[32rem] w-[32rem] animate-pulse rounded-full bg-secondary/10 blur-3xl delay-1000" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center md:px-6">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-background/80 px-4 py-2 text-sm font-semibold text-primary shadow-lg backdrop-blur-md">
            <Sparkles className="h-4 w-4" />
            <span>Our Collection</span>
          </div>
          
          <h1 className="mb-6 font-serif text-4xl font-bold leading-tight text-foreground drop-shadow-lg md:text-5xl lg:text-6xl">
            <span className="block">Discover</span>
            {/* <span className="block bg-gradient-to-r from-primary via-primary to-secondary bg-clip-text text-transparent">
              Handcrafted Treasures
            </span> */}
          </h1>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative">
        <div className="container w-full px-4 md:px-6">
          <div className="flex flex-col gap-8 lg:flex-row">
            {/* Filters Sidebar - Always visible on large screens */}
            <aside className="h-fit space-y-6">
              <div className="rounded-2xl border border-border/60 bg-background p-6 shadow-lg lg:sticky lg:top-24">
                <div className="mb-6 space-y-1">
                  <h2 className="font-serif text-2xl font-bold text-foreground">Filters</h2>
                  <p className="text-sm text-muted-foreground">
                    Refine your search to find the perfect piece
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Search */}
                  <div className="space-y-2">
                    <Label htmlFor="search" className="text-sm font-semibold text-foreground">
                      Search
                    </Label>
                    <Input
                      id="search"
                      name="search"
                      placeholder="Search products..."
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      className="h-11 rounded-xl border-border/60"
                    />
                  </div>

                  {/* Category */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <Tag className="h-4 w-4 text-primary" />
                      Category
                    </Label>
                    <select
                      id="categoryId"
                      name="categoryId"
                      value={categoryInput}
                      onChange={(e) => setCategoryInput(e.target.value)}
                      className="h-11 w-full rounded-xl border border-border/60 bg-background px-3 text-sm shadow-sm focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
                      disabled={isLoading}
                    >
                      <option value="">All categories</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Price Range */}
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <SlidersHorizontal className="h-4 w-4 text-primary" />
                      Price Range (NPR)
                    </Label>
                    <div className="grid gap-3 grid-cols-2">
                      <Input
                        id="minPrice"
                        name="minPrice"
                        type="number"
                        min="0"
                        placeholder="Min"
                        value={minPriceInput}
                        onChange={(e) => setMinPriceInput(e.target.value)}
                        className="h-11 rounded-xl border-border/60"
                      />
                      <Input
                        id="maxPrice"
                        name="maxPrice"
                        type="number"
                        min="0"
                        placeholder="Max"
                        value={maxPriceInput}
                        onChange={(e) => setMaxPriceInput(e.target.value)}
                        className="h-11 rounded-xl border-border/60"
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 pt-2">
                    <Button type="submit" className="h-11 rounded-xl font-semibold" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        'Apply Filters'
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      type="button" 
                      className="h-11 rounded-xl" 
                      onClick={handleReset}
                      disabled={isLoading}
                    >
                      Reset All
                    </Button>
                  </div>
                </form>

                {/* Quick Price Filters */}
                <div className="mt-6 space-y-2 border-t border-border/60 pt-6">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Quick Filters
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {[1000, 2000, 5000, 8000, 10000].map((price) => (
                      <Button
                        key={price}
                        variant={Number(maxPrice) === price ? 'default' : 'outline'}
                        size="sm"
                        className="rounded-full text-xs"
                        onClick={() => handleQuickPrice(price)}
                        disabled={isLoading}
                      >
                        ≤ NPR {price.toLocaleString()}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            {/* Products Grid - Takes remaining space */}
            <div className="space-y-6 w-full">
              {/* Results Header */}
              {/* {!isLoading && !isError && (
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border/60 bg-muted/20 px-6 py-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Showing Results</p>
                    <p className="font-serif text-xl font-bold text-foreground">
                      {startItem}-{endItem} of {total} {total === 1 ? 'Product' : 'Products'}
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </div>
                </div>
              )} */}

              {/* Loading State */}
              {isLoading && (
                <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-border/60 bg-muted/10 p-12">
                  <div className="text-center">
                    <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                    <p className="mt-4 text-muted-foreground">Loading products...</p>
                  </div>
                </div>
              )}

              {/* Error State */}
              {isError && (
                <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-border/60 bg-destructive/10 p-12 text-center">
                  <div className="space-y-3">
                    <p className="font-serif text-xl font-semibold text-destructive">
                      Error loading products
                    </p>
                    <p className="text-muted-foreground">
                      {error instanceof Error ? error.message : 'Something went wrong'}
                    </p>
                    <Button 
                      variant="outline" 
                      className="mt-4 rounded-xl" 
                      onClick={() => window.location.reload()}
                    >
                      Try Again
                    </Button>
                  </div>
                </div>
              )}

              {/* Products or Empty State */}
              {!isLoading && !isError && (
                <>
                  {products.length === 0 ? (
                    <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/10 p-12 text-center">
                      <div className="space-y-3">
                        <p className="font-serif text-xl font-semibold text-foreground">
                          No products found
                        </p>
                        <p className="text-muted-foreground">
                          Try adjusting your filters or explore other categories
                        </p>
                        <Button 
                          variant="outline" 
                          className="mt-4 rounded-xl" 
                          onClick={handleReset}
                        >
                          View All Products
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {products.map((product: Product) => (
                          <ProductCard key={product.id} product={product} />
                        ))}
                      </div>

                      {/* Pagination */}
                      <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
                        <p className="text-sm text-muted-foreground">
                          Showing {startItem}-{endItem} of {total} products
                        </p>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={page === 1}
                            asChild={page > 1}
                            className="rounded-xl"
                          >
                            {page === 1 ? (
                              <span>Previous</span>
                            ) : (
                              <Link href={prevHref}>Previous</Link>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={page >= totalPages}
                            asChild={page < totalPages}
                            className="rounded-xl"
                          >
                            {page >= totalPages ? (
                              <span>Next</span>
                            ) : (
                              <Link href={nextHref}>Next</Link>
                            )}
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}