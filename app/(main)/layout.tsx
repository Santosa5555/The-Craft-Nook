import { getCurrentUser } from '@/lib/auth';
import Header from '@/components/customer/Header';
import Footer from '@/components/customer/Footer';
const ClientLayout = async ({ children }: { children: React.ReactNode }) => {
  const user = await getCurrentUser();
  return (
    <div>
      <Header initialUser={user} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};

export default ClientLayout;
