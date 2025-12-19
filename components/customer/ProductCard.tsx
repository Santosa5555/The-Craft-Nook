'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';

import { Card, CardContent, CardFooter, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type ProductCardProps = {
  product: {
    id: number;
    slug: string;
    name: string;
    price: string;
    compareAtPrice?: string | null;
    category?: { id: number; name: string } | null;
    images: { id: number; url: string }[];
  };
};

export function ProductCard({ product }: ProductCardProps) {
  const primaryImage = product.images[0]?.url ?? '/placeholder.png';

  return (
    <Card className="group border-border/60 flex h-full flex-col overflow-hidden">
      <Link
        href={`/products/${product.slug}`}
        className="relative block aspect-[4/3] overflow-hidden"
      >
        <Image
          src={primaryImage}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 opacity-0 transition-opacity group-hover:opacity-100" />
      </Link>
      <CardContent className="flex flex-1 flex-col gap-3 p-4">
        <div className="space-y-1">
          {product.category?.name && (
            <p className="text-primary text-xs tracking-wide uppercase">{product.category.name}</p>
          )}
          <CardTitle className="text-base">
            <Link href={`/products/${product.slug}`} className="hover:text-primary">
              {product.name}
            </Link>
          </CardTitle>
        </div>
        <div className="mt-auto space-y-1">
          <p className="text-foreground text-lg font-semibold">
            NPR {Number(product.price).toLocaleString()}
          </p>
          {product.compareAtPrice && (
            <p className="text-muted-foreground text-xs line-through">
              NPR {Number(product.compareAtPrice).toLocaleString()}
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter className="border-border/80 bg-muted/40 flex items-center justify-between border-t px-4 py-3">
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-2"
          onClick={() => alert('Add to cart functionality coming soon.')}
        >
          <ShoppingCart className="h-4 w-4" />
          Add to cart
        </Button>
      </CardFooter>
    </Card>
  );
}
