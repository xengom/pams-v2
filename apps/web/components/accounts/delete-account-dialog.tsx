'use client';

import { useState } from 'react';
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
import { graphqlClient, DELETE_ACCOUNT } from '@/lib/graphql';
import { Account } from '@/lib/store';

interface DeleteAccountDialogProps {
  account: Account | null;
  isOpen: boolean;
  onClose: () => void;
  onDeleted: () => void;
}

export function DeleteAccountDialog({ 
  account, 
  isOpen, 
  onClose, 
  onDeleted 
}: DeleteAccountDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!account) return;

    try {
      setIsDeleting(true);
      
      await graphqlClient.request(DELETE_ACCOUNT, {
        id: account.id
      });

      onDeleted();
      onClose();
    } catch (error) {
      console.error('Delete error:', error);
      // Extract error message from GraphQL error
      const errorMessage = error instanceof Error 
        ? error.message 
        : '계정 삭제에 실패했습니다.';
      
      alert(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!account) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>계정 삭제</AlertDialogTitle>
          <AlertDialogDescription>
            <span className="font-medium text-foreground">
              {account.code} - {account.name}
            </span>
            <br />
            이 계정을 정말로 삭제하시겠습니까? 
            <br />
            <span className="text-sm text-muted-foreground mt-2 block">
              • 하위 계정이 있는 경우 삭제할 수 없습니다
              <br />
              • 거래 기록이 있는 계정은 삭제할 수 없습니다
              <br />
              • 이 작업은 되돌릴 수 없습니다
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>취소</AlertDialogCancel>
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