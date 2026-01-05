import { Header } from './header';
import { Footer } from './footer';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-[#f9fafb] font-sans">
      <Header />
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-8 md:px-8">
        {children}
      </main>
      <Footer />
    </div>
  );
}
