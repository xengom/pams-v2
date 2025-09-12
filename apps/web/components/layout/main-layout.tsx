import { Header } from './header';
import { MobileNav } from './mobile-nav';

interface MainLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function MainLayout({ title, subtitle, children }: MainLayoutProps) {
  return (
    <div className="flex flex-col w-full h-full">
      <Header title={title} subtitle={subtitle} />
      
      <main className="flex-1 overflow-y-auto pb-20">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          {children}
        </div>
      </main>
      
      <MobileNav />
    </div>
  );
}