'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect, useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, MapPin, CreditCard, ArrowLeft, Check } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const deliveryFormSchema = z.object({
  name: z.string().min(1, 'Full name is required'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  region: z.string().min(1, 'Region is required'),
  city: z.string().min(1, 'City is required'),
  street: z.string().min(1, 'Street address is required'),
});

type DeliveryFormValues = z.infer<typeof deliveryFormSchema>;

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

type UserAddress = {
  name: string;
  phoneNumber: string;
  region: string;
  city: string;
  street: string;
  hasAddress: boolean;
};

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/checkout');
    }
  }, [status, router]);

  // Fetch cart data
  const { data: cartData, isLoading: cartLoading } = useQuery<CartData>({
    queryKey: ['cart'],
    queryFn: async () => {
      const response = await axios.get('/api/cart');
      return response.data;
    },
    enabled: status === 'authenticated',
  });

  // Fetch user address
  const { data: userAddress, isLoading: addressLoading } = useQuery<UserAddress>({
    queryKey: ['user-address'],
    queryFn: async () => {
      const response = await axios.get('/api/user/address');
      return response.data;
    },
    enabled: status === 'authenticated',
  });

  // Form setup
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<DeliveryFormValues>({
    resolver: zodResolver(deliveryFormSchema),
    defaultValues: {
      name: '',
      phoneNumber: '',
      region: '',
      city: '',
      street: '',
    },
  });

  // Pre-fill form when address data loads
  useEffect(() => {
    if (userAddress?.hasAddress) {
      setValue('name', userAddress.name);
      setValue('phoneNumber', userAddress.phoneNumber);
      setValue('region', userAddress.region);
      setValue('city', userAddress.city);
      setValue('street', userAddress.street);
    }
  }, [userAddress, setValue]);

  // Save address mutation
  const saveAddressMutation = useMutation({
    mutationFn: async (data: DeliveryFormValues) => {
      const response = await axios.patch('/api/user/address', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-address'] });
    },
  });

  // Handle form submission
  const onSubmit = async (data: DeliveryFormValues) => {
    try {
      await saveAddressMutation.mutateAsync(data);
      // Form is saved, ready for payment
    } catch (error) {
      console.error('Failed to save address:', error);
    }
  };

  const handlePayment = async () => {
    // Validate form first
    const formData = {
      name: (document.querySelector('[name="name"]') as HTMLInputElement)?.value || '',
      phoneNumber:
        (document.querySelector('[name="phoneNumber"]') as HTMLInputElement)?.value || '',
      region: (document.querySelector('[name="region"]') as HTMLInputElement)?.value || '',
      city: (document.querySelector('[name="city"]') as HTMLInputElement)?.value || '',
      street: (document.querySelector('[name="street"]') as HTMLInputElement)?.value || '',
    };

    const validation = deliveryFormSchema.safeParse(formData);
    if (!validation.success) {
      alert('Please fill in all required fields');
      return;
    }

    // Save address before proceeding
    await saveAddressMutation.mutateAsync(validation.data);

    // Create order from selected cart items before initiating payment
    const orderResponse = await axios.post('/api/orders', {
      items: filteredItems.map((item) => item.id),
    });

    const {
      id: orderId,
      orderNumber,
      totalAmount,
    } = orderResponse.data as {
      id: number;
      orderNumber: string;
      totalAmount: string;
    };

    const amountInPaisa = Math.round(Number(totalAmount) * 100);

    const response = await axios.post('/api/payment', {
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?orderId=${orderId}`,
      website_url: `${process.env.NEXT_PUBLIC_BASE_URL}`,
      amount: amountInPaisa,
      purchase_order_id: orderNumber,
      purchase_order_name: filteredItems.map((item) => item.product.name).join(','),
      product_details: filteredItems.map((item) => ({
        identity: item.product.id.toString(),
        name: item.product.name,
        total_price: Math.round(Number(item.product.price) * Number(item.quantity) * 100),
        quantity: Number(item.quantity),
        unit_price: Number(item.product.price),
      })),
    });

    if (response.data.pidx) {
      redirect(`${response.data.payment_url}`);
    }
  };

  if (status === 'loading' || cartLoading || addressLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!session || !cartData) {
    return null;
  }

  const selectedParam = searchParams.get('items');
  const selectedIds =
    selectedParam
      ?.split(',')
      .map((v) => parseInt(v.trim()))
      .filter((v) => !Number.isNaN(v)) ?? [];

  const filteredItems =
    selectedIds.length > 0
      ? cartData.items.filter((item) => selectedIds.includes(item.id))
      : cartData.items;

  if (cartData.items.length === 0 || filteredItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="mx-auto max-w-2xl">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <p className="text-muted-foreground mb-4 text-center">Your cart is empty</p>
            <Button asChild>
              <Link href="/products">Continue Shopping</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const subtotal = filteredItems.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0
  );
  const shipping = 0; // Can be calculated later
  const tax = 0; // Can be calculated later
  const total = subtotal + shipping + tax;

  return (
    <div className="from-background to-muted/20 min-h-screen bg-gradient-to-b">
      <div className="container mx-auto px-4 py-8 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" className="mb-4 gap-2" asChild>
            <Link href="/cart">
              <ArrowLeft className="h-4 w-4" />
              Back to Cart
            </Link>
          </Button>
          <h1 className="text-foreground font-serif text-3xl font-bold">Checkout</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Complete your order with secure delivery information
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          {/* Left Side - Delivery Information Form */}
          <div className="space-y-6">
            <Card className="border-border/70 bg-background/95 shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 rounded-full p-2">
                    <MapPin className="text-primary h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-foreground font-serif text-xl">
                      Delivery Information
                    </CardTitle>
                    <p className="text-muted-foreground mt-1 text-sm">
                      We'll save this for your next order
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Full Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Full Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="name"
                      {...register('name')}
                      placeholder="Enter your full name"
                      className={errors.name ? 'border-destructive' : ''}
                    />
                    {errors.name && (
                      <p className="text-destructive text-xs">{errors.name.message}</p>
                    )}
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">
                      Phone Number <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      {...register('phoneNumber')}
                      placeholder="e.g., 9841234567"
                      className={errors.phoneNumber ? 'border-destructive' : ''}
                    />
                    {errors.phoneNumber && (
                      <p className="text-destructive text-xs">{errors.phoneNumber.message}</p>
                    )}
                  </div>

                  {/* Region */}
                  <div className="space-y-2">
                    <Label htmlFor="region">
                      Region/Province <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="region"
                      {...register('region')}
                      placeholder="e.g., Bagmati Province"
                      className={errors.region ? 'border-destructive' : ''}
                    />
                    {errors.region && (
                      <p className="text-destructive text-xs">{errors.region.message}</p>
                    )}
                  </div>

                  {/* City */}
                  <div className="space-y-2">
                    <Label htmlFor="city">
                      City <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="city"
                      {...register('city')}
                      placeholder="e.g., Kathmandu"
                      className={errors.city ? 'border-destructive' : ''}
                    />
                    {errors.city && (
                      <p className="text-destructive text-xs">{errors.city.message}</p>
                    )}
                  </div>

                  {/* Street Address */}
                  <div className="space-y-2">
                    <Label htmlFor="street">
                      Street Address <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="street"
                      {...register('street')}
                      placeholder="Enter your complete street address"
                      rows={3}
                      className={errors.street ? 'border-destructive' : ''}
                    />
                    {errors.street && (
                      <p className="text-destructive text-xs">{errors.street.message}</p>
                    )}
                  </div>

                  {/* Save Address Button */}
                  <Button
                    type="submit"
                    variant="outline"
                    className="w-full"
                    disabled={isSubmitting || saveAddressMutation.isPending}
                  >
                    {isSubmitting || saveAddressMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : saveAddressMutation.isSuccess ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Address Saved
                      </>
                    ) : (
                      'Save Address'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Order Summary */}
          <div className="lg:sticky lg:top-24">
            <Card className="border-border/70 bg-background/95 shadow-lg">
              <CardHeader>
                <CardTitle className="text-foreground font-serif text-xl">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Order Items */}
                <div className="space-y-4">
                  {filteredItems.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="border-border/60 relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border">
                        {item.product.image ? (
                          <Image
                            src={
                              item.product.image.startsWith('/')
                                ? item.product.image
                                : `/uploads/${item.product.image}`
                            }
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="bg-muted flex h-full w-full items-center justify-center">
                            <span className="text-muted-foreground text-xs">No Image</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <h3 className="text-foreground font-medium">{item.product.name}</h3>
                        <p className="text-muted-foreground text-sm">Quantity: {item.quantity}</p>
                        <p className="text-foreground font-semibold">
                          NPR {(Number(item.product.price) * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Totals */}
                <div className="border-border/70 space-y-3 border-t pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground font-semibold">
                      NPR{' '}
                      {subtotal.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    {/* <span className="text-foreground font-semibold">
                      {shipping === 0 ? 'Free' : `NPR ${shipping.toLocaleString()}`}
                    </span> */}
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    {/* <span className="text-foreground font-semibold">
                      {tax === 0 ? 'Included' : `NPR ${tax.toLocaleString()}`}
                    </span> */}
                  </div>
                  <div className="border-border/70 flex justify-between border-t pt-3">
                    <span className="text-foreground font-serif text-lg font-semibold">Total</span>
                    <span className="text-foreground font-serif text-xl font-bold">
                      NPR{' '}
                      {total.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>

                {/* Payment Button */}
                <Button
                  onClick={handlePayment}
                  className="from-primary to-secondary text-primary-foreground hover:from-primary/90 hover:to-secondary/90 w-full cursor-pointer gap-2 bg-gradient-to-r font-semibold shadow-lg transition-all hover:shadow-xl"
                  size="lg"
                  disabled={saveAddressMutation.isPending}
                >
                  <CreditCard className="h-5 w-5" />
                  Proceed to Payment (Khalti)
                </Button>

                <Button variant="outline" className="w-full" asChild>
                  <Link href="/cart">Back to Cart</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
