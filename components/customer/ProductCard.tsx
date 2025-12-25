// 'use client';

// import Image from 'next/image';
// import Link from 'next/link';
// import { ShoppingCart } from 'lucide-react';

// import { Card, CardContent, CardFooter, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';

// type ProductCardProps = {
//   product: {
//     id: number;
//     slug: string;
//     name: string;
//     price: string;
//     compareAtPrice?: string | null;
//     category?: { id: number; name: string } | null;
//     images: { id: number; url: string }[];
//   };
// };

// export function ProductCard({ product }: ProductCardProps) {
//   const primaryImage = product.images[0]?.url ?? '/placeholder.png';

//   return (
//     <Card className="group border-border/60 flex h-full flex-col overflow-hidden">
//       <Link
//         href={`/products/${product.slug}`}
//         className="relative block aspect-[4/3] overflow-hidden"
//       >
//         <Image
//           src={primaryImage}
//           alt={product.name}
//           fill
//           className="object-cover transition-transform duration-500 group-hover:scale-105"
//           sizes="(max-width: 768px) 100vw, 33vw"
//         />
//         <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 opacity-0 transition-opacity group-hover:opacity-100" />
//       </Link>
//       <CardContent className="flex flex-1 flex-col gap-3 p-4">
//         <div className="space-y-1">
//           {product.category?.name && (
//             <p className="text-primary text-xs tracking-wide uppercase">{product.category.name}</p>
//           )}
//           <CardTitle className="text-base">
//             <Link href={`/products/${product.slug}`} className="hover:text-primary">
//               {product.name}
//             </Link>
//           </CardTitle>
//         </div>
//         <div className="mt-auto space-y-1">
//           <p className="text-foreground text-lg font-semibold">
//             NPR {Number(product.price).toLocaleString()}
//           </p>
//           {product.compareAtPrice && (
//             <p className="text-muted-foreground text-xs line-through">
//               NPR {Number(product.compareAtPrice).toLocaleString()}
//             </p>
//           )}
//         </div>
//       </CardContent>
//       <CardFooter className="border-border/80 bg-muted/40 flex items-center justify-between border-t px-4 py-3">
//         <Button
//           variant="outline"
//           size="sm"
//           className="w-full gap-2"
//           onClick={() => alert('Add to cart functionality coming soon.')}
//         >
//           <ShoppingCart className="h-4 w-4" />
//           Add to cart
//         </Button>
//       </CardFooter>
//     </Card>
//   );
// }
'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import axios from 'axios';
import { ShoppingCart, Loader2, Check } from 'lucide-react';
import { Card, CardContent, CardFooter, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQueryClient } from '@tanstack/react-query';

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
  const { data: session } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const primaryImage = product.images[0]?.url ?? '/placeholder.png';
  const hasDiscount =
    product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session) {
      router.push('/auth/login');
      return;
    }

    setIsAdding(true);
    setIsSuccess(false);

    try {
      await axios.post('/api/cart', {
        productId: product.id,
        quantity: 1,
      });

      setIsSuccess(true);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['cart-count'] });

      setTimeout(() => {
        setIsSuccess(false);
      }, 2000);
    } catch (error: any) {
      console.error('Add to cart error:', error);
      alert(error.response?.data?.message || 'Failed to add item to cart');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Card className="group border-border/60 bg-background hover:shadow-primary/5 relative flex h-full flex-col overflow-hidden rounded-2xl border shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* Product Image */}
      <Link
        href={`/products/${product.slug}`}
        className="bg-muted/30 relative block aspect-[4/3] overflow-hidden"
      >
        <Image
          src={primaryImage}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />

        {/* Overlay Gradient */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Discount Badge */}
        {hasDiscount && (
          <div className="bg-secondary text-secondary-foreground absolute top-3 right-3 rounded-full px-3 py-1 text-xs font-bold shadow-lg">
            Sale
          </div>
        )}
      </Link>

      {/* Card Content */}
      <CardContent className="flex flex-1 flex-col gap-3 p-5">
        {/* Category */}
        {product.category?.name && (
          <p className="text-primary text-xs font-semibold tracking-wider uppercase">
            {product.category.name}
          </p>
        )}

        {/* Product Name */}
        <CardTitle className="text-foreground font-serif text-lg leading-tight">
          <Link
            href={`/products/${product.slug}`}
            className="hover:text-primary transition-colors duration-200"
          >
            {product.name}
          </Link>
        </CardTitle>

        {/* Price Section */}
        <div className="mt-auto flex items-baseline gap-2">
          <p className="text-foreground font-serif text-xl font-bold">
            NPR {Number(product.price).toLocaleString()}
          </p>
          {product.compareAtPrice && (
            <p className="text-muted-foreground text-sm line-through">
              NPR {Number(product.compareAtPrice).toLocaleString()}
            </p>
          )}
        </div>
      </CardContent>

      {/* Card Footer */}
      <CardFooter className="border-border/60 bg-muted/20 border-t p-4">
        <Button
          variant="default"
          size="sm"
          className="w-full cursor-pointer gap-2 rounded-xl font-semibold transition-all duration-200 hover:gap-3"
          onClick={handleAddToCart}
          disabled={isAdding || isSuccess}
        >
          {isAdding ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Adding...
            </>
          ) : isSuccess ? (
            <>
              <Check className="h-4 w-4" />
              Added!
            </>
          ) : (
            <>
              <ShoppingCart className="h-4 w-4" />
              Add to Cart
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
