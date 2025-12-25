import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const addToCartSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().positive().default(1),
});

// GET /api/cart - Get user's cart
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(session.user.id);

    // Get or create cart
    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: {
                  orderBy: { position: 'asc' },
                  take: 1,
                },
                category: {
                  select: { id: true, name: true },
                },
              },
            },
          },
          orderBy: { id: 'asc' },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: {
                    orderBy: { position: 'asc' },
                    take: 1,
                  },
                  category: {
                    select: { id: true, name: true },
                  },
                },
              },
            },
            orderBy: { id: 'asc' },
          },
        },
      });
    }

    // Calculate totals
    const items = cart.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      product: {
        id: item.product.id,
        name: item.product.name,
        slug: item.product.slug,
        price: item.product.price.toString(),
        compareAtPrice: item.product.compareAtPrice?.toString() ?? null,
        image: item.product.images[0]?.url ?? null,
        category: item.product.category,
      },
    }));

    const subtotal = cart.items.reduce((sum, item) => {
      return sum + Number(item.product.price) * item.quantity;
    }, 0);

    return NextResponse.json({
      items,
      subtotal: subtotal.toFixed(2),
      total: subtotal.toFixed(2), // Can add tax/shipping later
      itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
    });
  } catch (error) {
    console.error('Get cart error:', error);
    return NextResponse.json({ message: 'Failed to load cart' }, { status: 500 });
  }
}

// POST /api/cart - Add item to cart
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    if (isNaN(userId)) {
      return NextResponse.json({ message: 'Invalid user ID' }, { status: 400 });
    }

    // Verify user exists before creating cart
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!userExists) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const parsed = addToCartSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: 'Invalid request data', errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { productId, quantity } = parsed.data;

    // Verify product exists and is active
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || !product.isActive) {
      return NextResponse.json({ message: 'Product not found or unavailable' }, { status: 404 });
    }

    // Check stock
    if (product.stock < quantity) {
      return NextResponse.json(
        { message: `Only ${product.stock} items available in stock` },
        { status: 400 }
      );
    }

    // Get or create cart (using upsert to handle race conditions)
    let cart;
    try {
      cart = await prisma.cart.upsert({
        where: { userId },
        update: {},
        create: { userId },
      });
    } catch (cartError: any) {
      console.error('Cart upsert error:', cartError);
      // If cart creation fails due to foreign key, user might not exist
      if (cartError?.code === 'P2003') {
        return NextResponse.json(
          { message: 'Failed to create cart. User may not exist in database.' },
          { status: 400 }
        );
      }
      throw cartError;
    }

    // Verify cart was created successfully
    if (!cart || !cart.id || cart.id <= 0) {
      console.error('Invalid cart after upsert:', cart);
      return NextResponse.json({ message: 'Failed to create or retrieve cart' }, { status: 500 });
    }

    // Verify product still exists (double-check before creating cart item)
    const productCheck = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, isActive: true, stock: true },
    });

    if (!productCheck || !productCheck.isActive) {
      return NextResponse.json({ message: 'Product no longer available' }, { status: 404 });
    }

    // Check if item already exists in cart
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    });

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + quantity;
      if (product.stock < newQuantity) {
        return NextResponse.json(
          { message: `Only ${product.stock} items available in stock` },
          { status: 400 }
        );
      }

      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
    } else {
      // Create new cart item (handle potential race condition)
      try {
        // Double-check IDs are valid before creating
        if (!cart.id || !productId || cart.id <= 0 || productId <= 0) {
          return NextResponse.json(
            { message: 'Invalid cart or product ID', cartId: cart.id, productId },
            { status: 400 }
          );
        }

        await prisma.cartItem.create({
          data: {
            cartId: cart.id,
            productId,
            quantity,
          },
        });
      } catch (createError: any) {
        console.error('CartItem creation error:', createError);
        console.error('Attempted values:', { cartId: cart.id, productId, quantity });

        // If item was added by another concurrent request, update it instead
        if (createError?.code === 'P2002') {
          const existingItem = await prisma.cartItem.findUnique({
            where: {
              cartId_productId: {
                cartId: cart.id,
                productId,
              },
            },
          });

          if (existingItem) {
            const newQuantity = existingItem.quantity + quantity;
            if (product.stock < newQuantity) {
              return NextResponse.json(
                { message: `Only ${product.stock} items available in stock` },
                { status: 400 }
              );
            }

            await prisma.cartItem.update({
              where: { id: existingItem.id },
              data: { quantity: newQuantity },
            });
          } else {
            throw createError;
          }
        } else if (createError?.code === 'P2003') {
          // Foreign key constraint violation - verify references exist
          const cartExists = await prisma.cart.findUnique({
            where: { id: cart.id },
            select: { id: true },
          });
          const productExists = await prisma.product.findUnique({
            where: { id: productId },
            select: { id: true },
          });

          return NextResponse.json(
            {
              message: 'Invalid product or cart reference',
              details: {
                cartExists: !!cartExists,
                productExists: !!productExists,
                cartId: cart.id,
                productId,
              },
            },
            { status: 400 }
          );
        } else {
          throw createError;
        }
      }
    }

    return NextResponse.json({ message: 'Item added to cart successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Add to cart error:', error);
    console.error('Error details:', {
      message: error?.message,
      code: error?.code,
      meta: error?.meta,
      stack: error?.stack,
    });

    // Handle Prisma errors
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { message: 'Item already exists in cart. Please update quantity instead.' },
        { status: 409 }
      );
    }

    if (error?.code === 'P2003') {
      return NextResponse.json({ message: 'Invalid product or cart reference' }, { status: 400 });
    }

    return NextResponse.json(
      {
        message: 'Failed to add item to cart',
        error: process.env.NODE_ENV === 'development' ? error?.message : undefined,
      },
      { status: 500 }
    );
  }
}
