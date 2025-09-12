import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { ko } from 'date-fns/locale';
import { AccountType } from '@pams/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format currency in KRW (original function)
export function formatCurrency(amount: number, abbreviated = false): string {
  if (abbreviated) {
    const abs = Math.abs(amount);
    if (abs >= 100000000) {
      return `${(amount / 100000000).toFixed(1)}억`;
    }
    if (abs >= 10000) {
      return `${(amount / 10000).toFixed(0)}만`;
    }
    if (abs >= 1000) {
      return `${(amount / 1000).toFixed(0)}천`;
    }
    return `${amount}원`;
  }
  
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
  }).format(amount);
}

// Format currency with currency type support
export function formatCurrencyWithType(amount: number, currency = 'KRW', abbreviated = false): string {
  if (abbreviated) {
    const abs = Math.abs(amount);
    if (currency === 'USD') {
      if (abs >= 1000000) {
        return `$${(amount / 1000000).toFixed(1)}M`;
      }
      if (abs >= 1000) {
        return `$${(amount / 1000).toFixed(0)}K`;
      }
      return `$${amount}`;
    } else {
      if (abs >= 100000000) {
        return `${(amount / 100000000).toFixed(1)}억`;
      }
      if (abs >= 10000) {
        return `${(amount / 10000).toFixed(0)}만`;
      }
      if (abs >= 1000) {
        return `${(amount / 1000).toFixed(0)}천`;
      }
      return `${amount}원`;
    }
  }
  
  if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  } else {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(amount);
  }
}

// Format large numbers (e.g., 1000000 -> 100만)
export function formatAmount(amount: number): string {
  const abs = Math.abs(amount);
  
  if (abs >= 100000000) {
    return `${(amount / 100000000).toFixed(1)}억`;
  }
  if (abs >= 10000) {
    return `${(amount / 10000).toFixed(0)}만`;
  }
  if (abs >= 1000) {
    return `${(amount / 1000).toFixed(0)}천`;
  }
  
  return amount.toString();
}

// Format date in Korean
export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'yyyy년 M월 d일', { locale: ko });
}

// Format date and time in Korean
export function formatDateTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'M월 d일 HH:mm', { locale: ko });
}

// Format date in KST timezone
export function formatKSTDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatInTimeZone(dateObj, 'Asia/Seoul', 'yyyy년 M월 d일', { locale: ko });
}

// Get account type color class
export function getAccountTypeColor(type: AccountType): string {
  switch (type) {
    case 'ASSET':
      return 'account-asset';
    case 'LIABILITY':
      return 'account-liability';
    case 'EQUITY':
      return 'account-equity';
    case 'REVENUE':
      return 'account-revenue';
    case 'EXPENSE':
      return 'account-expense';
    default:
      return '';
  }
}

// Get account type display name in Korean
export function getAccountTypeName(type: AccountType): string {
  switch (type) {
    case 'ASSET':
      return '자산';
    case 'LIABILITY':
      return '부채';
    case 'EQUITY':
      return '자본';
    case 'REVENUE':
      return '수익';
    case 'EXPENSE':
      return '비용';
    default:
      return type;
  }
}

// Check if balance is positive for account type
export function isPositiveBalance(type: AccountType, balance: number): boolean {
  switch (type) {
    case 'ASSET':
    case 'EXPENSE':
      return balance > 0;
    case 'LIABILITY':
    case 'EQUITY':
    case 'REVENUE':
      return balance < 0;
    default:
      return balance > 0;
  }
}

// Get balance display class
export function getBalanceClass(type: AccountType, balance: number): string {
  return isPositiveBalance(type, balance) ? 'balance-positive' : 'balance-negative';
}

// Truncate text with ellipsis
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

// Generate random ID (fallback for nanoid)
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Calculate percentage
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return (value / total) * 100;
}

// Theme management utilities
export function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function applyTheme(theme: 'light' | 'dark') {
  if (typeof window === 'undefined') return;
  
  document.documentElement.classList.remove('light', 'dark');
  document.documentElement.classList.add(theme);
  
  // Update meta theme-color for mobile browsers
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    const color = theme === 'dark' ? '#0f0f0f' : '#ffffff';
    metaThemeColor.setAttribute('content', color);
  }
}