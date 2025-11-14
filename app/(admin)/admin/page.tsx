// app/admin/page.tsx
'use client';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const router = useRouter();

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
      router.push('/dashboard');
    } else {
      alert('Invalid credentials');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto mt-20 space-y-4">
      <input name="email" type="email" placeholder="admin@handicraft.com" required className="w-full p-2 border" />
      <input name="password" type="password" placeholder="Password" required className="w-full p-2 border" />
      <button type="submit" className="w-full bg-primary text-white p-2">Admin Login</button>
    </form>
  );
}//sigin form for admin here