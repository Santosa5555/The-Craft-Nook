import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const addressSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  region: z.string().min(1, 'Region is required'),
  city: z.string().min(1, 'City is required'),
  street: z.string().min(1, 'Street address is required'),
});

// GET /api/user/address - Get user address
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    if (isNaN(userId)) {
      return NextResponse.json({ message: 'Invalid user ID' }, { status: 400 });
    }

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

    // Return address if any field is filled
    const hasAddress = user.name || user.phoneNubmer || user.Region || user.city || user.Street;

    return NextResponse.json({
      name: user.name ?? '',
      phoneNumber: user.phoneNubmer ?? '',
      region: user.Region ?? '',
      city: user.city ?? '',
      street: user.Street ?? '',
      hasAddress: !!hasAddress,
    });
  } catch (error) {
    console.error('Get user address error:', error);
    return NextResponse.json({ message: 'Failed to load address' }, { status: 500 });
  }
}

// PATCH /api/user/address - Update user address
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    if (isNaN(userId)) {
      return NextResponse.json({ message: 'Invalid user ID' }, { status: 400 });
    }

    const body = await request.json();
    const parsed = addressSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: 'Validation error', errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, phoneNumber, region, city, street } = parsed.data;

    // Update user address
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        phoneNubmer: phoneNumber,
        Region: region,
        city,
        Street: street,
      },
      select: {
        name: true,
        phoneNubmer: true,
        Region: true,
        city: true,
        Street: true,
      },
    });

    return NextResponse.json({
      message: 'Address saved successfully',
      address: {
        name: updatedUser.name ?? '',
        phoneNumber: updatedUser.phoneNubmer ?? '',
        region: updatedUser.Region ?? '',
        city: updatedUser.city ?? '',
        street: updatedUser.Street ?? '',
      },
    });
  } catch (error) {
    console.error('Update user address error:', error);
    return NextResponse.json({ message: 'Failed to save address' }, { status: 500 });
  }
}
