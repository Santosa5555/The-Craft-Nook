import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';

import { prisma } from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const createOrderSchema = z.object({
  items: z.array(z.number().int().positive()).min(1),
});

// POST /api/orders - Create an order from selected cart items
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    if (Number.isNaN(userId)) {
      return NextResponse.json({ message: 'Invalid user id' }, { status: 400 });
    }

    const body = await request.json();
    const parsed = createOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: 'Invalid request data', errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { items: cartItemIds } = parsed.data;

    // Load cart with items for this user
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          where: { id: { in: cartItemIds } },
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json(
        { message: 'No matching cart items found for this user' },
        { status: 400 }
      );
    }

    // Compute totals from cart items
    const subtotal = cart.items.reduce((sum, item) => {
      return sum + Number(item.product.price) * item.quantity;
    }, 0);

    const shippingTotal = 0; // Extend later if needed
    const taxTotal = 0; // Extend later if needed
    const totalAmount = subtotal + shippingTotal + taxTotal;

    // Fetch user address info (saved via /api/user/address)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        phoneNubmer: true,
        Region: true,
        city: true,
        Street: true,
      },
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const shippingAddress = {
      name: user.name,
      phoneNumber: user.phoneNubmer,
      region: user.Region,
      city: user.city,
      street: user.Street,
      country: 'Nepal',
    };

    // For now billing is same as shipping
    const billingAddress = shippingAddress;

    const orderNumber = `HH-${Date.now()}-${Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0')}`;

    const createdOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId,
          subtotal,
          totalAmount,
          taxTotal,
          shippingTotal,
          shippingAddress,
          billingAddress,
          // status and paymentStatus use defaults
        },
      });

      // Create order items
      await tx.orderItem.createMany({
        data: cart.items.map((item) => ({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.product.price,
          totalPrice: item.product.price.mul(item.quantity),
        })),
      });

      // Remove these items from cart
      await tx.cartItem.deleteMany({
        where: { id: { in: cart.items.map((item) => item.id) } },
      });

      return order;
    });

    return NextResponse.json(
      {
        id: createdOrder.id,
        orderNumber: createdOrder.orderNumber,
        subtotal: createdOrder.subtotal.toString(),
        totalAmount: createdOrder.totalAmount.toString(),
        shippingTotal: createdOrder.shippingTotal.toString(),
        taxTotal: createdOrder.taxTotal.toString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json({ message: 'Failed to create order' }, { status: 500 });
  }
}
