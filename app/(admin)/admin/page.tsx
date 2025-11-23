// app/admin/page.tsx
'use client';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminLogin() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Redirect if already logged in as admin
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'ADMIN') {
      router.push('/admin/dashboard');
    }
  }, [session, status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const email = form.email.value;
    const password = form.password.value;

    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (res?.ok) {
      router.push('/admin/dashboard');
    } else {
      alert('Invalid credentials');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto mt-20 max-w-sm space-y-4">
      <input
        name="email"
        type="email"
        placeholder="admin@handicraft.com"
        required
        className="w-full border p-2"
      />
      <input
        name="password"
        type="password"
        placeholder="Password"
        required
        className="w-full border p-2"
      />
      <button type="submit" className="bg-primary w-full p-2 text-white">
        Admin Login
      </button>
    </form>
  );
} 
