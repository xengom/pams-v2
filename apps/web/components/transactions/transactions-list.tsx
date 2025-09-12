'use client';

import { useEffect, useState } from 'react';
import { Plus, Loader2, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { graphqlClient, GET_TRANSACTIONS } from '@/lib/graphql';
import { useAppStore, type PaginatedTransactions } from '@/lib/store';
import { formatCurrency, formatDateTime, getAccountTypeColor } from '@/lib/utils';
import { TransactionModal } from './transaction-modal';
import { DeleteTransactionDialog } from './delete-transaction-dialog';

export function TransactionsList() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<any>(null);
  
  const {
    transactions,
    setTransactions,
    currentTransactionPage,
    setCurrentTransactionPage,
  } = useAppStore();

  const loadTransactions = async (page = 1) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await graphqlClient.request<{ 
        transactions: PaginatedTransactions 
      }>(GET_TRANSACTIONS, {
        page,
        limit: 20,
      });
      
      setTransactions(data.transactions);
      setCurrentTransactionPage(page);
    } catch (err) {
      setError('거래내역을 불러오는데 실패했습니다.');
      console.error('Error loading transactions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const handleEditTransaction = (transaction: any) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleDeleteTransaction = (transaction: any, event: React.MouseEvent) => {
    event.stopPropagation();
    setTransactionToDelete(transaction);
    setIsDeleteDialogOpen(true);
  };

  const handleTransactionDeleted = () => {
    loadTransactions(currentTransactionPage);
  };

  const handleAddTransaction = () => {
    setSelectedTransaction(null);
    setIsModalOpen(true);
  };

  const handleTransactionSaved = () => {
    loadTransactions(currentTransactionPage);
  };

  if (isLoading && !transactions) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">거래내역을 불러오는 중...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6 text-center">
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={() => loadTransactions()}>
          다시 시도
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Add Transaction Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleAddTransaction}
          size="lg"
          className="shadow-lg"
        >
          <Plus size={20} />
          거래 추가
        </Button>
      </div>

      {/* Transactions List */}
      <div className="space-y-2">
        {transactions?.transactions.map((transaction) => (
          <Card
            key={transaction.id}
            className="p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-medium text-foreground mb-1">
                  {transaction.description}
                </h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className={getAccountTypeColor(transaction.debitAccount.type)}>
                    {transaction.debitAccount.name}
                  </span>
                  <span>→</span>
                  <span className={getAccountTypeColor(transaction.creditAccount.type)}>
                    {transaction.creditAccount.name}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDateTime(transaction.transactionDate)}
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-lg font-semibold text-foreground">
                    {formatCurrency(transaction.amount)}
                  </p>
                  <div className="text-xs text-muted-foreground">
                    <p>{transaction.debitAccount.code}</p>
                    <p>{transaction.creditAccount.code}</p>
                  </div>
                </div>
                
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditTransaction(transaction)}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10"
                  >
                    <Edit2 size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleDeleteTransaction(transaction, e)}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {transactions && transactions.totalCount > 0 && (
        <div className="flex items-center justify-between pt-4">
          <Button
            variant="outline"
            disabled={!transactions.hasPreviousPage || isLoading}
            onClick={() => loadTransactions(currentTransactionPage - 1)}
          >
            이전
          </Button>
          
          <span className="text-sm text-muted-foreground">
            총 {transactions.totalCount}건
          </span>
          
          <Button
            variant="outline"
            disabled={!transactions.hasNextPage || isLoading}
            onClick={() => loadTransactions(currentTransactionPage + 1)}
          >
            다음
          </Button>
        </div>
      )}

      {/* Empty State */}
      {transactions && transactions.transactions.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">
            아직 거래내역이 없습니다.
          </p>
          <Button onClick={handleAddTransaction}>
            첫 거래 추가하기
          </Button>
        </Card>
      )}

      {/* Delete Dialog */}
      <DeleteTransactionDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        transaction={transactionToDelete}
        onDeleted={handleTransactionDeleted}
      />

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        transaction={selectedTransaction}
        onSaved={handleTransactionSaved}
      />
    </div>
  );
}