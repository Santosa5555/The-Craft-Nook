// types/next-auth.d.ts
import type { DefaultSession, DefaultUser } from "next-auth";
import type { JWT as NextAuthJWT } from "next-auth/jwt";
import type { User as PrismaUser } from "./generated/prisma"; // <- important: path to generated prisma types

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role?: PrismaUser["role"]; // keep role type in sync with Prisma
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    // NOTE: PrismaUser.id might be number; NextAuth expects string ids in sessions,
    // so in authorize() you should cast id to string. Here we keep role typed.
    role?: PrismaUser["role"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: PrismaUser["role"];
  }
}
