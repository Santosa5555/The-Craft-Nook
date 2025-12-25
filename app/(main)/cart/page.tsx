'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Plus, Minus, Trash2, ShoppingBag, ArrowRight, Sparkles } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type CartItem = {
  id: number;
  productId: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    slug: string;
    price: string;
    compareAtPrice: string | null;
    image: string | null;
    category: { id: number; name: string } | null;
  };
};

type CartData = {
  items: CartItem[];
  subtotal: string;
  total: string;
  itemCount: number;
};

export default function CartPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const { data: cartData, isLoading } = useQuery<CartData>({
    queryKey: ['cart'],
    queryFn: async () => {
      const response = await axios.get('/api/cart');
      return response.data;
    },
    enabled: status === 'authenticated',
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: number; quantity: number }) => {
      await axios.patch(`/api/cart/${itemId}`, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['cart-count'] });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: number) => {
      await axios.delete(`/api/cart/${itemId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['cart-count'] });
    },
  });

  const handleQuantityChange = (itemId: number, currentQuantity: number, delta: number) => {
    const newQuantity = currentQuantity + delta;
    if (newQuantity < 1) return;
    updateQuantityMutation.mutate({ itemId, quantity: newQuantity });
  };

  const handleDelete = (itemId: number) => {
    if (window.confirm('Remove this item from cart?')) {
      deleteItemMutation.mutate(itemId);
    }
  };

  const items = cartData?.items ?? [];
  const subtotal = parseFloat(cartData?.subtotal ?? '0');
  const total = parseFloat(cartData?.total ?? '0');

  useEffect(() => {
    if (items.length === 0) {
      setSelectedIds((prev) => (prev.length === 0 ? prev : []));
      return;
    }

    setSelectedIds((prev) => {
      const next = items.map((item) => item.id);
      const sameLength = prev.length === next.length;
      const sameOrder = sameLength && prev.every((id, idx) => id === next[idx]);
      return sameOrder ? prev : next;
    });
  }, [items]);

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-16 text-center">
        <Card className="border-border/70 p-12">
          <CardContent className="space-y-4">
            <ShoppingBag className="text-muted-foreground mx-auto h-16 w-16" />
            <h2 className="text-foreground font-serif text-2xl font-bold">Please sign in</h2>
            <p className="text-muted-foreground">You need to be logged in to view your cart.</p>
            <Button asChild className="mt-4">
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const toggleItem = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const allSelected = selectedIds.length === items.length && items.length > 0;
  const toggleAll = () => {
    setSelectedIds(allSelected ? [] : items.map((item) => item.id));
  };

  const selectedItems = items.filter((item) => selectedIds.includes(item.id));
  const selectedSubtotal = selectedItems.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0
  );
  const selectedTotal = selectedSubtotal; // extend for shipping/tax later
  const nothingSelected = selectedIds.length === 0;

  return (
    <div className="from-background via-background to-muted/20 min-h-screen bg-gradient-to-br">
      {/* Hero Section */}
      <section className="relative flex min-h-[40vh] items-center justify-center overflow-hidden pt-24 pb-12">
        <div className="from-foreground via-foreground/95 via-primary/5 to-background/90 absolute inset-0 z-0 bg-gradient-to-br" />
        <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden">
          <div className="bg-primary/10 absolute -top-20 -left-20 h-96 w-96 animate-pulse rounded-full blur-3xl" />
          <div className="bg-secondary/10 absolute -right-20 -bottom-20 h-[32rem] w-[32rem] animate-pulse rounded-full blur-3xl delay-1000" />
        </div>
        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center md:px-6">
          <div className="border-primary/30 bg-background/80 text-primary mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold shadow-lg backdrop-blur-md">
            <Sparkles className="h-4 w-4" />
            <span>Shopping Cart</span>
          </div>
          <h1 className="text-foreground mb-4 font-serif text-4xl leading-tight font-bold drop-shadow-lg md:text-5xl lg:text-6xl">
            Your Cart
          </h1>
          <p className="text-foreground mx-auto max-w-2xl text-lg leading-relaxed font-medium drop-shadow-md md:text-xl">
            Review your handcrafted treasures before checkout
          </p>
        </div>
      </section>

      {/* Cart Content */}
      <section className="container mx-auto max-w-7xl px-4 pb-20 md:px-6">
        {items.length === 0 ? (
          <Card className="border-border/70 p-12 text-center">
            <CardContent className="space-y-4">
              <ShoppingBag className="text-muted-foreground mx-auto h-16 w-16" />
              <h2 className="text-foreground font-serif text-2xl font-bold">Your cart is empty</h2>
              <p className="text-muted-foreground">Start adding handcrafted items to your cart!</p>
              <Button asChild className="mt-4">
                <Link href="/products">Browse Products</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr,400px]">
            {/* Cart Items */}
            <div className="space-y-4">
              <h2 className="text-foreground font-serif text-xl font-semibold">
                Cart Items ({items.length})
              </h2>
              <div className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="border-border accent-primary h-4 w-4 rounded border"
                  aria-label="Select all items"
                />
                <span className="text-muted-foreground">Select all</span>
              </div>
              {items.map((item) => (
                <Card key={item.id} className="border-border/70 overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                      {/* Select Item */}
                      <div className="flex items-start pt-1">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(item.id)}
                          onChange={() => toggleItem(item.id)}
                          className="border-border accent-primary h-4 w-4 rounded border"
                          aria-label={`Select ${item.product.name}`}
                        />
                      </div>

                      {/* Product Image */}
                      <Link
                        href={`/products/${item.product.slug}`}
                        className="bg-muted/30 relative block h-32 w-32 flex-shrink-0 overflow-hidden rounded-lg"
                      >
                        <Image
                          src={
                            item.product.image
                              ? item.product.image.startsWith('/')
                                ? item.product.image
                                : `/${item.product.image}`
                              : '/placeholder.png'
                          }
                          alt={item.product.name}
                          fill
                          className="object-cover"
                          sizes="128px"
                        />
                      </Link>

                      {/* Product Info */}
                      <div className="flex flex-1 flex-col gap-2">
                        <Link
                          href={`/products/${item.product.slug}`}
                          className="text-foreground hover:text-primary font-serif text-lg font-semibold transition-colors"
                        >
                          {item.product.name}
                        </Link>
                        {item.product.category && (
                          <p className="text-primary text-xs tracking-wide uppercase">
                            {item.product.category.name}
                          </p>
                        )}
                        <div className="flex items-baseline gap-2">
                          <p className="text-foreground font-serif text-xl font-bold">
                            NPR {Number(item.product.price).toLocaleString()}
                          </p>
                          {item.product.compareAtPrice && (
                            <p className="text-muted-foreground text-sm line-through">
                              NPR {Number(item.product.compareAtPrice).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-4 sm:flex-col sm:items-end">
                        <div className="border-border/70 flex items-center gap-2 rounded-lg border">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                            disabled={updateQuantityMutation.isPending || item.quantity <= 1}
                            className="h-8 w-8"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="text-foreground min-w-[2rem] text-center font-semibold">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                            disabled={updateQuantityMutation.isPending}
                            className="h-8 w-8"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Delete Button */}
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleDelete(item.id)}
                          disabled={deleteItemMutation.isPending}
                          className="text-destructive hover:text-destructive h-8 w-8"
                          aria-label="Remove item"
                        >
                          {deleteItemMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>

                        {/* Item Total */}
                        <div className="text-right">
                          <p className="text-muted-foreground text-xs">Item Total</p>
                          <p className="text-foreground font-serif text-lg font-bold">
                            NPR {(Number(item.product.price) * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:sticky lg:top-24">
              <Card className="border-border/70 bg-background/95 p-6 shadow-lg">
                <h2 className="text-foreground mb-6 font-serif text-xl font-semibold">
                  Order Summary ({selectedIds.length} selected)
                </h2>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground font-semibold">
                      NPR{' '}
                      {selectedSubtotal.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-foreground font-semibold">Calculated at checkout</span>
                  </div>
                  <div className="border-border/70 my-4 border-t pt-4">
                    <div className="flex justify-between">
                      <span className="text-foreground font-serif text-lg font-semibold">
                        Total
                      </span>
                      <span className="text-foreground font-serif text-xl font-bold">
                        NPR{' '}
                        {selectedTotal.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </div>
                  <Button
                    className="from-primary to-secondary text-primary-foreground hover:from-primary/90 hover:to-secondary/90 w-full gap-2 bg-gradient-to-r font-semibold shadow-lg transition-all hover:shadow-xl"
                    size="lg"
                    onClick={() =>
                      router.push(
                        `/checkout${selectedIds.length ? `?items=${selectedIds.join(',')}` : ''}`
                      )
                    }
                    disabled={nothingSelected}
                  >
                    Proceed to Checkout
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/products">Continue Shopping</Link>
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
