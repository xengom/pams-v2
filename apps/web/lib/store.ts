import { create } from 'zustand';
import { AccountType } from '@pams/types';

export interface Account {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  balance: number;
  isPortfolio: boolean;
  parentId?: string;
  children?: Account[];
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  transactionDate: string;
  debitAccount: {
    id: string;
    name: string;
    code: string;
    type: AccountType;
  };
  creditAccount: {
    id: string;
    name: string;
    code: string;
    type: AccountType;
  };
}

export interface PaginatedTransactions {
  transactions: Transaction[];
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  totalCount: number;
}

interface AppState {
  // Accounts
  accounts: Account[];
  accountHierarchy: Account[];
  isLoadingAccounts: boolean;
  
  // Transactions
  transactions: PaginatedTransactions | null;
  isLoadingTransactions: boolean;
  currentTransactionPage: number;
  
  // UI State
  activeTab: string;
  isMobileMenuOpen: boolean;
  theme: 'light' | 'dark';
  
  // Actions
  setAccounts: (accounts: Account[]) => void;
  setAccountHierarchy: (hierarchy: Account[]) => void;
  setLoadingAccounts: (loading: boolean) => void;
  setTransactions: (transactions: PaginatedTransactions) => void;
  setLoadingTransactions: (loading: boolean) => void;
  setCurrentTransactionPage: (page: number) => void;
  setActiveTab: (tab: string) => void;
  setMobileMenuOpen: (open: boolean) => void;
  toggleTheme: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Initial state
  accounts: [],
  accountHierarchy: [],
  isLoadingAccounts: false,
  transactions: null,
  isLoadingTransactions: false,
  currentTransactionPage: 1,
  activeTab: 'transactions',
  isMobileMenuOpen: false,
  theme: 'light',
  
  // Actions
  setAccounts: (accounts) => set({ accounts }),
  setAccountHierarchy: (hierarchy) => set({ accountHierarchy: hierarchy }),
  setLoadingAccounts: (loading) => set({ isLoadingAccounts: loading }),
  setTransactions: (transactions) => set({ transactions }),
  setLoadingTransactions: (loading) => set({ isLoadingTransactions: loading }),
  setCurrentTransactionPage: (page) => set({ currentTransactionPage: page }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
  toggleTheme: () => set((state) => ({ 
    theme: state.theme === 'light' ? 'dark' : 'light' 
  })),
}));

// Theme management hook
export const useTheme = () => {
  const { theme, toggleTheme } = useAppStore();
  
  const setTheme = (newTheme: 'light' | 'dark') => {
    if (typeof window !== 'undefined') {
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(newTheme);
    }
  };
  
  return { theme, toggleTheme, setTheme };
};