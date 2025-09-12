'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  CreditCard, 
  PieChart, 
  Settings,
  Wallet,
  TrendingUp 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  {
    label: '홈',
    href: '/',
    icon: Home,
  },
  {
    label: '거래',
    href: '/ledger/transactions',
    icon: Wallet,
  },
  {
    label: '계정',
    href: '/ledger/accounts',
    icon: CreditCard,
  },
  {
    label: '통계',
    href: '/ledger/stats',
    icon: TrendingUp,
  },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border">
      <div className="grid grid-cols-4 gap-1 p-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || 
            (item.href !== '/' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'mobile-nav-item',
                isActive && 'active'
              )}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}