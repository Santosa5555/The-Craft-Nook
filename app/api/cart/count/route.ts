import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// GET /api/cart/count - Get cart item count
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ count: 0 });
    }

    const userId = parseInt(session.user.id);

    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: true,
      },
    });

    const count = cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

    return NextResponse.json({ count });
  } catch (error) {
    console.error('Get cart count error:', error);
    return NextResponse.json({ count: 0 });
  }
}
