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
import { Textarea } from '@/components/ui/textarea';
import { graphqlClient, CREATE_FIXED_EXPENSE, UPDATE_FIXED_EXPENSE } from '@/lib/graphql';

const fixedExpenseSchema = z.object({
  category: z.string().min(1, '카테고리를 선택해주세요'),
  paymentMethod: z.string().min(1, '결제방법을 입력해주세요'),
  amount: z.number().min(0.01, '금액을 입력해주세요'),
  currency: z.string().default('KRW'),
  paymentDate: z.string().min(1, '결제일을 입력해주세요'),
  type: z.enum(['MONTHLY', 'YEARLY'], { required_error: '타입을 선택해주세요' }),
  note: z.string().optional(),
});

type FixedExpenseForm = z.infer<typeof fixedExpenseSchema>;

interface FixedExpense {
  id: string;
  category: string;
  paymentMethod: string;
  amount: number;
  currency: string;
  paymentDate: string;
  type: 'MONTHLY' | 'YEARLY';
  note?: string;
}

interface FixedExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense?: FixedExpense | null;
  onSaved: () => void;
}

const CATEGORIES = [
  '구독',
  '생활비',
  '예비금',
  '보험',
  '기타',
];

const CURRENCIES = [
  { value: 'KRW', label: '원(KRW)' },
  { value: 'USD', label: '달러(USD)' },
];

export function FixedExpenseModal({
  isOpen,
  onClose,
  expense,
  onSaved,
}: FixedExpenseModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FixedExpenseForm>({
    resolver: zodResolver(fixedExpenseSchema),
    defaultValues: {
      currency: 'KRW',
      type: 'MONTHLY',
    },
  });

  const type = watch('type');
  const currency = watch('currency');
  const category = watch('category');

  useEffect(() => {
    if (isOpen) {
      if (expense) {
        // Edit mode
        reset({
          category: expense.category,
          paymentMethod: expense.paymentMethod,
          amount: expense.amount,
          currency: expense.currency,
          paymentDate: expense.paymentDate,
          type: expense.type,
          note: expense.note || '',
        });
      } else {
        // Add mode
        reset({
          category: '',
          paymentMethod: '',
          amount: 0,
          currency: 'KRW',
          paymentDate: '',
          type: 'MONTHLY',
          note: '',
        });
      }
    }
  }, [isOpen, expense, reset]);

  const onSubmit = async (data: FixedExpenseForm) => {
    try {
      setIsSubmitting(true);

      if (expense) {
        // Update existing expense
        await graphqlClient.request(UPDATE_FIXED_EXPENSE, {
          id: expense.id,
          input: {
            category: data.category,
            paymentMethod: data.paymentMethod,
            amount: data.amount,
            currency: data.currency,
            paymentDate: data.paymentDate,
            type: data.type,
            note: data.note || null,
          },
        });
      } else {
        // Create new expense
        await graphqlClient.request(CREATE_FIXED_EXPENSE, {
          input: {
            category: data.category,
            paymentMethod: data.paymentMethod,
            amount: data.amount,
            currency: data.currency,
            paymentDate: data.paymentDate,
            type: data.type,
            note: data.note || null,
          },
        });
      }

      onSaved();
      onClose();
    } catch (error: any) {
      console.error('Error saving fixed expense:', error);
      alert(error.message || '고정지출 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPaymentDatePlaceholder = () => {
    if (type === 'MONTHLY') {
      return '1-31 (예: 15)';
    }
    return 'MM-DD (예: 01-15)';
  };

  const getPaymentDateHelp = () => {
    if (type === 'MONTHLY') {
      return '매월 결제일을 입력하세요 (1-31)';
    }
    return '매년 결제일을 입력하세요 (MM-DD 형식)';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {expense ? '고정지출 수정' : '고정지출 추가'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Type Selection */}
          <div className="space-y-2">
            <Label>결제 주기</Label>
            <Select
              value={type}
              onValueChange={(value) => setValue('type', value as 'MONTHLY' | 'YEARLY')}
            >
              <SelectTrigger>
                <SelectValue placeholder="결제 주기 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MONTHLY">월간</SelectItem>
                <SelectItem value="YEARLY">연간</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-destructive">{errors.type.message}</p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>카테고리</Label>
            <Select
              value={category}
              onValueChange={(value) => setValue('category', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="카테고리 선택" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-destructive">{errors.category.message}</p>
            )}
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label htmlFor="paymentMethod">결제방법</Label>
            <Input
              id="paymentMethod"
              placeholder="예: 현대카드, 계좌이체"
              {...register('paymentMethod')}
            />
            {errors.paymentMethod && (
              <p className="text-sm text-destructive">{errors.paymentMethod.message}</p>
            )}
          </div>

          {/* Amount and Currency */}
          <div className="grid grid-cols-2 gap-3">
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

            <div className="space-y-2">
              <Label>화폐</Label>
              <Select
                value={currency}
                onValueChange={(value) => setValue('currency', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((curr) => (
                    <SelectItem key={curr.value} value={curr.value}>
                      {curr.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Payment Date */}
          <div className="space-y-2">
            <Label htmlFor="paymentDate">결제일</Label>
            <Input
              id="paymentDate"
              placeholder={getPaymentDatePlaceholder()}
              {...register('paymentDate')}
            />
            <p className="text-xs text-muted-foreground">
              {getPaymentDateHelp()}
            </p>
            {errors.paymentDate && (
              <p className="text-sm text-destructive">{errors.paymentDate.message}</p>
            )}
          </div>

          {/* Note */}
          <div className="space-y-2">
            <Label htmlFor="note">메모 (선택사항)</Label>
            <Textarea
              id="note"
              placeholder="추가 설명이나 메모를 입력하세요"
              rows={3}
              {...register('note')}
            />
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
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? '저장 중...' : expense ? '수정' : '추가'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}