'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ShoppingCart, User, LogOut } from 'lucide-react';
import SearchBar from './SearchBar';
import { cn } from '@/lib/utils';

type Props = { initialUser: any };

export default function CustomerHeader({ initialUser }: Props) {
  const { data: session } = useSession();
  const user = session?.user || initialUser;

  const { data: cartCountData } = useQuery({
    queryKey: ['cart-count'],
    queryFn: async () => {
      const response = await axios.get<{ count: number }>('/api/cart/count');
      return response.data;
    },
    enabled: !!session?.user,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  const cartCount = cartCountData?.count ?? 0;

  const getUserInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="absolute top-0 right-0 left-0 z-50 w-full">
      <div className="container mx-auto flex h-16 max-w-screen-2xl items-center justify-between gap-4 px-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2 transition-all hover:scale-105">
          <span className="from-primary via-primary to-secondary bg-gradient-to-r bg-clip-text font-serif text-2xl font-bold text-transparent drop-shadow-lg">
            Handmade Haven
          </span>
        </Link>

        {/* Search Bar - Center */}
        <div className="hidden flex-1 justify-center md:flex">
          <SearchBar />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Search - Mobile */}
          <div className="md:hidden">
            <SearchBar />
          </div>

          {/* Cart */}
          <Link
            href="/cart"
            className="group text-background hover:text-primary relative flex items-center justify-center rounded-lg p-2 backdrop-blur-sm transition-all hover:bg-white/10"
            aria-label="Shopping cart"
          >
            <ShoppingCart className="h-5 w-5 drop-shadow-md transition-transform group-hover:scale-110" />
            {cartCount > 0 && (
              <span className="from-primary to-secondary text-primary-foreground absolute -top-1 -right-1 flex min-w-[1.25rem] items-center justify-center rounded-full bg-gradient-to-br px-1 text-xs font-semibold shadow-lg">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </Link>

          {/* Guest User */}
          {!user && (
            <>
              <Link href="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-background hover:text-primary hidden border-white/20 backdrop-blur-sm transition-all hover:bg-white/10 sm:flex"
                >
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  size="sm"
                  className="from-primary to-secondary text-primary-foreground hover:from-primary/90 hover:to-secondary/90 bg-gradient-to-r shadow-lg transition-all hover:shadow-xl"
                >
                  Get Started
                </Button>
              </Link>
            </>
          )}

          {/* Logged-in Customer */}
          {user && user.role === 'USER' && (
            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-2 sm:flex">
                <Avatar className="h-8 w-8 border-2 border-white/30 shadow-lg backdrop-blur-sm">
                  <AvatarFallback className="from-primary/20 to-secondary/20 text-foreground bg-gradient-to-br text-xs font-semibold">
                    {getUserInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-background text-sm font-medium drop-shadow-md">
                  {user.name}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => signOut()}
                className="text-background hover:text-primary backdrop-blur-sm transition-all hover:bg-white/10"
                aria-label="Logout"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Admin User */}
          {/* {user?.role === 'ADMIN' && (
            <Link href="/admin/dashboard">
              <Button
                size="sm"
                variant="outline"
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              >
                Admin Panel
              </Button>
            </Link>
          )} */}
        </div>
      </div>
    </header>
  );
}
