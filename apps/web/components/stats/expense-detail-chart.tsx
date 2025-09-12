'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatCurrency } from '@/lib/utils';

interface AccountSummary {
  account: {
    id: string;
    name: string;
    code: string;
    type: string;
  };
  total: number;
}

interface ExpenseDetailChartProps {
  data: AccountSummary[];
  year: number;
  month: number;
}

const COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', 
  '#8b5cf6', '#ec4899', '#6b7280', '#14b8a6', '#f59e0b'
];

export function ExpenseDetailChart({ data, year, month }: ExpenseDetailChartProps) {
  const totalExpenses = data.reduce((sum, item) => sum + item.total, 0);

  const chartData = data.map((item, index) => ({
    name: item.account.name,
    code: item.account.code,
    value: item.total,
    percentage: totalExpenses > 0 ? (item.total / totalExpenses * 100).toFixed(1) : 0,
    color: COLORS[index % COLORS.length],
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background p-3 border rounded shadow-md">
          <p className="font-medium">[{data.code}] {data.name}</p>
          <p className="text-red-600">
            금액: {formatCurrency(data.value)}
          </p>
          <p className="text-muted-foreground">
            비율: {data.percentage}%
          </p>
        </div>
      );
    }
    return null;
  };

  if (data.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">해당 월의 비용 데이터가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row items-center gap-6">
      {/* Donut Chart */}
      <div className="w-full lg:w-1/2 h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              outerRadius={100}
              innerRadius={40}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend with Details */}
      <div className="w-full lg:w-1/2 space-y-3">
        <div className="text-center mb-4">
          <p className="text-lg font-semibold">총 비용</p>
          <p className="text-2xl font-bold text-red-600">
            {formatCurrency(totalExpenses)}
          </p>
        </div>
        
        <div className="space-y-2 max-h-[200px] overflow-y-auto">
          {chartData.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-2 rounded hover:bg-muted/50">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm font-medium">
                  [{item.code}] {item.name}
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold">
                  {formatCurrency(item.value)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {item.percentage}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}