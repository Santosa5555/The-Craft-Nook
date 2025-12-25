import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const updateCartItemSchema = z.object({
  quantity: z.number().int().min(1),
});

// PATCH /api/cart/[itemId] - Update cart item quantity
export async function PATCH(request: Request, { params }: { params: { itemId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const itemId = parseInt(params.itemId);
    const body = await request.json();
    const parsed = updateCartItemSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: 'Invalid request data', errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { quantity } = parsed.data;

    // Verify cart item belongs to user
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: {
        cart: true,
        product: true,
      },
    });

    if (!cartItem || cartItem.cart.userId !== userId) {
      return NextResponse.json({ message: 'Cart item not found' }, { status: 404 });
    }

    // Check stock
    if (cartItem.product.stock < quantity) {
      return NextResponse.json(
        { message: `Only ${cartItem.product.stock} items available in stock` },
        { status: 400 }
      );
    }

    // Update quantity
    await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });

    return NextResponse.json({ message: 'Cart item updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Update cart item error:', error);
    return NextResponse.json({ message: 'Failed to update cart item' }, { status: 500 });
  }
}

// DELETE /api/cart/[itemId] - Remove item from cart
export async function DELETE(request: Request, { params }: { params: { itemId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const itemId = parseInt(params.itemId);

    // Verify cart item belongs to user
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: {
        cart: true,
      },
    });

    if (!cartItem || cartItem.cart.userId !== userId) {
      return NextResponse.json({ message: 'Cart item not found' }, { status: 404 });
    }

    // Delete cart item
    await prisma.cartItem.delete({
      where: { id: itemId },
    });

    return NextResponse.json({ message: 'Item removed from cart successfully' }, { status: 200 });
  } catch (error) {
    console.error('Delete cart item error:', error);
    return NextResponse.json({ message: 'Failed to remove item from cart' }, { status: 500 });
  }
}
