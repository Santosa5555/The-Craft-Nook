// app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';

// 🧾 Define schema using Zod
const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = RegisterSchema.safeParse(body);

    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      return NextResponse.json({ message: 'Validation error', errors }, { status: 400 });
    }

    const { name, email, password } = parsed.data;

    // 🔎 Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { message: 'User already exists' },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // 🧑‍💻 Create user
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role: 'USER' },
      select: { id: true, email: true, name: true },
    });

    return NextResponse.json({ message: 'User created', user }, { status: 201 });
  } catch (err) {
    console.error('Register error:', err);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
