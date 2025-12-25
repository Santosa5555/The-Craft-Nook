import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';

import { prisma } from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const updateSchema = z
  .object({
    status: z
      .enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'])
      .optional(),
    paymentStatus: z.enum(['UNPAID', 'PAID', 'REFUNDED']).optional(),
  })
  .refine((data) => data.status || data.paymentStatus, {
    message: 'Provide status or paymentStatus',
  });

type RouteContext = {
  params: { orderId: string };
};

export async function GET(_req: Request, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session as any)?.user?.role;

    if (!session?.user?.id || role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const orderId = parseInt(context.params.orderId, 10);
    if (Number.isNaN(orderId)) {
      return NextResponse.json({ message: 'Invalid order id' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phoneNubmer: true,
            Region: true,
            city: true,
            Street: true,
          },
        },
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

    if (!order) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({
      ...order,
      totalAmount: order.totalAmount.toString(),
      subtotal: order.subtotal.toString(),
      taxTotal: order.taxTotal.toString(),
      shippingTotal: order.shippingTotal.toString(),
      items: order.items.map((item) => ({
        ...item,
        unitPrice: item.unitPrice.toString(),
        totalPrice: item.totalPrice.toString(),
      })),
    });
  } catch (error) {
    console.error('Admin order detail GET error:', error);
    return NextResponse.json({ message: 'Failed to fetch order' }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session as any)?.user?.role;

    if (!session?.user?.id || role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const orderId = parseInt(context.params.orderId, 10);
    if (Number.isNaN(orderId)) {
      return NextResponse.json({ message: 'Invalid order id' }, { status: 400 });
    }

    const body = await request.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: 'Invalid data', errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { status, paymentStatus } = parsed.data;

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        ...(status ? { status } : {}),
        ...(paymentStatus ? { paymentStatus } : {}),
      },
    });

    return NextResponse.json({
      id: updated.id,
      status: updated.status,
      paymentStatus: updated.paymentStatus,
      updatedAt: updated.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error('Admin order PATCH error:', error);
    return NextResponse.json({ message: 'Failed to update order' }, { status: 500 });
  }
}
