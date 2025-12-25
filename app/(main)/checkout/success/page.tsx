import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';

type SuccessPageProps = {
  searchParams?: { [key: string]: string | string[] | undefined };
};

export default async function CheckoutSuccessPage({ searchParams }: SuccessPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/auth/login');
  }

  const userId = parseInt(session.user.id);
  const orderIdParam = searchParams?.orderId;
  const orderId = Array.isArray(orderIdParam)
    ? parseInt(orderIdParam[0] ?? '')
    : parseInt(orderIdParam ?? '');

  if (!orderId || Number.isNaN(orderId)) {
    redirect('/cart');
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!order || order.userId !== userId) {
    redirect('/cart');
  }

  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="from-background to-muted/20 min-h-screen bg-gradient-to-b">
      <div className="container mx-auto px-4 py-16 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <Card className="border-border/70 bg-background/95 shadow-lg">
            <CardHeader className="space-y-4 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
                <CheckCircle2 className="h-10 w-10 text-emerald-500" />
              </div>
              <CardTitle className="text-foreground font-serif text-2xl">
                Payment Successful
              </CardTitle>
              <p className="text-muted-foreground text-sm">
                Thank you for supporting local artisans. Your order has been placed.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted/40 space-y-2 rounded-xl p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Order Number</span>
                  <span className="text-foreground font-medium">{order.orderNumber}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Items</span>
                  <span className="text-foreground font-medium">{itemCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Paid</span>
                  <span className="text-foreground font-semibold">
                    NPR {order.totalAmount.toString()}
                  </span>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <p className="text-muted-foreground">
                  You can review the full details of your order at any time from your orders page.
                </p>
              </div>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
                <Button asChild variant="outline">
                  <Link href="/products">Continue Shopping</Link>
                </Button>
                <Button asChild>
                  <Link href={`/orders/${order.id}`}>View Order Details</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
