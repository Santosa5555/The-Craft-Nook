// prisma/seed.ts
// Seed script to create an initial admin user

import bcrypt from 'bcrypt';
import { PrismaClient } from '../lib/generated/prisma';

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

async function main() {
  const email = 'admin@gmail.com';
  const plainPassword = 'Super@123';

  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  // Use upsert so it's safe to run multiple times
  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      role: 'ADMIN',
    },
    create: {
      email,
      name: 'Admin',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log('✅ Admin user seeded:', {
    id: admin.id,
    email: admin.email,
    role: admin.role,
  });
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
