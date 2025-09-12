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
import { graphqlClient, CREATE_ACCOUNT, UPDATE_ACCOUNT } from '@/lib/graphql';
import { Account } from '@/lib/store';

const accountSchema = z.object({
  code: z.string().min(1, '계정코드를 입력해주세요'),
  name: z.string().min(1, '계정명을 입력해주세요'),
  type: z.enum(['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE'], {
    errorMap: () => ({ message: '계정유형을 선택해주세요' })
  }),
});

type AccountForm = z.infer<typeof accountSchema>;

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  account?: Account | null;
  onSaved: () => void;
}

export function AccountModal({ 
  isOpen, 
  onClose, 
  account, 
  onSaved 
}: AccountModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<AccountForm>({
    resolver: zodResolver(accountSchema),
  });

  const accountType = watch('type');

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      if (account) {
        // Edit mode
        reset({
          code: account.code,
          name: account.name,
          type: account.type as AccountForm['type'],
        });
      } else {
        // Add mode
        reset({
          code: '',
          name: '',
          type: undefined,
        });
      }
    }
  }, [isOpen, account, reset]);

  const onSubmit = async (data: AccountForm) => {
    try {
      setIsSubmitting(true);

      if (account) {
        // Update existing account
        await graphqlClient.request(UPDATE_ACCOUNT, {
          id: account.id,
          input: {
            code: data.code,
            name: data.name,
            type: data.type,
          },
        });
      } else {
        // Create new account
        await graphqlClient.request(CREATE_ACCOUNT, {
          input: {
            code: data.code,
            name: data.name,
            type: data.type,
            isPortfolio: false,
          },
        });
      }

      onSaved();
      onClose();
    } catch (error: any) {
      console.error('Error saving account:', error);
      alert(error.message || '계정 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const accountTypes = [
    { value: 'ASSET', label: '자산' },
    { value: 'LIABILITY', label: '부채' },
    { value: 'EQUITY', label: '자본' },
    { value: 'REVENUE', label: '수익' },
    { value: 'EXPENSE', label: '비용' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {account ? '계정 수정' : '계정 추가'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Account Code */}
          <div className="space-y-2">
            <Label htmlFor="code">계정코드</Label>
            <Input
              id="code"
              placeholder="예: 101"
              {...register('code')}
            />
            {errors.code && (
              <p className="text-sm text-destructive">{errors.code.message}</p>
            )}
          </div>

          {/* Account Name */}
          <div className="space-y-2">
            <Label htmlFor="name">계정명</Label>
            <Input
              id="name"
              placeholder="예: 현금"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Account Type */}
          <div className="space-y-2">
            <Label>계정유형</Label>
            <Select
              value={accountType}
              onValueChange={(value) => setValue('type', value as AccountForm['type'])}
            >
              <SelectTrigger>
                <SelectValue placeholder="계정 유형 선택" />
              </SelectTrigger>
              <SelectContent>
                {accountTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-destructive">{errors.type.message}</p>
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
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? '저장 중...' : account ? '수정' : '추가'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}