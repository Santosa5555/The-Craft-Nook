'use client';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ShoppingCart } from "lucide-react";

type Props = { initialUser: any };

export default function CustomerHeader({ initialUser }: Props) {
  const { data: session } = useSession();

  const user = session?.user || initialUser;

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-primary">
           Handicraft
        </Link>

        {/* Customer Actions */}
        <div className="flex items-center gap-4">
          {/* Cart - Always visible for customers */}
          <Link href="/cart" className="relative p-2 text-foreground hover:text-primary">
            <ShoppingCart className="h-6 w-6" />
            {/* Add cart count badge later */}
            <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-primary text-xs text-primary-foreground">
              3
            </span>
          </Link>

          {/* GUEST */}
          {!user && (
            <>
              <Link href="/login">
                <Button variant="ghost" className="text-foreground">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Get Started
                </Button>
              </Link>
            </>
          )}

          {/* LOGGED-IN CUSTOMER */}
          {user && user.role === 'USER' && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{user.name}</span>
              <Button variant="ghost" size="sm" onClick={() => signOut()}>
                Logout
              </Button>
            </div>
          )}

          {/* HIDE ADMIN FROM CUSTOMER HEADER */}
          {user?.role === 'ADMIN' && (
            <Link href="/dashboard">
              <Button>Admin Panel</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}