'use client';

import { useEffect, useState } from 'react';
import { Plus, Loader2, TrendingUp, TrendingDown, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { graphqlClient, GET_ACCOUNT_HIERARCHY } from '@/lib/graphql';
import { useAppStore, type Account } from '@/lib/store';

interface AccountWithChildren extends Account {
  children?: AccountWithChildren[];
}
import { AccountType } from '@pams/types';
import { formatCurrency, getAccountTypeColor } from '@/lib/utils';
import { AccountModal } from './account-modal';
import { DeleteAccountDialog } from './delete-account-dialog';

export function AccountsList() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [accounts, setAccounts] = useState<AccountWithChildren[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);
  const [collapsedAccounts, setCollapsedAccounts] = useState<Record<string, boolean>>({});

  const loadAccounts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await graphqlClient.request<{ accountHierarchy: AccountWithChildren[] }>(GET_ACCOUNT_HIERARCHY);
      setAccounts(data.accountHierarchy);
    } catch (err) {
      setError('계정을 불러오는데 실패했습니다.');
      console.error('Error loading accounts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  // Initialize collapsed state for all top-level parents (accounts ending with 00)
  useEffect(() => {
    if (accounts.length > 0) {
      const initialCollapsedState: Record<string, boolean> = {};

      const findTopLevelParents = (accountList: AccountWithChildren[]) => {
        accountList.forEach(account => {
          if (isTopLevelParent(account)) {
            initialCollapsedState[account.id] = true; // Default to collapsed
          }
          // Also check children recursively
          if (account.children) {
            findTopLevelParents(account.children);
          }
        });
      };
      
      findTopLevelParents(accounts);
      setCollapsedAccounts(initialCollapsedState);
    }
  }, [accounts]);

  const handleAccountClick = (account: Account) => {
    setSelectedAccount(account);
    setIsModalOpen(true);
  };

  const handleAddAccount = () => {
    setSelectedAccount(null);
    setIsModalOpen(true);
  };

  const handleAccountSaved = () => {
    loadAccounts();
  };

  const handleDeleteClick = (account: AccountWithChildren, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent card click
    setAccountToDelete(account);
    setIsDeleteDialogOpen(true);
  };

  const handleAccountDeleted = () => {
    loadAccounts();
  };

  // Check if account is a top-level parent (code ends with 00)
  const isTopLevelParent = (account: AccountWithChildren) => {
    return account.code.endsWith('00') && account.children && account.children.length > 0;
  };

  // Toggle collapse state for an account
  const toggleCollapse = (accountId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setCollapsedAccounts(prev => ({
      ...prev,
      [accountId]: !prev[accountId] // Simple toggle - if undefined, becomes true (collapsed)
    }));
  };

  // Calculate totals for each account type
  const calculateTypeTotals = (accounts: AccountWithChildren[]) => {
    const totals: Record<string, number> = {};
    
    const addToTotal = (account: AccountWithChildren) => {
      if (!totals[account.type]) {
        totals[account.type] = 0;
      }
      totals[account.type] += account.balance;
      
      // Add children recursively
      if (account.children) {
        account.children.forEach(addToTotal);
      }
    };
    
    accounts.forEach(addToTotal);
    return totals;
  };
  
  const typeTotals = calculateTypeTotals(accounts);

  // Group accounts by type
  const groupedAccounts = accounts.reduce((groups, account) => {
    if (!groups[account.type]) {
      groups[account.type] = [];
    }
    groups[account.type].push(account);
    return groups;
  }, {} as Record<string, AccountWithChildren[]>);
  
  // Render account with children
  const renderAccount = (account: AccountWithChildren, level = 0) => {
    const hasChildren = account.children && account.children.length > 0;
    const isCollapsible = isTopLevelParent(account);
    const isCollapsed = collapsedAccounts[account.id];
    const subtotal = hasChildren ? 
      account.balance + account.children.reduce((sum, child) => sum + child.balance, 0) : 
      account.balance;
    
    return (
      <div key={account.id}>
        <Card
          className={`p-4 cursor-pointer hover:shadow-md transition-shadow ${
            level > 0 ? 'ml-6 border-l-4 border-l-muted' : ''
          } ${
            isCollapsible ? 'bg-muted/20' : ''
          }`}
          onClick={() => handleAccountClick(account)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1">
              {/* Collapse/Expand Button for Top-Level Parents */}
              {isCollapsible && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => toggleCollapse(account.id, e)}
                  className="h-6 w-6 p-0 shrink-0 hover:bg-background"
                >
                  {isCollapsed ? (
                    <ChevronRight size={14} className="text-muted-foreground" />
                  ) : (
                    <ChevronDown size={14} className="text-muted-foreground" />
                  )}
                </Button>
              )}
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-sm font-mono text-muted-foreground px-2 py-1 rounded ${
                    isCollapsible ? 'bg-primary/10 text-primary font-semibold' : 'bg-muted'
                  }`}>
                    {account.code}
                  </span>
                  <h3 className={`font-medium text-foreground ${
                    hasChildren ? 'font-semibold' : ''
                  } ${
                    isCollapsible ? 'text-primary font-bold' : ''
                  }`}>
                    {account.name}
                    {hasChildren && <span className="text-xs ml-2 text-muted-foreground">(소계: {formatCurrency(subtotal)})</span>}
                  </h3>
                </div>
                <div className="text-xs text-muted-foreground">
                  {account.type}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="flex items-center gap-1">
                  {account.balance > 0 ? (
                    <TrendingUp size={16} className="text-green-500" />
                  ) : account.balance < 0 ? (
                    <TrendingDown size={16} className="text-red-500" />
                  ) : null}
                  <p className={`text-lg font-semibold ${
                    account.balance > 0 ? 'text-green-600' : 
                    account.balance < 0 ? 'text-red-600' : 
                    'text-muted-foreground'
                  }`}>
                    {formatCurrency(account.balance)}
                  </p>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => handleDeleteClick(account, e)}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 size={14} />
              </Button>
            </div>
          </div>
        </Card>
        
        {/* Render children */}
        {hasChildren && !isCollapsed && (
          <div className="mt-2 space-y-2">
            {account.children!.map(child => renderAccount(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const accountTypeNames = {
    ASSET: '자산',
    LIABILITY: '부채', 
    EQUITY: '자본',
    REVENUE: '수익',
    EXPENSE: '비용'
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">계정을 불러오는 중...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6 text-center">
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={() => loadAccounts()}>
          다시 시도
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Card - Moved to Top */}
      {Object.keys(groupedAccounts).length > 0 && (
        <Card className="p-6 bg-primary/5 border-primary/20">
          <h3 className="text-lg font-semibold mb-3">전체 요약</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(accountTypeNames).map(([type, name]) => (
              <div key={type} className="text-center">
                <p className="text-sm text-muted-foreground mb-1">{name}</p>
                <p className={`text-lg font-semibold ${
                  (typeTotals[type] || 0) > 0 ? 'text-green-600' : 
                  (typeTotals[type] || 0) < 0 ? 'text-red-600' : 
                  'text-muted-foreground'
                }`}>
                  {formatCurrency(typeTotals[type] || 0)}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Add Account Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleAddAccount}
          size="lg"
          className="shadow-lg"
        >
          <Plus size={20} />
          계정 추가
        </Button>
      </div>

      {/* Accounts by Type with Hierarchy */}
      {Object.entries(groupedAccounts).map(([type, typeAccounts]) => (
        <div key={type} className="space-y-4">
          {/* Category Header with Total */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full ${getAccountTypeColor(type as AccountType)}`} />
                {accountTypeNames[type as keyof typeof accountTypeNames]}
              </h2>
              <div className="text-right">
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(typeTotals[type] || 0)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {typeAccounts.length}개 계정
                </p>
              </div>
            </div>
          </div>
          
          {/* Hierarchical Account List */}
          <div className="space-y-3">
            {typeAccounts.map((account) => renderAccount(account))}
          </div>
        </div>
      ))}

      {/* Empty State */}
      {accounts.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">
            아직 계정이 없습니다.
          </p>
          <Button onClick={handleAddAccount}>
            첫 계정 추가하기
          </Button>
        </Card>
      )}

      {/* Account Modal */}
      <AccountModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        account={selectedAccount}
        onSaved={handleAccountSaved}
      />
      
      {/* Delete Account Dialog */}
      <DeleteAccountDialog
        account={accountToDelete}
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onDeleted={handleAccountDeleted}
      />
    </div>
  );
}