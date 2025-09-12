'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Edit, Save, X, Trash2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { graphqlClient, GET_SPENDING_PLANS, CREATE_SPENDING_PLAN, UPDATE_SPENDING_PLAN, DELETE_SPENDING_PLAN, DELETE_MONTHLY_SPENDING_PLANS, GET_FIXED_EXPENSES_SUMMARY } from '@/lib/graphql';
import { formatCurrency } from '@/lib/utils';

interface SpendingPlan {
  id: string;
  year: number;
  month: number;
  salary?: number;
  category: string;
  description?: string;
  amount: number;
  createdAt: string;
}

interface SpendingPlanItem {
  id?: string;
  category: string;
  description: string;
  amount: number;
  isEditing?: boolean;
}

interface FixedExpensesSummary {
  monthlyTotal: number;
  yearlyTotal: number;
  monthlyAverageTotal: number;
  currency: string;
}

const CATEGORIES = [
  '고정비',
  '저축',
  '투자',
  '생활비',
];

export function SpendingPlanTab() {
  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  });
  
  const [plans, setPlans] = useState<SpendingPlan[]>([]);
  const [planItems, setPlanItems] = useState<SpendingPlanItem[]>([]);
  const [salary, setSalary] = useState<number>(0);
  const [fixedExpensesSummary, setFixedExpensesSummary] = useState<FixedExpensesSummary | null>(null);
  const [previousMonthSavings, setPreviousMonthSavings] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSpendingPlans();
  }, [currentDate]);

  const loadSpendingPlans = async () => {
    try {
      setIsLoading(true);
      
      // Calculate previous month
      const prevMonth = currentDate.month === 1 
        ? { year: currentDate.year - 1, month: 12 }
        : { year: currentDate.year, month: currentDate.month - 1 };
      
      // Load spending plans, fixed expenses summary, and previous month data in parallel
      const [spendingPlansData, fixedExpensesData, prevMonthData] = await Promise.all([
        graphqlClient.request<{ spendingPlans: SpendingPlan[] }>(
          GET_SPENDING_PLANS,
          {
            year: currentDate.year,
            month: currentDate.month,
          }
        ),
        graphqlClient.request<{ fixedExpensesSummary: FixedExpensesSummary }>(
          GET_FIXED_EXPENSES_SUMMARY
        ),
        graphqlClient.request<{ spendingPlans: SpendingPlan[] }>(
          GET_SPENDING_PLANS,
          {
            year: prevMonth.year,
            month: prevMonth.month,
          }
        ).catch(() => ({ spendingPlans: [] })) // Handle case where previous month data doesn't exist
      ]);
      
      const data = spendingPlansData;
      
      setPlans(data.spendingPlans);
      
      // Extract salary
      const salaryPlan = data.spendingPlans.find(p => p.salary);
      setSalary(salaryPlan?.salary || 0);
      
      // Group by category and description
      const itemsMap = new Map<string, SpendingPlanItem>();
      
      data.spendingPlans.forEach(plan => {
        if (plan.category !== '월급') { // Skip salary entries
          const key = `${plan.category}-${plan.description || ''}`;
          if (itemsMap.has(key)) {
            const existing = itemsMap.get(key)!;
            existing.amount += plan.amount;
          } else {
            itemsMap.set(key, {
              id: plan.id,
              category: plan.category,
              description: plan.description || '',
              amount: plan.amount,
            });
          }
        }
      });
      
      setPlanItems(Array.from(itemsMap.values()));
      
      // Set fixed expenses summary
      setFixedExpensesSummary(fixedExpensesData.fixedExpensesSummary);
      
      // Calculate previous month savings
      const prevMonthSavings = prevMonthData.spendingPlans
        .filter(plan => ['저축', '투자'].includes(plan.category))
        .reduce((sum, plan) => sum + plan.amount, 0);
      setPreviousMonthSavings(prevMonthSavings);
      
    } catch (error) {
      console.error('Error loading spending plans:', error);
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

  const addNewItem = () => {
    setPlanItems(prev => [...prev, {
      category: CATEGORIES[0],
      description: '',
      amount: 0,
      isEditing: true,
    }]);
  };

  const updateItem = (index: number, field: keyof SpendingPlanItem, value: any) => {
    setPlanItems(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const saveItem = async (index: number) => {
    const item = planItems[index];
    if (!item.description || item.amount < 0) {
      alert('설명을 입력하고 금액은 0 이상이어야 합니다.');
      return;
    }

    try {
      setIsSaving(true);
      
      if (item.id) {
        // Update existing
        await graphqlClient.request(UPDATE_SPENDING_PLAN, {
          id: item.id,
          input: {
            year: currentDate.year,
            month: currentDate.month,
            category: item.category,
            description: item.description,
            amount: item.amount,
          },
        });
      } else {
        // Create new
        await graphqlClient.request(CREATE_SPENDING_PLAN, {
          input: {
            year: currentDate.year,
            month: currentDate.month,
            salary: index === 0 ? salary : undefined, // Only include salary for first item
            category: item.category,
            description: item.description,
            amount: item.amount,
          },
        });
      }
      
      updateItem(index, 'isEditing', false);
      loadSpendingPlans(); // Reload to get updated data
      
    } catch (error: any) {
      console.error('Error saving spending plan:', error);
      alert(error.message || '저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const cancelEdit = (index: number) => {
    const item = planItems[index];
    if (!item.id) {
      // Remove new item
      setPlanItems(prev => prev.filter((_, i) => i !== index));
    } else {
      // Reset to original values
      updateItem(index, 'isEditing', false);
      loadSpendingPlans();
    }
  };
  const deleteItem = async (index: number) => {
    const item = planItems[index];
    if (!item.id) {
      // Remove unsaved item
      setPlanItems(prev => prev.filter((_, i) => i !== index));
      return;
    }

    if (!confirm(`"${item.description}" 항목을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      setIsSaving(true);
      
      await graphqlClient.request(DELETE_SPENDING_PLAN, {
        id: item.id,
      });
      
      loadSpendingPlans();
      
    } catch (error: any) {
      console.error('Error deleting spending plan:', error);
      alert(error.message || '삭제 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const copyFromPreviousMonth = async () => {
    const prevMonth = currentDate.month === 1 
      ? { year: currentDate.year - 1, month: 12 }
      : { year: currentDate.year, month: currentDate.month - 1 };

    try {
      setIsSaving(true);
      
      // Get previous month's data
      const data = await graphqlClient.request<{ spendingPlans: SpendingPlan[] }>(
        GET_SPENDING_PLANS,
        {
          year: prevMonth.year,
          month: prevMonth.month,
        }
      );

      if (data.spendingPlans.length === 0) {
        alert('복사할 전월 데이터가 없습니다.');
        return;
      }

      // Check if current month already has data and confirm replacement
      if (plans.length > 0) {
        if (!confirm('현재 월의 계획표를 전월 데이터로 덮어쓰시겠습니까?\n기존 데이터는 모두 삭제됩니다.')) {
          return;
        }
        
        // Delete all current month's spending plans first
        await graphqlClient.request(DELETE_MONTHLY_SPENDING_PLANS, {
          year: currentDate.year,
          month: currentDate.month,
        });
      }

      // Copy each plan item to current month
      for (const plan of data.spendingPlans) {
        await graphqlClient.request(CREATE_SPENDING_PLAN, {
          input: {
            year: currentDate.year,
            month: currentDate.month,
            salary: plan.salary,
            category: plan.category,
            description: plan.description,
            amount: plan.amount,
          },
        });
      }
      
      loadSpendingPlans();
      alert('전월 계획표가 복사되었습니다.');
      
    } catch (error: any) {
      console.error('Error copying previous month data:', error);
      alert(error.message || '전월 데이터 복사 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const saveSalary = async () => {
    try {
      setIsSaving(true);
      
      // Create or update salary entry
      await graphqlClient.request(CREATE_SPENDING_PLAN, {
        input: {
          year: currentDate.year,
          month: currentDate.month,
          salary: salary,
          category: '월급',
          description: '월급',
          amount: salary,
        },
      });
      
      loadSpendingPlans();
      
    } catch (error: any) {
      console.error('Error saving salary:', error);
      alert(error.message || '월급 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const totalSaving = planItems.filter(f => ['저축', '투자'].includes(f.category))
      .reduce((sum, item) => sum + item.amount, 0);
  const totalPlanned = planItems.reduce((sum, item) => sum + item.amount, 0);
  const fixedExpensesAmount = fixedExpensesSummary?.monthlyAverageTotal || 0;
  const totalWithFixedExpenses = totalPlanned + fixedExpensesAmount;
  const remaining = salary - totalWithFixedExpenses;
  
  // Auto-calculated living expenses
  const livingExpenses = Math.max(0, remaining); // Ensure non-negative

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      '고정비': 'bg-red-100 text-red-800',
      '저축': 'bg-green-100 text-green-800',
      '투자': 'bg-blue-100 text-blue-800',
      '생활비': 'bg-yellow-100 text-yellow-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">지출계획을 불러오는 중...</p>
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
            
            <div className="text-center min-w-[120px]">
              <h4 className="font-semibold">
                {currentDate.year}년 {currentDate.month}월
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
          
          <div className="flex space-x-2">
            <Button onClick={addNewItem}>
              <Plus className="h-4 w-4 mr-2" />
              항목 추가
            </Button>
            <Button
              variant="outline"
              onClick={copyFromPreviousMonth}
              disabled={isSaving}
            >
              <Copy className="h-4 w-4 mr-2" />
              전월 복사
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">월급</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center space-x-2">
            <Input
              type="number"
              value={salary}
              onChange={(e) => setSalary(Number(e.target.value))}
              placeholder="0"
              className="flex-1"
            />
            <Button size="sm" onClick={saveSalary} disabled={isSaving}>
              <Save className="h-3 w-3" />
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">총 저축</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(totalSaving)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              투자 포함
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">저축 증감</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${(totalSaving - previousMonthSavings) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(totalSaving - previousMonthSavings)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              전월 대비 {(totalSaving - previousMonthSavings) >= 0 ? '증가' : '감소'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">저축률</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {salary > 0 ? Math.round((totalSaving / salary) * 100) : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Spending Plan Table */}
      <Card>
        <CardHeader>
          <CardTitle>지출 계획표</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium">카테고리</th>
                  <th className="text-left p-4 font-medium">설명</th>
                  <th className="text-right p-4 font-medium">금액</th>
                  <th className="text-center p-4 font-medium">작업</th>
                </tr>
              </thead>
              <tbody>
                {planItems.map((item, index) => (
                  <tr key={index} className="border-b hover:bg-muted/25">
                    <td className="p-4">
                      {item.isEditing ? (
                        <Select
                          value={item.category}
                          onValueChange={(value) => updateItem(index, 'category', value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {CATEGORIES.map((category) => (
                              <SelectItem key={category} value={category}>
                                <span className={`inline-block w-2 h-2 rounded-full mr-2 ${getCategoryColor(category)}`} />
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="flex items-center">
                          <span className={`inline-block w-2 h-2 rounded-full mr-2 ${getCategoryColor(item.category)}`} />
                          {item.category}
                        </div>
                      )}
                    </td>
                    
                    <td className="p-4">
                      {item.isEditing ? (
                        <Input
                          value={item.description}
                          onChange={(e) => updateItem(index, 'description', e.target.value)}
                          placeholder="설명을 입력하세요"
                        />
                      ) : (
                        <span>{item.description}</span>
                      )}
                    </td>
                    
                    <td className="p-4 text-right">
                      {item.isEditing ? (
                        <Input
                          type="number"
                          value={item.amount}
                          onChange={(e) => updateItem(index, 'amount', Number(e.target.value))}
                          placeholder="0"
                          className="text-right"
                        />
                      ) : (
                        <span className="font-medium">
                          {formatCurrency(item.amount)}
                        </span>
                      )}
                    </td>
                    
                    <td className="p-4 text-center">
                      {item.isEditing ? (
                        <div className="flex items-center justify-center space-x-2">
                          <Button
                            size="sm"
                            onClick={() => saveItem(index)}
                            disabled={isSaving}
                          >
                            <Save className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => cancelEdit(index)}
                            disabled={isSaving}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateItem(index, 'isEditing', true)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteItem(index)}
                            disabled={isSaving}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                
                {/* Auto-calculated Fixed Expenses Row */}
                <tr className="border-b bg-red-50">
                  <td className="p-4">
                    <div className="flex items-center">
                      <span className="inline-block w-2 h-2 rounded-full mr-2 bg-red-100 text-red-800" />
                      고정비
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-muted-foreground">고정지출 (자동 계산)</span>
                  </td>
                  <td className="p-4 text-right">
                    <span className="font-medium text-red-600">
                      {formatCurrency(fixedExpensesAmount)}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="text-xs text-muted-foreground">수정 불가</span>
                  </td>
                </tr>
                
                {/* Auto-calculated Living Expenses Row */}
                <tr className="border-b bg-yellow-50">
                  <td className="p-4">
                    <div className="flex items-center">
                      <span className="inline-block w-2 h-2 rounded-full mr-2 bg-yellow-100 text-yellow-800" />
                      생활비
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-muted-foreground">생활비 (자동 계산)</span>
                  </td>
                  <td className="p-4 text-right">
                    <span className="font-medium text-yellow-600">
                      {formatCurrency(livingExpenses)}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="text-xs text-muted-foreground">수정 불가</span>
                  </td>
                </tr>
                
                {planItems.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-muted-foreground">
                      등록된 지출계획이 없습니다.
                      <br />
                      <Button className="mt-2" onClick={addNewItem}>
                        첫 항목 추가하기
                      </Button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}