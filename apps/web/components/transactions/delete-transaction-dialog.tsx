'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { graphqlClient, DELETE_TRANSACTION } from '@/lib/graphql';
import { formatCurrency } from '@/lib/utils';
import { useState } from 'react';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  debitAccount: {
    id: string;
    name: string;
    code: string;
  };
  creditAccount: {
    id: string;
    name: string;
    code: string;
  };
}

interface DeleteTransactionDialogProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
  onDeleted: () => void;
}

export function DeleteTransactionDialog({
  transaction,
  isOpen,
  onClose,
  onDeleted,
}: DeleteTransactionDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!transaction) return;

    try {
      setIsDeleting(true);
      
      await graphqlClient.request(DELETE_TRANSACTION, {
        id: transaction.id,
      });

      onDeleted();
      onClose();
    } catch (error: any) {
      console.error('Error deleting transaction:', error);
      alert(error.message || '거래 삭제 중 오류가 발생했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>거래 삭제</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p className="font-medium">다음 거래를 삭제하시겠습니까?</p>
            
            {transaction && (
              <div className="bg-muted p-3 rounded-md space-y-1">
                <div className="text-sm">
                  <span className="font-medium">적요:</span> {transaction.description}
                </div>
                <div className="text-sm">
                  <span className="font-medium">금액:</span> {formatCurrency(transaction.amount)}
                </div>
                <div className="text-sm">
                  <span className="font-medium">차변:</span> [{transaction.debitAccount.code}] {transaction.debitAccount.name}
                </div>
                <div className="text-sm">
                  <span className="font-medium">대변:</span> [{transaction.creditAccount.code}] {transaction.creditAccount.name}
                </div>
              </div>
            )}
            
            <p className="text-destructive font-medium">
              ⚠️ 이 작업은 되돌릴 수 없으며, 관련 계정의 잔액도 함께 조정됩니다.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            취소
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? '삭제 중...' : '삭제'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}