// app/dashboard/layout.tsx
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminSidebar from '@/components/admin/Sidebar';
import AdminNavbar from '@/components/admin/Navbar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user || user.role !== 'ADMIN') {
    redirect('/admin');
  }

  return (
    <div className="min-h-screen bg-muted/40">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="pl-64">
        {/* Top Navbar */}
        <AdminNavbar />

        {/* Page Content */}
        <main className="mt-16 p-6">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}