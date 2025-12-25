import { notFound, redirect } from 'next/navigation';
import Image from 'next/image';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

type OrderDetailPageProps = {
  params: { orderId: string };
};

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/auth/login');
  }

  const userId = parseInt(session.user.id);
  const orderId = parseInt(params.orderId);

  if (Number.isNaN(orderId)) {
    notFound();
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: {
                orderBy: { position: 'asc' },
                take: 1,
              },
            },
          },
        },
      },
    },
  });

  if (!order || order.userId !== userId) {
    notFound();
  }

  const shipping = order.shippingAddress as any;

  return (
    <div className="from-background to-muted/20 min-h-screen bg-gradient-to-b">
      <div className="container mx-auto px-4 py-16 lg:px-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-foreground font-serif text-3xl font-bold">
              Order #{order.orderNumber}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Placed on {order.createdAt.toLocaleDateString()}
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/products">Back to Shopping</Link>
          </Button>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.6fr,1fr]">
          {/* Items */}
          <Card className="border-border/70 bg-background/95 shadow-lg">
            <CardHeader>
              <CardTitle className="text-foreground font-serif text-xl">
                Items in this order
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="border-border/70 flex flex-col gap-4 rounded-xl border p-4 md:flex-row"
                >
                  <div className="bg-muted/40 relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg">
                    {item.product.images[0]?.url ? (
                      <Image
                        src={
                          item.product.images[0].url.startsWith('/')
                            ? item.product.images[0].url
                            : `/uploads/${item.product.images[0].url}`
                        }
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="text-muted-foreground flex h-full w-full items-center justify-center text-xs">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-foreground font-medium">{item.product.name}</h3>
                        <p className="text-muted-foreground text-xs">Quantity: {item.quantity}</p>
                      </div>
                      <p className="text-foreground font-semibold">
                        NPR {item.totalPrice.toString()}
                      </p>
                    </div>
                    <p className="text-muted-foreground text-xs">
                      Unit price: NPR {item.unitPrice.toString()}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Summary & Address */}
          <div className="space-y-6">
            <Card className="border-border/70 bg-background/95 shadow-lg">
              <CardHeader>
                <CardTitle className="text-foreground font-serif text-xl">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground font-semibold">
                    NPR {order.subtotal.toString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-foreground font-semibold">
                    NPR {order.shippingTotal.toString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="text-foreground font-semibold">
                    NPR {order.taxTotal.toString()}
                  </span>
                </div>
                <div className="border-border/70 mt-3 flex justify-between border-t pt-3">
                  <span className="text-foreground font-serif text-lg font-semibold">Total</span>
                  <span className="text-foreground font-serif text-xl font-bold">
                    NPR {order.totalAmount.toString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/70 bg-background/95 shadow-lg">
              <CardHeader>
                <CardTitle className="text-foreground font-serif text-xl">
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                {shipping?.name && <p className="text-foreground font-medium">{shipping.name}</p>}
                {shipping?.phoneNumber && (
                  <p className="text-foreground text-sm">{shipping.phoneNumber}</p>
                )}
                {shipping?.street && <p className="text-foreground text-sm">{shipping.street}</p>}
                <p className="text-foreground text-sm">
                  {[shipping?.city, shipping?.region].filter(Boolean).join(', ')}
                </p>
                <p className="text-muted-foreground mt-2 text-xs">
                  Delivery within Nepal. Our team will contact you if any clarification is needed.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
