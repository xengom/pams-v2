'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils';

interface MonthlyStats {
  month: number;
  expenses: number;
  revenues: number;
}

interface MonthlyExpenseChartProps {
  data: MonthlyStats[];
  year: number;
}

export function MonthlyExpenseChart({ data, year }: MonthlyExpenseChartProps) {
  // Ensure we have data for all 12 months
  const chartData = [];
  for (let month = 1; month <= 12; month++) {
    const monthData = data.find(d => d.month === month);
    chartData.push({
      month: `${month}월`,
      monthNumber: month,
      expenses: monthData?.expenses || 0,
    });
  }

  // Calculate cumulative data for stacked chart
  let cumulativeExpenses = 0;
  const cumulativeData = chartData.map(item => {
    cumulativeExpenses += item.expenses;
    return {
      ...item,
      cumulative: cumulativeExpenses,
    };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background p-3 border rounded shadow-md">
          <p className="font-medium">{`${year}년 ${label}`}</p>
          <p className="text-red-600">
            월 비용: {formatCurrency(payload[0]?.payload?.expenses || 0)}
          </p>
          <p className="text-blue-600">
            누적 비용: {formatCurrency(payload[0]?.payload?.cumulative || 0)}
          </p>
        </div>
      );
    }
    return null;
  };

  const maxValue = Math.max(...cumulativeData.map(d => d.cumulative));

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={cumulativeData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="month" 
            tick={{ fontSize: 12 }}
            className="text-muted-foreground"
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            className="text-muted-foreground"
            tickFormatter={(value) => `${(value / 10000).toFixed(0)}만`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="expenses" 
            fill="#dc2626"
            radius={[2, 2, 0, 0]}
            name="월별 비용"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}