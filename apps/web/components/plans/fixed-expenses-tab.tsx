'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Calendar, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { graphqlClient, GET_FIXED_EXPENSES, GET_FIXED_EXPENSES_SUMMARY, GET_EXCHANGE_RATE_INFO, DELETE_FIXED_EXPENSE } from '@/lib/graphql';
import { formatCurrency, formatCurrencyWithType } from '@/lib/utils';
import { FixedExpenseModal } from './fixed-expense-modal';

interface FixedExpense {
  id: string;
  category: string;
  paymentMethod: string;
  amount: number;
  currency: string;
  paymentDate: string;
  type: 'MONTHLY' | 'YEARLY';
  note?: string;
  createdAt: string;
}

interface FixedExpenseSummary {
  monthlyTotal: number;
  yearlyTotal: number;
  monthlyAverageTotal: number;
  currency: string;
}

interface ExchangeRateInfo {
  from: string;
  to: string;
  rate: number;
  timestamp: string;
  lastUpdated: string;
}

export function FixedExpensesTab() {
  const [expenses, setExpenses] = useState<FixedExpense[]>([]);
  const [summary, setSummary] = useState<FixedExpenseSummary | null>(null);
  const [exchangeRate, setExchangeRate] = useState<ExchangeRateInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<FixedExpense | null>(null);

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      setIsLoading(true);
      
      // Load expenses, summary, and exchange rate in parallel
      const [expensesData, summaryData, exchangeRateData] = await Promise.all([
        graphqlClient.request<{ fixedExpenses: FixedExpense[] }>(GET_FIXED_EXPENSES),
        graphqlClient.request<{ fixedExpensesSummary: FixedExpenseSummary }>(GET_FIXED_EXPENSES_SUMMARY),
        graphqlClient.request<{ exchangeRateInfo: ExchangeRateInfo }>(GET_EXCHANGE_RATE_INFO).catch(() => null)
      ]);
      
      setExpenses(expensesData.fixedExpenses);
      setSummary(summaryData.fixedExpensesSummary);
      if (exchangeRateData) {
        setExchangeRate(exchangeRateData.exchangeRateInfo);
      }
    } catch (error) {
      console.error('Error loading fixed expenses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddExpense = () => {
    setSelectedExpense(null);
    setIsModalOpen(true);
  };

  const handleEditExpense = (expense: FixedExpense) => {
    setSelectedExpense(expense);
    setIsModalOpen(true);
  };

  const handleExpenseSaved = () => {
    loadExpenses();
  };

  const handleDeleteExpense = async (expense: FixedExpense) => {
    if (!confirm(`"${expense.note || expense.category}" 고정지출을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      await graphqlClient.request(DELETE_FIXED_EXPENSE, {
        id: expense.id,
      });
      
      loadExpenses(); // Reload the expenses list
    } catch (error: any) {
      console.error('Error deleting fixed expense:', error);
      alert(error.message || '고정지출 삭제 중 오류가 발생했습니다.');
    }
  };

  const monthlyExpenses = expenses.filter(e => e.type === 'MONTHLY');
  const yearlyExpenses = expenses.filter(e => e.type === 'YEARLY');

  const getTypeColor = (type: string) => {
    return type === 'MONTHLY' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800';
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case '구독': return '📱';
      case '생활비': return '🏠';
      case '예비금': return '💰';
      case '보험': return '🛡️';
      default: return '📋';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">고정지출을 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add Expense Button */}
      <div className="flex justify-end">
        <Button onClick={handleAddExpense}>
          <Plus className="h-4 w-4 mr-2" />
          고정지출 추가
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">월 고정지출</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary ? formatCurrency(summary.monthlyTotal) : formatCurrency(0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {monthlyExpenses.length}개 항목 (원화 기준)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">연 고정지출</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary ? formatCurrency(summary.yearlyTotal) : formatCurrency(0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {yearlyExpenses.length}개 항목 (원화 기준)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">월평균 지출</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary ? formatCurrency(summary.monthlyAverageTotal) : formatCurrency(0)}
            </div>
            <p className="text-xs text-muted-foreground">
              월별 + 연별/12 (원화 기준)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">환율 정보 (USD-KRW)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {exchangeRate ? `${exchangeRate.rate.toLocaleString('ko-KR', { maximumFractionDigits: 2 })}원` : '로딩중...'}
            </div>
            <p className="text-xs text-muted-foreground">
              {exchangeRate ? `${exchangeRate.lastUpdated}` : '환율 정보를 불러오는 중...'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Expense Lists */}
      <Tabs defaultValue="monthly" className="space-y-4">
        <TabsList>
          <TabsTrigger value="monthly">
            월 고정지출 ({monthlyExpenses.length})
          </TabsTrigger>
          <TabsTrigger value="yearly">
            연 고정지출 ({yearlyExpenses.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="monthly" className="space-y-3">
          {monthlyExpenses.length > 0 ? (
            monthlyExpenses.map((expense) => (
              <Card key={expense.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">
                        {getCategoryIcon(expense.category)}
                      </div>
                      <div>
                        {expense.note && (
                          <h4 className="font-medium text-base">{expense.note}</h4>
                        )}
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-sm text-muted-foreground">{expense.category}</span>
                          <Badge variant="secondary" className={getTypeColor(expense.type)}>
                            {expense.type}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-1">
                          <CreditCard className="h-3 w-3" />
                          <span>{expense.paymentMethod}</span>
                          <Calendar className="h-3 w-3 ml-2" />
                          <span>매월 {expense.paymentDate}일</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <p className="text-lg font-semibold">
                          {formatCurrencyWithType(expense.amount, expense.currency)}
                        </p>
                      </div>
                      
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditExpense(expense)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteExpense(expense)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground mb-4">
                등록된 월 고정지출이 없습니다.
              </p>
              <Button onClick={handleAddExpense}>
                첫 고정지출 추가하기
              </Button>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="yearly" className="space-y-3">
          {yearlyExpenses.length > 0 ? (
            yearlyExpenses.map((expense) => (
              <Card key={expense.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">
                        {getCategoryIcon(expense.category)}
                      </div>
                      <div>
                        {expense.note && (
                          <h4 className="font-medium text-base">{expense.note}</h4>
                        )}
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-sm text-muted-foreground">{expense.category}</span>
                          <Badge variant="secondary" className={getTypeColor(expense.type)}>
                            {expense.type}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-1">
                          <CreditCard className="h-3 w-3" />
                          <span>{expense.paymentMethod}</span>
                          <Calendar className="h-3 w-3 ml-2" />
                          <span>매년 {expense.paymentDate}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <p className="text-lg font-semibold">
                          {formatCurrencyWithType(expense.amount, expense.currency)}
                        </p>
                      </div>
                      
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditExpense(expense)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteExpense(expense)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground mb-4">
                등록된 연 고정지출이 없습니다.
              </p>
              <Button onClick={handleAddExpense}>
                첫 고정지출 추가하기
              </Button>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Modal */}
      <FixedExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        expense={selectedExpense}
        onSaved={handleExpenseSaved}
      />
    </div>
  );
}