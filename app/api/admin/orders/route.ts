import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';

import { prisma } from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const querySchema = z.object({
  page: z.string().optional(),
  pageSize: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session as any)?.user?.role;

    if (!session?.user?.id || role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const parsed = querySchema.safeParse({
      page: searchParams.get('page') ?? undefined,
      pageSize: searchParams.get('pageSize') ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { message: 'Invalid query params', errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const page = Math.max(1, parseInt(parsed.data.page ?? '1', 10) || 1);
    const pageSize = Math.min(50, Math.max(1, parseInt(parsed.data.pageSize ?? '10', 10) || 10));
    const skip = (page - 1) * pageSize;

    const [orders, total] = await prisma.$transaction([
      prisma.order.findMany({
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              name: true,
              email: true,
              phoneNubmer: true,
            },
          },
          _count: { select: { items: true } },
        },
      }),
      prisma.order.count(),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    return NextResponse.json({
      orders: orders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount.toString(),
        status: order.status,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt.toISOString(),
        itemCount: order._count.items,
        customer: {
          name: order.user?.name ?? 'Guest',
          email: order.user?.email ?? 'N/A',
          phoneNumber: order.user?.phoneNubmer ?? 'N/A',
        },
      })),
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Admin orders GET error:', error);
    return NextResponse.json({ message: 'Failed to fetch orders' }, { status: 500 });
  }
}
