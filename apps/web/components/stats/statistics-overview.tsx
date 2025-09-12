'use client';

import { useEffect, useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, BarChart3, PieChart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { graphqlClient, GET_MONTHLY_STATS, GET_ACCOUNT_SUMMARY } from '@/lib/graphql';
import { MonthlyExpenseChart } from './monthly-expense-chart';
import { MonthlyRevenueChart } from './monthly-revenue-chart';
import { ExpenseDetailChart } from './expense-detail-chart';
import { RevenueDetailChart } from './revenue-detail-chart';

interface MonthlyStats {
  month: number;
  expenses: number;
  revenues: number;
}

interface AccountSummary {
  account: {
    id: string;
    name: string;
    code: string;
    type: string;
  };
  total: number;
}

export function StatisticsOverview() {
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats[]>([]);
  const [expenseSummary, setExpenseSummary] = useState<AccountSummary[]>([]);
  const [revenueSummary, setRevenueSummary] = useState<AccountSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  });

  useEffect(() => {
    loadStatistics();
  }, [selectedDate]);

  const loadStatistics = async () => {
    try {
      setIsLoading(true);

      // Load data in parallel
      const [monthlyData, expenseData, revenueData] = await Promise.all([
        graphqlClient.request<{ monthlyStats: MonthlyStats[] }>(
          GET_MONTHLY_STATS, 
          { year: selectedDate.year }
        ),
        graphqlClient.request<{ accountSummary: AccountSummary[] }>(
          GET_ACCOUNT_SUMMARY, 
          { year: selectedDate.year, month: selectedDate.month, type: 'EXPENSE' }
        ),
        graphqlClient.request<{ accountSummary: AccountSummary[] }>(
          GET_ACCOUNT_SUMMARY, 
          { year: selectedDate.year, month: selectedDate.month, type: 'REVENUE' }
        )
      ]);

      setMonthlyStats(monthlyData.monthlyStats);
      setExpenseSummary(expenseData.accountSummary);
      setRevenueSummary(revenueData.accountSummary);
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setSelectedDate(prev => {
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">통계를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Date Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('prev')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="text-center min-w-[120px]">
            <h4 className="font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {selectedDate.year}년 {selectedDate.month}월
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

      {/* Monthly Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Expense Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-red-600" />
              비용 월별 통계 ({selectedDate.year}년)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MonthlyExpenseChart data={monthlyStats} year={selectedDate.year} />
          </CardContent>
        </Card>

        {/* Monthly Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-green-600" />
              수익 월별 통계 ({selectedDate.year}년)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MonthlyRevenueChart data={monthlyStats} year={selectedDate.year} />
          </CardContent>
        </Card>
      </div>

      {/* Detail Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Detail Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-red-600" />
              비용 상세 ({selectedDate.year}년 {selectedDate.month}월)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ExpenseDetailChart 
              data={expenseSummary} 
              year={selectedDate.year} 
              month={selectedDate.month} 
            />
          </CardContent>
        </Card>

        {/* Revenue Detail Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-green-600" />
              수익 상세 ({selectedDate.year}년 {selectedDate.month}월)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueDetailChart 
              data={revenueSummary} 
              year={selectedDate.year} 
              month={selectedDate.month} 
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}