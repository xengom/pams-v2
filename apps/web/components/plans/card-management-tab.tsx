'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Edit, Save, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { graphqlClient, GET_CARD_TRANSACTION_SUMMARY, UPDATE_CARD_DISCOUNT } from '@/lib/graphql';
import { formatCurrency } from '@/lib/utils';

interface CardMonthlyData {
  year: number;
  month: number;
  totalPayment: number;
  discount: number;
  actualBill: number;
}

interface CardTransactionSummary {
  account: {
    id: string;
    name: string;
    code: string;
  };
  currentMonth: CardMonthlyData;
  lastMonth: CardMonthlyData;
}

export function CardManagementTab() {
  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  });
  
  const [cardSummaries, setCardSummaries] = useState<CardTransactionSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingCard, setEditingCard] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Calculate last month
  const lastMonth = currentDate.month === 1 
    ? { year: currentDate.year - 1, month: 12 }
    : { year: currentDate.year, month: currentDate.month - 1 };

  useEffect(() => {
    loadCardSummaries();
  }, [currentDate]);

  const loadCardSummaries = async () => {
    try {
      setIsLoading(true);
      
      const data = await graphqlClient.request<{ cardTransactionSummary: CardTransactionSummary[] }>(
        GET_CARD_TRANSACTION_SUMMARY,
        {
          currentYear: currentDate.year,
          currentMonth: currentDate.month,
          lastYear: lastMonth.year,
          lastMonth: lastMonth.month,
        }
      );
      
      setCardSummaries(data.cardTransactionSummary);
      
    } catch (error) {
      console.error('Error loading card summaries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      if (direction === 'next') {
        return prev.month === 12 
          ? { year: prev.year + 1, month: 1 }
          : { year: prev.year, month: prev.month + 1 };
      } else {
        return prev.month === 1
          ? { year: prev.year - 1, month: 12 }
          : { year: prev.year, month: prev.month - 1 };
      }
    });
  };

  const updateDiscount = async (accountId: string, year: number, month: number, discount: number) => {
    try {
      setIsSaving(true);
      
      await graphqlClient.request(UPDATE_CARD_DISCOUNT, {
        input: {
          accountId,
          year,
          month,
          discount,
        },
      });
      
      setEditingCard(null);
      loadCardSummaries();
      
    } catch (error: any) {
      console.error('Error updating discount:', error);
      alert(error.message || '할인 수정 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  // Calculate totals
  const currentMonthTotals = cardSummaries.reduce((acc, card) => ({
    totalPayment: acc.totalPayment + card.currentMonth.totalPayment,
    totalDiscount: acc.totalDiscount + card.currentMonth.discount,
    totalBill: acc.totalBill + card.currentMonth.actualBill,
  }), { totalPayment: 0, totalDiscount: 0, totalBill: 0 });

  const lastMonthTotals = cardSummaries.reduce((acc, card) => ({
    totalPayment: acc.totalPayment + card.lastMonth.totalPayment,
    totalDiscount: acc.totalDiscount + card.lastMonth.discount,
    totalBill: acc.totalBill + card.lastMonth.actualBill,
  }), { totalPayment: 0, totalDiscount: 0, totalBill: 0 });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">카드 거래내역을 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Month Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="text-center min-w-[200px]">
              <h4 className="font-semibold">
                {lastMonth.year}년 {lastMonth.month}월 | {currentDate.year}년 {currentDate.month}월
              </h4>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-6">
        {/* Last Month Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">
              {lastMonth.year}년 {lastMonth.month}월 집계
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">총 결제</span>
              <span className="font-semibold text-red-600">
                {formatCurrency(lastMonthTotals.totalPayment)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">총 할인</span>
              <span className="font-semibold text-green-600">
                {formatCurrency(lastMonthTotals.totalDiscount)}
              </span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-sm font-medium">실제 청구</span>
              <span className="font-bold">
                {formatCurrency(lastMonthTotals.totalBill)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Current Month Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">
              {currentDate.year}년 {currentDate.month}월 집계
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">총 결제</span>
              <span className="font-semibold text-red-600">
                {formatCurrency(currentMonthTotals.totalPayment)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">총 할인</span>
              <span className="font-semibold text-green-600">
                {formatCurrency(currentMonthTotals.totalDiscount)}
              </span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-sm font-medium">실제 청구</span>
              <span className="font-bold">
                {formatCurrency(currentMonthTotals.totalBill)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Card Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Last Month Card Details */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <CreditCard className="h-5 w-5" />
              <span>{lastMonth.year}년 {lastMonth.month}월 카드별 상세</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {cardSummaries.length > 0 ? (
              <div className="space-y-4">
                {cardSummaries.map((cardSummary) => (
                  <div key={`${cardSummary.account.id}-last`} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">
                        [{cardSummary.account.code}] {cardSummary.account.name}
                      </h4>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">총 결제</span>
                        <div className="font-semibold text-red-600">
                          {formatCurrency(cardSummary.lastMonth.totalPayment)}
                        </div>
                      </div>
                      
                      <div>
                        <span className="text-muted-foreground">할인/적립</span>
                        {editingCard === `${cardSummary.account.id}-last` ? (
                          <div className="flex items-center space-x-1 mt-1">
                            <Input
                              type="number"
                              defaultValue={cardSummary.lastMonth.discount}
                              className="h-7 text-xs"
                              id={`discount-${cardSummary.account.id}-last`}
                            />
                            <Button
                              size="sm"
                              className="h-7 px-2"
                              onClick={() => {
                                const discountInput = document.getElementById(`discount-${cardSummary.account.id}-last`) as HTMLInputElement;
                                updateDiscount(
                                  cardSummary.account.id,
                                  cardSummary.lastMonth.year,
                                  cardSummary.lastMonth.month,
                                  Number(discountInput.value)
                                );
                              }}
                              disabled={isSaving}
                            >
                              <Save className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1">
                            <div className="font-semibold text-green-600">
                              {formatCurrency(cardSummary.lastMonth.discount)}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => setEditingCard(`${cardSummary.account.id}-last`)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <span className="text-muted-foreground">실제 청구</span>
                        <div className="font-bold">
                          {formatCurrency(cardSummary.lastMonth.actualBill)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CreditCard className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">카드 데이터가 없습니다</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Current Month Card Details */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <CreditCard className="h-5 w-5" />
              <span>{currentDate.year}년 {currentDate.month}월 카드별 상세</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {cardSummaries.length > 0 ? (
              <div className="space-y-4">
                {cardSummaries.map((cardSummary) => (
                  <div key={`${cardSummary.account.id}-current`} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">
                        [{cardSummary.account.code}] {cardSummary.account.name}
                      </h4>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">총 결제</span>
                        <div className="font-semibold text-red-600">
                          {formatCurrency(cardSummary.currentMonth.totalPayment)}
                        </div>
                      </div>
                      
                      <div>
                        <span className="text-muted-foreground">할인/적립</span>
                        {editingCard === `${cardSummary.account.id}-current` ? (
                          <div className="flex items-center space-x-1 mt-1">
                            <Input
                              type="number"
                              defaultValue={cardSummary.currentMonth.discount}
                              className="h-7 text-xs"
                              id={`discount-${cardSummary.account.id}-current`}
                            />
                            <Button
                              size="sm"
                              className="h-7 px-2"
                              onClick={() => {
                                const discountInput = document.getElementById(`discount-${cardSummary.account.id}-current`) as HTMLInputElement;
                                updateDiscount(
                                  cardSummary.account.id,
                                  cardSummary.currentMonth.year,
                                  cardSummary.currentMonth.month,
                                  Number(discountInput.value)
                                );
                              }}
                              disabled={isSaving}
                            >
                              <Save className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1">
                            <div className="font-semibold text-green-600">
                              {formatCurrency(cardSummary.currentMonth.discount)}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => setEditingCard(`${cardSummary.account.id}-current`)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <span className="text-muted-foreground">실제 청구</span>
                        <div className="font-bold">
                          {formatCurrency(cardSummary.currentMonth.actualBill)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CreditCard className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">카드 데이터가 없습니다</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}