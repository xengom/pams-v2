'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { graphqlClient, GET_ACCOUNTS, CREATE_TRANSACTION, UPDATE_TRANSACTION } from '@/lib/graphql';
import { Account } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';

const transactionSchema = z.object({
  description: z.string().min(1, '적요를 입력해주세요'),
  amount: z.number().min(0.01, '금액을 입력해주세요'),
  debitAccountId: z.string().min(1, '차변 계정을 선택해주세요'),
  creditAccountId: z.string().min(1, '대변 계정을 선택해주세요'),
});

type TransactionForm = z.infer<typeof transactionSchema>;

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction?: any;
  onSaved: () => void;
}

export function TransactionModal({ 
  isOpen, 
  onClose, 
  transaction, 
  onSaved 
}: TransactionModalProps) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<TransactionForm>({
    resolver: zodResolver(transactionSchema),
  });

  const debitAccountId = watch('debitAccountId');
  const creditAccountId = watch('creditAccountId');

  // Load accounts when modal opens
  useEffect(() => {
    if (isOpen) {
      loadAccounts();
    }
  }, [isOpen]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      if (transaction) {
        // Edit mode
        reset({
          description: transaction.description,
          amount: transaction.amount,
          debitAccountId: transaction.debitAccount.id,
          creditAccountId: transaction.creditAccount.id,
        });
      } else {
        // Add mode
        reset({
          description: '',
          amount: 0,
          debitAccountId: '',
          creditAccountId: '',
        });
      }
    }
  }, [isOpen, transaction, reset]);

  const loadAccounts = async () => {
    try {
      setIsLoading(true);
      const data = await graphqlClient.request<{ accounts: Account[] }>(GET_ACCOUNTS);
      setAccounts(data.accounts);
      console.log(data.accounts);
    } catch (error) {
      console.error('Error loading accounts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: TransactionForm) => {
    try {
      setIsSubmitting(true);
      
      if (data.debitAccountId === data.creditAccountId) {
        alert('차변과 대변 계정은 달라야 합니다.');
        return;
      }

      if (transaction) {
        // Update existing transaction
        await graphqlClient.request(UPDATE_TRANSACTION, {
          id: transaction.id,
          input: {
            description: data.description,
            amount: data.amount,
            debitAccountId: data.debitAccountId,
            creditAccountId: data.creditAccountId,
          },
        });
      } else {
        // Create new transaction
        await graphqlClient.request(CREATE_TRANSACTION, {
          input: {
            description: data.description,
            amount: data.amount,
            debitAccountId: data.debitAccountId,
            creditAccountId: data.creditAccountId,
          },
        });
      }

      onSaved();
      onClose();
    } catch (error: any) {
      console.error('Error saving transaction:', error);
      alert(error.message || '거래 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFilteredAccounts = (excludeId?: string) => {
    return accounts.filter(account => 
      account.id !== excludeId && 
      !account.code.endsWith('00')
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {transaction ? '거래 수정' : '거래 추가'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">적요</Label>
            <Input
              id="description"
              placeholder="거래 내용을 입력하세요"
              {...register('description')}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">금액</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0"
              {...register('amount', { valueAsNumber: true })}
            />
            {errors.amount && (
              <p className="text-sm text-destructive">{errors.amount.message}</p>
            )}
          </div>

          {/* Debit Account */}
          <div className="space-y-2">
            <Label>차변 계정</Label>
            <Select
              value={debitAccountId}
              onValueChange={(value) => setValue('debitAccountId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="차변 계정 선택" />
              </SelectTrigger>
              <SelectContent>
                {getFilteredAccounts(creditAccountId).map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    [{account.code}] {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.debitAccountId && (
              <p className="text-sm text-destructive">{errors.debitAccountId.message}</p>
            )}
          </div>

          {/* Credit Account */}
          <div className="space-y-2">
            <Label>대변 계정</Label>
            <Select
              value={creditAccountId}
              onValueChange={(value) => setValue('creditAccountId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="대변 계정 선택" />
              </SelectTrigger>
              <SelectContent>
                {getFilteredAccounts(debitAccountId).map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    [{account.code}] {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.creditAccountId && (
              <p className="text-sm text-destructive">{errors.creditAccountId.message}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="flex-1"
            >
              {isSubmitting ? '저장 중...' : transaction ? '수정' : '추가'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}