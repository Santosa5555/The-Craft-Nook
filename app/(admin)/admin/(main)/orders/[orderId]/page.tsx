import { notFound } from 'next/navigation';
import Image from 'next/image';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

type PageProps = {
  params: { orderId: string };
};

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-800',
    PROCESSING: 'bg-blue-100 text-blue-800',
    SHIPPED: 'bg-indigo-100 text-indigo-800',
    DELIVERED: 'bg-emerald-100 text-emerald-800',
    CANCELLED: 'bg-rose-100 text-rose-800',
    REFUNDED: 'bg-slate-200 text-slate-800',
  };
  return map[status] ?? 'bg-muted text-foreground';
};

const paymentBadge = (status: string) => {
  const map: Record<string, string> = {
    UNPAID: 'bg-slate-200 text-slate-800',
    PAID: 'bg-emerald-100 text-emerald-800',
    REFUNDED: 'bg-rose-100 text-rose-800',
  };
  return map[status] ?? 'bg-muted text-foreground';
};

export default async function AdminOrderDetailPage({ params }: PageProps) {
  const user = await getCurrentUser();

  if (!user || user.role !== 'ADMIN') {
    notFound();
  }

  const orderId = parseInt(params.orderId, 10);
  if (Number.isNaN(orderId)) {
    notFound();
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          phoneNubmer: true,
        },
      },
      items: {
        include: {
          product: {
            include: {
              images: { orderBy: { position: 'asc' }, take: 1 },
            },
          },
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  const shipping = order.shippingAddress as any;
  const billing = order.billingAddress as any;
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-foreground text-2xl font-semibold">Order #{order.orderNumber}</h1>
          <p className="text-muted-foreground text-sm">
            Placed on {order.createdAt.toLocaleDateString()} • {itemCount} items
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge className={statusBadge(order.status)}>{order.status}</Badge>
          <Badge className={paymentBadge(order.paymentStatus)}>{order.paymentStatus}</Badge>
          <Button asChild variant="outline">
            <Link href="/admin/orders">Back to Orders</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr,1fr]">
        {/* Items */}
        <Card className="border-border/70 bg-background/95 shadow-sm">
          <CardHeader>
            <CardTitle className="text-foreground font-serif text-xl">Items</CardTitle>
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

        {/* Summary + Addresses */}
        <div className="space-y-6">
          <Card className="border-border/70 bg-background/95 shadow-sm">
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

          <Card className="border-border/70 bg-background/95 shadow-sm">
            <CardHeader>
              <CardTitle className="text-foreground font-serif text-xl">
                Customer & Shipping
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-foreground font-medium">{order.user?.name ?? 'Customer'}</p>
                <p className="text-muted-foreground text-sm">{order.user?.email}</p>
                {order.user?.phoneNubmer && (
                  <p className="text-muted-foreground text-sm">{order.user.phoneNubmer}</p>
                )}
              </div>
              <div className="bg-muted/30 rounded-lg p-3">
                <p className="text-foreground text-sm font-medium">Shipping Address</p>
                {shipping?.name && <p className="text-sm">{shipping.name}</p>}
                {shipping?.street && <p className="text-sm">{shipping.street}</p>}
                <p className="text-sm">
                  {[shipping?.city, shipping?.region].filter(Boolean).join(', ')}
                </p>
                {shipping?.phoneNumber && (
                  <p className="text-muted-foreground mt-1 text-xs">
                    Phone: {shipping.phoneNumber}
                  </p>
                )}
              </div>
              <div className="bg-muted/30 rounded-lg p-3">
                <p className="text-foreground text-sm font-medium">Billing Address</p>
                {billing?.name && <p className="text-sm">{billing.name}</p>}
                {billing?.street && <p className="text-sm">{billing.street}</p>}
                <p className="text-sm">
                  {[billing?.city, billing?.region].filter(Boolean).join(', ')}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
